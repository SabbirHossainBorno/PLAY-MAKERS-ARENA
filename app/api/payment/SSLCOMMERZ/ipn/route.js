//app/api/payment/SSLCOMMERZ/ipn/route.js

import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import logger from '../../../../../lib/logger';
import sendTelegramAlert from '../../../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `PLAY MAKERS ARENA\n--------------------------\n${title}\n${details}`;
};

export async function POST(req) {
  const params = await req.json();

  try {
    // Check if transaction already processed
    const existing = await query(
      'SELECT * FROM pma_transactions_history WHERE transaction_id = $1',
      [params.tran_id]
    );

    if(existing.rows.length > 0) {
      return NextResponse.json({ status: 'ALREADY_PROCESSED' });
    }

    // Validate with SSLCommerz
    const validationRes = await fetch(
      `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php`,
      {
        method: 'POST',
        body: JSON.stringify({
          tran_id: params.tran_id,
          store_id: process.env.SSL_STORE_ID,
          store_passwd: process.env.SSL_STORE_PASSWORD
        })
      }
    );

    const validationData = await validationRes.json();

    if(validationData.status !== 'VALID') {
      throw new Error('IPN validation failed');
    }

    // Insert transaction
    await query(
      `INSERT INTO pma_transactions_history (
        transaction_id, status, sslcommerz_data
      ) VALUES ($1, $2, $3)`,
      [
        params.tran_id,
        validationData.status,
        JSON.stringify(validationData)
      ]
    );

    logger.info('IPN processed', {
      meta: {
        tran_id: params.tran_id,
        taskName: 'IPN Processing',
        details: `Status: ${validationData.status}`
      }
    });

    return NextResponse.json({ status: 'IPN_RECEIVED' });

  } catch (error) {
    logger.error('IPN processing error', {
      meta: {
        tran_id: params.tran_id,
        taskName: 'IPN Processing',
        details: error.message
      }
    });

    await sendTelegramAlert(formatAlertMessage('❌ IPN Error', 
      `💳 Transaction ID: ${params.tran_id}\n🛑 Error: ${error.message}`));

    return NextResponse.json(
      { status: 'ERROR', error: error.message },
      { status: 500 }
    );
  }
}