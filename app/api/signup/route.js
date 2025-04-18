// app/api/signup/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import axios from 'axios';

// ======================
// HELPER FUNCTIONS
// ======================

const formatAlertMessage = (title, details) => {
  return `🔔 PLAY MAKERS ARMA ALERT 🔔\n══════════════════════════\n🏷️ ${title}\n📝 ${details}`;
};

const generatePmaId = async () => {
  try {
    console.log('[ID Generation] Starting PMA ID generation...');
    const result = await query('SELECT MAX(pma_id) AS max_id FROM pma_member_info');
    const maxId = result.rows[0]?.max_id || 'M00PMA';
    console.log(`[ID Generation] Current max ID: ${maxId}`);

    const numericPart = parseInt(maxId.match(/\d+/)[0]) || 0;
    const nextId = numericPart + 1;
    const newId = `M${String(nextId).padStart(2, '0')}PMA`;
    
    console.log(`[ID Generation] Generated new ID: ${newId}`);
    return newId;
  } catch (error) {
    console.error('[ID Generation] Critical Error:', {
      error: error.message,
      stack: error.stack
    });
    logger.error('ID Generation Failed', { 
      meta: { 
        error: error.message,
        stack: error.stack,
        taskName: 'Member Signup'
      } 
    });
    throw new Error(`ID generation failed: ${error.message}`);
  }
};

const saveProfilePhoto = async (file, pmaId) => {
  const filename = `${pmaId}_PROFILE_PHOTO${path.extname(file.name)}`;
  const targetPath = path.join('/home/play-makers-arena/public/storage/member_profile_photo', filename);

  try {
    //console.log('Saving profile photo...');
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    logger.info('Profile Photo Saved', {
      meta: {
        pmaId,
        filePath: targetPath,
        size: file.size,
        taskName: 'Member Signup',
        details: 'Profile photo saved successfully' // Added details
      }
    });
    //console.log(`Profile photo saved at: ${targetPath}`);
    return `/storage/member_profile_photo/${filename}`;
  } catch (error) {
    logger.error('Profile Photo Save Failed', {
      meta: {
        pmaId,
        error: error.message,
        stack: error.stack,
        taskName: 'Member Signup',
        details: `File save failed - ${error.message}` // Added details
      }
    });
    //console.error('Failed to save profile photo:', error.message);
    throw new Error(`Failed to save profile photo: ${error.message}`);
  }
};

const verifyRecaptcha = async (token) => {
  try {
    console.log('[Security] Starting reCAPTCHA verification...');
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
    );

    console.log('[Security] reCAPTCHA Response:', {
      success: response.data.success,
      score: response.data.score,
      hostname: response.data.hostname
    });

    if (!response.data.success) {
      console.warn('[Security] reCAPTCHA Failed:', {
        errors: response.data['error-codes']
      });
    }
    
    return response.data.success;
  } catch (error) {
    console.error('[Security] reCAPTCHA Error:', {
      error: error.message,
      stack: error.stack
    });
    logger.error('reCAPTCHA Verification Failed', {
      meta: {
        error: error.message,
        stack: error.stack,
        taskName: 'reCAPTCHA Check'
      }
    });
    return false;
  }
};

// ======================
// MAIN HANDLER
// ======================

