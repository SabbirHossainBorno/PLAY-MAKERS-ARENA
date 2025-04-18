// app/api/logout/route.js
import { NextResponse } from 'next/server';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import { query } from '../../../lib/db';

const formatAlertMessage = (userType, email, ipAddress, userAgent, pma_id = '', eid = '', sid = '') => {
  const header = `🔐 ${userType} Logout Notification 🔐\n`;
  const userDetails = `
▫️ User Type : ${userType}
▫️ ${userType === 'Admin' ? 'Admin ID' : 'Member ID'} : ${pma_id || 'N/A'}
▫️ Email : ${email}
▫️ EID : ${eid?.split('-')[0] || 'N/A'}`;

  const sessionDetails = `
🔧 Session Info
▫️ IP Address : ${ipAddress}
▫️ User Agent : ${userAgent}
▫️ SID : ${sid || 'N/A'}
▫️ Timestamp : ${new Date().toISOString()}`;

  return `\`\`\`\n${header}${userDetails}${sessionDetails}\n\`\`\``;
};

const updateAdminLogout = async (email, eid, sid) => {
  try {
    const result = await query(
      `UPDATE pma_admin_info 
       SET login_status = 'IDLE', 
           last_logout = NOW() 
       WHERE email = $1
       RETURNING pma_id, login_count`,
      [email]
    );

    if (result.rowCount === 0) {
      logger.error('Admin not found during logout', {
        meta: {
          eid,
          sid,
          taskName: 'AdminLogout',
          severity: 'HIGH',
          details: `No admin found with email: ${email}`
        }
      });
      throw new Error('Admin account not found');
    }

    logger.info('Admin logout processed', {
      meta: {
        eid,
        sid,
        taskName: 'AdminLogout',
        details: `Updated login status for admin: ${email}`,
        pma_id: result.rows[0].pma_id,
        login_count: result.rows[0].login_count
      }
    });

    return result.rows[0].pma_id;

  } catch (error) {
    logger.error('Admin logout failure', {
      meta: {
        eid,
        sid,
        taskName: 'AdminLogoutError',
        severity: 'CRITICAL',
        details: error.message,
        stack: error.stack
      }
    });
    throw error;
  }
};

const updateMemberLogout = async (email, eid, sid) => {
  try {
    const result = await query(
      `UPDATE pma_member_info 
       SET login_status = 'IDLE', 
           last_logout = NOW() 
       WHERE email = $1
       RETURNING pma_id, login_count`,
      [email]
    );

    if (result.rowCount === 0) {
      logger.error('Member not found during logout', {
        meta: {
          eid,
          sid,
          taskName: 'MemberLogout',
          severity: 'MEDIUM',
          details: `No member found with email: ${email}`
        }
      });
      throw new Error('Member account not found');
    }

    logger.info('Member logout processed', {
      meta: {
        eid,
        sid,
        taskName: 'MemberLogout',
        details: `Updated login status for member: ${email}`,
        pma_id: result.rows[0].pma_id,
        login_count: result.rows[0].login_count
      }
    });

    return result.rows[0].pma_id;

  } catch (error) {
    logger.error('Member logout failure', {
      meta: {
        eid,
        sid,
        taskName: 'MemberLogoutError',
        severity: 'HIGH',
        details: error.message,
        stack: error.stack
      }
    });
    throw error;
  }
};

export async function POST(request) {
  const cookies = request.cookies;
  const email = cookies.get('email')?.value;
  const sid = cookies.get('sessionId')?.value;
  const eid = cookies.get('eid')?.value;
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  // Initial request logging
  logger.info('Logout initiated', {
    meta: {
      eid,
      sid,
      taskName: 'LogoutInit',
      details: `Logout request received from IP: ${ipAddress}`,
      hasEmail: !!email
    }
  });

  if (!email) {
    logger.warn('Invalid logout attempt', {
      meta: {
        eid,
        sid,
        taskName: 'InvalidLogout',
        severity: 'MEDIUM',
        details: 'Missing email cookie in logout request',
        ipAddress
      }
    });
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const userType = email.endsWith('@pma.com') ? 'Admin' : 'Member';
    let pma_id = '';

    logger.info(`${userType} logout starting`, {
      meta: {
        eid,
        sid,
        taskName: 'LogoutProcess',
        details: `Processing logout for ${userType}: ${email}`,
        ipAddress
      }
    });

    // Update database records
    pma_id = userType === 'Admin' 
      ? await updateAdminLogout(email, eid, sid)
      : await updateMemberLogout(email, eid, sid);

    // Send Telegram alert
    const alertMessage = formatAlertMessage(userType, email, ipAddress,userAgent, pma_id, eid, sid);
    await sendTelegramAlert(alertMessage);

    logger.info(`${userType} logout successful`, {
      meta: {
        eid,
        sid,
        taskName: 'LogoutSuccess',
        details: `Completed logout for ${userType}: ${email}`,
        pma_id,
        ipAddress
      }
    });

    // Clear all auth cookies
    const response = NextResponse.json(
      { success: true, message: 'Logout successful' },
      { status: 200 }
    );

    ['email', 'sessionId', 'eid', 'id', 'type', 'redirect', 'lastActivity'].forEach(name => {
      response.cookies.delete(name);
    });

    // Additional cleanup for admins
    if (userType === 'Admin') {
      ['adminToken', 'privilegeLevel'].forEach(name => {
        response.cookies.delete(name);
      });
    }

    return response;

  } catch (error) {
    logger.error('Logout process failed', {
      meta: {
        eid,
        sid,
        taskName: 'LogoutFailure',
        severity: 'CRITICAL',
        details: error.message,
        stack: error.stack,
        ipAddress,
        email
      }
    });

    return NextResponse.json(
      { 
        success: false, 
        message: 'Logout failed. Please try again or contact support.' 
      },
      { status: 500 }
    );
  }
}