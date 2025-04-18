// app/api/confirm-subscription/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  try {
    const result = await query(
      `UPDATE pma_subscriber_list 
      SET confirmation_status = CASE 
        WHEN confirmation_expires > NOW() THEN 'Valid' 
        ELSE 'Invalid' 
      END
      WHERE confirmation_token = $1 
      RETURNING email, confirmation_status`,
      [token]
    );

    if (!result.rows.length) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const { email, confirmation_status } = result.rows[0];
    
    if (confirmation_status === 'Valid') {
      await query(
        `INSERT INTO pma_notification_details 
        (id, title, status, date) 
        VALUES ($1, $2, $3, NOW())`,
        [result.rows[0].id, `Confirmed Subscription [${result.rows[0].id}]`, 'Unread']
      );
    }

    return NextResponse.json({
      success: true,
      message: confirmation_status === 'Valid' 
        ? 'Email Confirmed Successfully!' 
        : 'Confirmation Link Expired'
    });

  } catch (error) {
    logger.error('Confirmation Error', {
      meta: {
        taskName: 'Subscription Confirmation',
        details: error.message
      }
    });
    return NextResponse.json(
      { success: false, message: 'Confirmation Failed' },
      { status: 500 }
    );
  }
}