export async function POST(req) {
  const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown UA';
  let transactionStarted = false;
  let pmaId = null;

  console.log('[Request] Incoming signup request:', {
    ip: ipAddress,
    userAgent: userAgent.slice(0, 50) + '...'
  });

  try {
    // ======================
    // INITIAL VALIDATION
    // ======================
    const formData = await req.formData();
    console.log('[Request] Form data received');

    // reCAPTCHA Verification
    const recaptchaToken = formData.get('recaptchaToken');
    if (!await verifyRecaptcha(recaptchaToken)) {
      console.warn('[Security] Blocked invalid reCAPTCHA:', { ipAddress });
      await sendTelegramAlert(formatAlertMessage(
        '🚨 BLOCKED SIGNUP ATTEMPT',
        `IP: ${ipAddress}\nREASON: Invalid reCAPTCHA`
      ));
      return NextResponse.json(
        { message: 'Security verification failed' }, 
        { status: 400 }
      );
    }

    // ======================
    // DATA PROCESSING
    // ======================
    const requiredFields = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
      dob: formData.get('dob'),
      nid: formData.get('nid'),
      email: formData.get('email'),
      password: formData.get('password'),
      termsAccepted: formData.get('termsAccepted')
    };

    console.log('[Validation] Received fields:', Object.keys(requiredFields));

    // Field Validation
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      console.warn('[Validation] Missing fields:', missingFields);
      await sendTelegramAlert(formatAlertMessage(
        '❌ INCOMPLETE SUBMISSION',
        `IP: ${ipAddress}\nMISSING FIELDS: ${missingFields.join(', ')}`
      ));
      return NextResponse.json({ 
        message: 'Missing required fields: ' + missingFields.join(', ') 
      }, { status: 400 });
    }

    // ======================
    // DATABASE OPERATIONS
    // ======================
    console.log('[Database] Starting transaction...');
    await query('BEGIN');
    transactionStarted = true;

    // Generate PMA ID
    pmaId = await generatePmaId();
    console.log('[Database] Generated PMA ID:', pmaId);

    // Duplicate Check
    console.log('[Database] Checking for duplicates...');
    const duplicateChecks = ['email', 'phone', 'nid'];
    for (const field of duplicateChecks) {
      const result = await query(
        `SELECT pma_id FROM pma_member_info WHERE ${field} = $1`,
        [requiredFields[field]]
      );
      
      if (result.rows.length > 0) {
        console.warn('[Database] Duplicate found:', { field, value: requiredFields[field] });
        await query('ROLLBACK');
        return NextResponse.json({ 
          message: `${field} already exists in our system` 
        }, { status: 409 });
      }
    }

    // ======================
    // FILE HANDLING
    // ======================
    const profileFile = formData.get('profile');
    let profileUrl = '/default-profile.png';

    if (profileFile) {
      console.log('[File Handling] Processing profile photo...');
      if (!profileFile.type.startsWith('image/')) {
        console.warn('[File Handling] Invalid file type:', profileFile.type);
        await query('ROLLBACK');
        return NextResponse.json({ 
          message: 'Only image files are allowed for profile photos' 
        }, { status: 400 });
      }

      profileUrl = await saveProfilePhoto(profileFile, pmaId);
      console.log('[File Handling] Profile photo saved:', profileUrl);
    }

    // ======================
    // FINAL COMMIT
    // ======================
    console.log('[Database] Inserting member record...');
    const hashedPassword = await bcrypt.hash(requiredFields.password, 10);
    
    await query(
      `INSERT INTO pma_member_info (
        pma_id, first_name, last_name, phone, dob, nid, email,
        password, profile_image, terms_accepted
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        pmaId,
        requiredFields.firstName,
        requiredFields.lastName,
        requiredFields.phone,
        new Date(requiredFields.dob),
        requiredFields.nid,
        requiredFields.email,
        hashedPassword,
        profileUrl,
        requiredFields.termsAccepted === 'true'
      ]
    );

    console.log('[Database] Creating notification...');
    await query(
      `INSERT INTO pma_notification_details 
      (id, title, status, date) 
      VALUES ($1, $2, 'Unread', NOW())`,
      [pmaId, `New member registration: ${pmaId}`]
    );

    await query('COMMIT');
    transactionStarted = false;
    console.log('[Database] Transaction committed successfully');

    // ======================
    // SUCCESS HANDLING
    // ======================
    console.log('[Success] Registration complete for:', pmaId);
    await sendTelegramAlert(formatAlertMessage(
      '🎉 NEW MEMBER REGISTERED',
      `ID: ${pmaId}\nNAME: ${requiredFields.firstName} ${requiredFields.lastName}\nEMAIL: ${requiredFields.email}`
    ));

    return NextResponse.json({
      success: true,
      pmaId,
      message: 'Registration successful! Welcome to the community!'
    }, { status: 201 });

  } catch (error) {
    // ======================
    // ERROR HANDLING
    // ======================
    console.error('[ERROR] Critical Failure:', {
      error: error.message,
      stack: error.stack,
      pmaId,
      transactionStatus: transactionStarted ? 'Pending' : 'Completed'
    });

    if (transactionStarted) {
      console.warn('[Database] Attempting rollback...');
      await query('ROLLBACK').catch(rollbackError => {
        console.error('[Database] Rollback failed:', rollbackError.message);
      });
    }

    await sendTelegramAlert(formatAlertMessage(
      '🔥 SYSTEM ERROR',
      `ERROR: ${error.message}\nIP: ${ipAddress}\nUSER AGENT: ${userAgent.slice(0, 30)}...`
    ));

    return NextResponse.json({
      message: 'An unexpected error occurred. Our team has been notified.',
      referenceId: crypto.randomUUID()
    }, { status: 500 });
  }
}