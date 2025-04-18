// app/api/login/route.js
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (userType, email, ipAddress, userAgent, pma_id = '', eid = '', sid = '') => {
  const header = `🔓 ${userType} Login Notification 🔓\n`;
  const userDetails = `
▫️ User Type : ${userType}
▫️ ${userType === 'Admin' ? 'Admin ID' : 'Member ID'} : ${pma_id || 'N/A'}
▫️ Email : ${email}`;

  const sessionDetails = `
🔧 Session Info
▫️ IP : ${ipAddress}
▫️ User Agent : ${userAgent}
▫️ SID : ${sid || 'N/A'}
▫️ EID : ${eid?.split('-')[0] || 'N/A'}`;

  return `\`\`\`\n${header}${userDetails}${sessionDetails}\n\`\`\``;
};

const handleAdminLogin = async (email, password, sid) => {
  try {
    const result = await query(
      `SELECT * FROM pma_admin_info WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      logger.warn('Admin not found', {
        meta: {
          sid,
          taskName: 'AdminAuth',
          details: `No admin found for email: ${email}`
        }
      });
      return null;
    }

    const admin = result.rows[0];
    if (password !== admin.password) {
      logger.warn('Admin password mismatch', {
        meta: {
          sid,
          taskName: 'AdminAuth',
          details: `Invalid password for admin: ${email}`
        }
      });
      return null;
    }

    await query(
      `UPDATE pma_admin_info 
       SET login_status = 'ACTIVE', 
           last_login = NOW(), 
           login_count = login_count + 1 
       WHERE email = $1`,
      [email]
    );

    logger.info('Admin login processed', {
      meta: {
        sid,
        taskName: 'AdminLogin',
        details: `Successful login for admin: ${email}`,
        pma_id: admin.pma_id,
        login_count: admin.login_count + 1
      }
    });

    return {
      pma_id: admin.pma_id,
      type: 'Admin',
      userData: admin
    };

  } catch (error) {
    logger.error('Admin login failure', {
      meta: {
        sid,
        taskName: 'AdminLoginError',
        details: error.message,
        stack: error.stack
      }
    });
    throw error;
  }
};

const handleMemberLogin = async (email, password, sid) => {
  try {
    const result = await query(
      `SELECT * FROM pma_member_info WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      logger.warn('Member not found', {
        meta: {
          sid,
          taskName: 'MemberAuth',
          details: `No member found for email: ${email}`
        }
      });
      return null;
    }

    const member = result.rows[0];
    const passwordValid = await bcrypt.compare(password, member.password);
    
    if (!passwordValid) {
      logger.warn('Member password mismatch', {
        meta: {
          sid,
          taskName: 'MemberAuth',
          details: `Invalid password for member: ${email}`
        }
      });
      return null;
    }

    if (member.status !== 'Active') {
      logger.warn('Inactive member login attempt', {
        meta: {
          sid,
          taskName: 'MemberStatus',
          details: `Inactive member: ${email}`
        }
      });
      return { inactive: true };
    }

    await query(
      `UPDATE pma_member_info 
       SET login_status = 'ACTIVE', 
           last_login = NOW(), 
           login_count = login_count + 1 
       WHERE pma_id = $1`,
      [member.pma_id]
    );

    logger.info('Member login processed', {
      meta: {
        sid,
        taskName: 'MemberLogin',
        details: `Successful login for member: ${email}`,
        pma_id: member.pma_id,
        login_count: member.login_count + 1
      }
    });

    return {
      pma_id: member.pma_id,
      type: member.type,
      userData: member
    };

  } catch (error) {
    logger.error('Member login failure', {
      meta: {
        sid,
        taskName: 'MemberLoginError',
        details: error.message,
        stack: error.stack
      }
    });
    throw error;
  }
};

export async function POST(request) {
  const { email, password } = await request.json();
  const sid = uuidv4();
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';
  const isAdminEmail = email.endsWith('@pma.com');

  // Initial login attempt logging
  logger.info('Login attempt initiated', {
    meta: {
      sid,
      taskName: 'LoginInit',
      details: `Login attempt for ${email} from ${ipAddress}`,
      userType: isAdminEmail ? 'Admin' : 'Member'
    }
  });

  try {
    let user, eid, response;
    
    if (isAdminEmail) {
      user = await handleAdminLogin(email, password, sid);
    } else {
      user = await handleMemberLogin(email, password, sid);
    }

    // Handle authentication results
    if (!user) {
      const errorMessage = formatAlertMessage(
        isAdminEmail ? 'Admin' : 'Member',
        email,
        ipAddress,
        userAgent,
        '',
        'FAILED-' + sid,
        sid
      );
      await sendTelegramAlert(errorMessage);
      
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.inactive) {
      const inactiveMessage = formatAlertMessage(
        'Member',
        email,
        ipAddress,
        userAgent,
        '',
        'INACTIVE-' + sid,
        sid
      );
      await sendTelegramAlert(inactiveMessage);
      
      return NextResponse.json(
        { success: false, message: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Generate EID for successful login
    eid = `${Math.floor(100000 + Math.random() * 900000)}-PMA`;
    
    // Successful login alert
    const successMessage = formatAlertMessage(
      isAdminEmail ? 'Admin' : 'Member',
      email,
      ipAddress,
      userAgent,
      user.pma_id,
      eid,
      sid
    );
    await sendTelegramAlert(successMessage);

    // Set cookies
    response = NextResponse.json(
      { 
        success: true, 
        userType: user.type,
        redirect: user.type === 'Admin' ? '/admin_dashboard' : '/member_dashboard'
      },
      { status: 200 }
    );

    const cookieConfig = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 3600 // 1 hour
    };

    response.cookies.set('email', email, cookieConfig);
    response.cookies.set('sessionId', sid, cookieConfig);
    response.cookies.set('eid', eid, cookieConfig);
    response.cookies.set('pma_id', user.pma_id, cookieConfig);
    response.cookies.set('userType', user.type, cookieConfig);

    // Additional admin cookies
    if (isAdminEmail) {
      response.cookies.set('adminToken', uuidv4(), {
        ...cookieConfig,
        maxAge: 7200 // 2 hours
      });
    }

    logger.info('Login completed successfully', {
      meta: {
        eid,
        sid,
        taskName: 'LoginSuccess',
        details: `Session established for ${email}`,
        userType: user.type,
        pma_id: user.pma_id
      }
    });

    return response;

  } catch (error) {
    const errorMessage = formatAlertMessage(
      isAdminEmail ? 'Admin' : 'Member',
      email,
      ipAddress,
      userAgent,
      '',
      'ERROR-' + sid,
      sid
    );
    await sendTelegramAlert(errorMessage);

    logger.error('Login process failed', {
      meta: {
        sid,
        taskName: 'LoginFailure',
        details: error.message,
        stack: error.stack,
        email
      }
    });

    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    );
  }
}