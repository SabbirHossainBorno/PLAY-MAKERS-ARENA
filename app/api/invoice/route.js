// app/api/invoice/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const startTime = Date.now();
  console.log('\n=== [Invoice Generation Started] ===');
  
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('booking_id');
    console.log(`[1/5] Received request for booking ID: ${bookingId}`);

    // Validate booking ID
    if (!bookingId || !bookingId.startsWith('BOOKED')) {
      console.error('[1/5] ❌ Invalid booking ID format');
      return NextResponse.json(
        { success: false, error: 'Valid booking ID is required' },
        { status: 400 }
      );
    }

    // Generate Invoice ID
    const numericId = bookingId.match(/\d+/)[0];
    const invoiceId = `INV${numericId}PMA`;
    console.log(`[2/5] Generated Invoice ID: ${invoiceId}`);

    // Update database with invoice ID
    console.log('[3/5] Updating database with invoice ID...');
    const updateResult = await query(
      `UPDATE pma_booking_info 
       SET invoice_id = $1
       WHERE booking_id = $2
       RETURNING invoice_id`,
      [invoiceId, bookingId]
    );

    if (updateResult.rowCount === 0) {
      console.error('[3/5] ❌ Booking not found for update');
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    console.log('[3/5] ✅ Database updated successfully');

    // Fetch complete invoice data
    console.log('[4/5] Fetching invoice data...');
    const invoiceQuery = `
      SELECT 
        b.booking_id,
        b.invoice_id,
        b.booking_date,
        t.transaction_id,
        t.amount AS total_amount,
        t.payment_method,
        t.card_no,
        t.bank_tran_id,
        t.created_at,
        jsonb_agg(jsonb_build_object(
          'slot_id', s.slot_id,
          'slot_name', s.slot_name,
          'slot_timing', s.slot_timing,
          'type', s.type,
          'price', COALESCE(s.offer_price, s.price),
          'offer', s.offer
        )) AS slots,
        m.pma_id,
        m.first_name AS member_first_name,
        m.last_name AS member_last_name,
        m.phone AS member_phone,
        m.nid AS member_nid,
        m.type AS member_type
      FROM pma_booking_info b
      JOIN pma_transactions_history t ON b.transaction_id = t.transaction_id
      JOIN pma_booking_slots s ON s.slot_id = ANY(b.slot_id)
      JOIN pma_member_info m ON b.pma_id = m.pma_id
      WHERE b.booking_id = $1
      GROUP BY b.booking_id, b.invoice_id, b.booking_date, 
              t.transaction_id, t.amount, t.payment_method, 
              t.card_no, t.bank_tran_id, t.created_at,
              m.pma_id, m.first_name, m.last_name, 
              m.phone, m.nid, m.type
    `;

    const result = await query(invoiceQuery, [bookingId]);
    console.log(`[4/5] Fetched ${result.rows[0]?.slots?.length || 0} slots`);

    if (result.rows.length === 0) {
      console.error('[4/5] ❌ No invoice data found');
      return NextResponse.json(
        { success: false, error: 'Invoice data not found' },
        { status: 404 }
      );
    }

    // Format data
    const formattedData = {
        ...result.rows[0],
        booking_date: new Date(result.rows[0].booking_date)
          .toLocaleDateString('en-CA', { 
            timeZone: 'Asia/Dhaka' 
          }),
        created_at: new Date(result.rows[0].created_at)
          .toLocaleString('en-US', {
            timeZone: 'Asia/Dhaka',
            hour12: true,
            dateStyle: 'medium',
            timeStyle: 'medium'
          })
      };

    console.log('[5/5] ✅ Invoice data prepared successfully');
    logger.info('InvoiceGenerated', {
      meta: {
        bookingId,
        invoiceId,
        duration: Date.now() - startTime,
        slotCount: formattedData.slots.length,
        amount: formattedData.total_amount
      }
    });

    return NextResponse.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('[ERROR] Invoice Generation Failed:', error);
    logger.error('InvoiceFailure', {
      meta: {
        error: error.message,
        stack: error.stack?.split('\n').slice(0, 3),
        duration: Date.now() - startTime
      }
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}