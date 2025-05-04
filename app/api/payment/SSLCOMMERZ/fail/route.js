//app/api/payment/SSLCOMMERZ/fail/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import logger from '../../../../../lib/logger';
import sendTelegramAlert from '../../../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `PLAY MAKERS ARENA\n--------------------------\n${title}\n${details}`;
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const params = Object.fromEntries(searchParams.entries());
  const ipAddress = req.headers.get('x-forwarded-for') || 'Unknown IP';

  try {
    await query(
      `INSERT INTO pma_transactions_history (
        transaction_id, status, sslcommerz_data
      ) VALUES ($1, $2, $3)`,
      [params.tran_id, 'FAILED', JSON.stringify(params)]
    );

    logger.warn('PaymentFailed', {
      meta: {
        tran_id: params.tran_id,
        error: params.error,
        ip: ipAddress,
        taskName: 'PaymentFailure'
      }
    });

    await sendTelegramAlert(formatAlertMessage('❌ Payment Failed', 
      `💳 ID: ${params.tran_id}\n🌐 IP: ${ipAddress}\n📛 Error: ${params.error}`));

    return NextResponse.redirect(
      `${process.env.BASE_URL}/member_dashboard/bookings?payment=failed`
    );

  } catch (error) {
    logger.error('PaymentFailureHandling', {
      meta: {
        tran_id: params.tran_id,
        error: error.message,
        taskName: 'PaymentFailure',
        stack: error.stack?.split('\n')
      }
    });

    return NextResponse.redirect(
      `${process.env.BASE_URL}/member_dashboard/bookings?payment=error`
    );
  }
}