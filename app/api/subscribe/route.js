// app/api/subscribe/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import { generateToken, sendConfirmationEmail } from '../../../lib/email';

const formatAlertMessage = (title, details) => {
  return `PLAY MAKERS ARENA\n--------------------------\n${title}\n${details}`;
};

const generateSubscriberId = async () => {
  try {
    console.log('Generating new subscriber ID...');
    const result = await query('SELECT MAX(id) AS max_id FROM pma_subscriber_list');
    console.log('Query result for max ID:', result.rows);
    const maxId = result.rows[0]?.max_id || 'SUB00PMA';
    const numericPart = parseInt(maxId.substring(3, 5), 10) || 0;
    const nextId = numericPart + 1;
    const formattedId = `SUB${String(nextId).padStart(2, '0')}PMA`;
    console.log('Generated subscriber ID:', formattedId);
    return formattedId;
  } catch (error) {
    console.error('Error generating Subscriber ID:', error);
    throw new Error(`Error generating Subscriber ID: ${error.message}`);
  }
};

export async function POST(request) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    console.log('Received subscription request from IP:', ipAddress, 'with User-Agent:', userAgent);
    const { email } = await request.json();
    console.log('Subscription email:', email);

    if (!email) {
      const message = 'Email is required';
      await sendTelegramAlert(formatAlertMessage('❌ Subscription Error', `🌐 IP : ${ipAddress}\n🛑 Error: ${message}`));
      logger.warn('Subscription error', {
        meta: {
          eid: '',
          sid: '',
          taskName: 'Home - Subscribe',
          details: `Subscription error: ${message} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    console.log('Checking if email already exists...');
    const checkResult = await query('SELECT email FROM pma_subscriber_list WHERE email = $1', [email]);
    console.log('Check result:', checkResult.rows);

    if (checkResult.rows.length > 0) {
      const logMessage = `You are already a subscriber. \n📧 Email : ${email}`;
      const userMessage = 'You are already a subscriber.';
      await sendTelegramAlert(formatAlertMessage('❌ Subscription Failed', `🌐 IP : ${ipAddress}\n🛑 Error : ${logMessage}`));
      logger.warn('Subscription error', {
        meta: {
          eid: '',
          sid: '',
          taskName: 'Home - Subscribe',
          details: `Subscription error : ${logMessage} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
      return NextResponse.json({ success: false, message: userMessage }, { status: 400 });
    }

    const subscriberId = await generateSubscriberId();
    console.log('Inserting new subscriber with ID:', subscriberId);

    const confirmationToken = generateToken();
    console.log('Confirmation token:', confirmationToken);

    const confirmationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    console.log('confirmationExpires:',confirmationExpires);



    const result = await query(
      `INSERT INTO pma_subscriber_list 
      (id, email, confirmation_token, confirmation_expires, date) 
      VALUES ($1, $2, $3, $4, NOW()) 
      RETURNING serial`,
      [subscriberId, email, confirmationToken, confirmationExpires]
    );
    console.log('Insert result:', result.rows);

    // Send confirmation email
    await sendConfirmationEmail(email, confirmationToken);

    const { serial } = result.rows[0];
    const notificationTitle = `PLAY MAKERS ARENA Got New Subscriber [${subscriberId}] - Pending`;
    const notificationStatus = 'Unread';
    console.log('Inserting notification for new subscriber...');
    await query('INSERT INTO pma_notification_details (id, title, status, date) VALUES ($1, $2, $3, NOW()) RETURNING serial', [subscriberId, notificationTitle, notificationStatus]);

    await sendTelegramAlert(formatAlertMessage('🎉 New Subscriber', `🔗 ID : ${subscriberId}\n📧 Email : ${email}`));
    logger.info('New subscriber added', {
      meta: {
        eid: '',
        sid: '',
        taskName: 'Home - Subscribe',
        details: `New subscriber added with ID ${subscriberId} and email ${email} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    console.log('Subscription successful for email:', email);
    return NextResponse.json({ 
      success: true, 
      message: 'Confirmation email sent! Please check your inbox.',
      serial 
    });
  } catch (error) {
    const errorMessage = `Database error: ${error.message}`;
    console.error('Database error:', error);
    await sendTelegramAlert(formatAlertMessage('❌ Subscription Error', `🌐 IP : ${ipAddress}\n🛑 Error : ${errorMessage}`));
    logger.error('Database error', {
      meta: {
        eid: '',
        sid: '',
        taskName: 'Home - Subscribe',
        details: `Database error: ${error.message} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });
    return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
  }
}