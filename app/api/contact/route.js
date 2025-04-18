// app/api/contact/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
    return `PLAY MAKERS ARENA\n--------------------------\n${title}\n${details}`;
};

const generateMessageId = async () => {
  try {
    const result = await query('SELECT MAX(id) AS max_id FROM pma_contact_messages');
    const maxId = result.rows[0]?.max_id || 'MSG00PMA';
    const numericPart = parseInt(maxId.substring(3, 5), 10) || 0;
    const nextId = numericPart + 1;
    return `MSG${String(nextId).padStart(2, '0')}PMA`;
  } catch (error) {
    throw new Error(`Error generating Message ID: ${error.message}`);
  }
};

export async function POST(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || remoteAddr || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const { name, email, subject, message } = await request.json();
    
    // Enhanced input validation
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      const errorDetails = {
        missingFields: {
          name: !name?.trim(),
          email: !email?.trim(),
          subject: !subject?.trim(),
          message: !message?.trim()
        },
        receivedData: { name, email, subject, message: message?.slice(0, 50) + (message?.length > 50 ? '...' : '') }
      };

      await sendTelegramAlert(formatAlertMessage('Contact Form Error',
        `IP: ${ipAddress}\nError: Missing required fields\nDetails: ${JSON.stringify(errorDetails)}`));

      logger.warn('Contact form validation failed', {
        meta: {
          taskName: 'Contact Form',
          details: {
            error: 'Missing required fields',
            ip: ipAddress,
            userAgent,
            validation: errorDetails,
            receivedPayload: { name, email, subject, message: message?.length }
          }
        }
      });

      return NextResponse.json(
        { success: false, message: 'All fields are required' }, 
        { status: 400 }
      );
    }

    const messageId = await generateMessageId();
    
    // Insert with full details return
    const result = await query(
      `INSERT INTO pma_contact_messages (id, name, email, subject, message, date)
      VALUES ($1, $2, $3, $4, $5, NOW() AT TIME ZONE 'Asia/Dhaka')
      RETURNING serial, date, subject`,
      [messageId, name, email, subject, message]
    );

    const { serial, date, subject: dbSubject } = result.rows[0];

    // Notification insertion
    const notificationTitle = `PLAY MAKERS ARENA Got New Message [${messageId}]`;
    const notificationStatus = 'Unread';
    console.log('Inserting notification for new message...');
    await query(
    'INSERT INTO pma_notification_details (id, title, status, date) VALUES ($1, $2, $3, NOW() AT TIME ZONE \'Asia/Dhaka\') RETURNING serial',
    [messageId, notificationTitle, notificationStatus]
    );

    // Detailed success logging
    const successDetails = {
      messageId,
      name: name.substring(0, 1) + '*'.repeat(name.length - 1), // Anonymize name
      email: email.replace(/(.{2}).+@(.+)/, '$1***@$2'), // Partial email
      subject: dbSubject,
      messageLength: message.length,
      receivedAt: date,
      ip: ipAddress,
      userAgent
    };
    

    await sendTelegramAlert(formatAlertMessage('New Contact Message',
      `ID: ${messageId}
      Time: ${new Date(date).toLocaleString()}
      From: ${name}
      Email: ${email}
      Subject: ${dbSubject}
      IP: ${ipAddress}
      Agent: ${userAgent?.substring(0, 50)}`));

    logger.info('Contact message processed', {
      meta: {
        taskName: 'Contact Form',
        details: {
          status: 'success',
          messageId,
          serial,
          timing: {
            receivedAt: date,
            processedIn: `${Date.now() - new Date(date).getTime()}ms`
          },
          contactInfo: successDetails,
          systemInfo: {
            ip: ipAddress,
            userAgent: userAgent?.substring(0, 100)
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      messageId,
      receivedAt: date
    });

  } catch (error) {
    // Detailed error logging
    const errorDetails = {
      errorMessage: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join(' | '),
      code: error.code,
      receivedPayload: {
        name: name?.length,
        email: email?.length,
        subject: subject?.length,
        message: message?.length
      },
      systemInfo: {
        ip: ipAddress,
        userAgent: userAgent?.substring(0, 100),
        timestamp: new Date().toISOString()
      }
    };

    await sendTelegramAlert(formatAlertMessage('Contact Form Error',
      `IP: ${ipAddress}
      Error: ${error.message}
      Code: ${error.code || 'N/A'}
      Payload: ${JSON.stringify(errorDetails.receivedPayload)}`));

    logger.error('Contact form processing failed', {
      meta: {
        taskName: 'Contact Form',
        details: {
          status: 'error',
          error: errorDetails,
          diagnosticInfo: {
            databaseConnection: !!getDbConnection(),
            tableExists: await checkTableExists('pma_contact_messages')
          }
        }
      }
    });

    return NextResponse.json(
      { success: false, message: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// Add helper function
async function checkTableExists(tableName) {
  try {
    const result = await query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)",
      [tableName]
    );
    return result.rows[0]?.exists || false;
  } catch {
    return false;
  }
}