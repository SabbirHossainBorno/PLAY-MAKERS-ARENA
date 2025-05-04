// app/api/booking-history/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, email, ipAddress, userAgent, additionalInfo = '') => {
  return `PLAY MAKER ARENA BOOKING HISTORY\n--------------------------------------------------\n${title}\nEmail : ${email}\nIP : ${ipAddress}\nDevice INFO : ${userAgent}${additionalInfo}`;
};

export async function GET(request) {
  const sessionId = request.cookies.get('sessionId')?.value || '';
  const eid = request.cookies.get('eid')?.value || '';
  const email = request.cookies.get('email')?.value || '';
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown UA';

  try {
    // Authentication check
    if (!email || !eid) {
      logger.warn('Unauthorized booking history access', {
        meta: {
          sid: sessionId,
          eid: eid,
          taskName: 'BookingHistoryAuth',
          details: 'Missing authentication cookies'
        }
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get member ID first
    const memberResult = await query(
      `SELECT pma_id FROM pma_member_info WHERE email = $1`,
      [email]
    );

    if (memberResult.rows.length === 0) {
      logger.error('Member not found for booking history', {
        meta: {
          sid: sessionId,
          eid: eid,
          taskName: 'BookingHistoryData',
          details: `Email: ${email}`
        }
      });
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const pmaId = memberResult.rows[0].pma_id;

    // Get booking history
    const bookingHistory = await query(
      `SELECT 
        bi.booking_id,
        bi.booking_date,
        bi.created_at,
        bi.slot_id,
        th.transaction_id,
        th.amount,
        th.payment_method,
        th.status as payment_status,
        th.bank_tran_id
      FROM pma_booking_info bi
      LEFT JOIN pma_transactions_history th 
        ON bi.transaction_id = th.transaction_id
      WHERE bi.pma_id = $1
      ORDER BY bi.created_at DESC`,
      [pmaId]
    );

    // Get slot details for each booking
    const bookingsWithSlots = await Promise.all(
      bookingHistory.rows.map(async (booking) => {
        const slots = await query(
          `SELECT slot_name, slot_timing, price, offer_price 
           FROM pma_booking_slots 
           WHERE slot_id = ANY($1)`,
          [booking.slot_id]
        );

        return {
          ...booking,
          slots: slots.rows,
          total: slots.rows.reduce((sum, slot) => 
            sum + (slot.offer_price || slot.price), 0)
        };
      })
    );

    logger.info('Booking history retrieved', {
      meta: {
        sid: sessionId,
        eid: eid,
        taskName: 'BookingHistoryData',
        details: `Fetched ${bookingsWithSlots.length} bookings for ${email}`
      }
    });

    sendTelegramAlert(formatAlertMessage(
      'Booking History Accessed',
      email,
      ipAddress,
      userAgent,
      `\nMemberID : ${pmaId}\nBookings Found: ${bookingsWithSlots.length}`
    ));

    return NextResponse.json({
      success: true,
      data: bookingsWithSlots,
      eid: eid,
      ipAddress,
      userAgent
    });

  } catch (error) {
    logger.error('Booking History API error', {
      meta: {
        sid: sessionId,
        eid: eid,
        taskName: 'BookingHistoryAPI',
        details: error.message
      }
    });

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}