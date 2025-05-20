// app/api/payment/SSLCOMMERZ/success/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import sendTelegramAlert from '../../../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `🏟️ PLAY MAKERS ARENA\n---------------------------------------\n${title}\n${details}`;
};

const extractSlotIds = async (value_d, bookingId) => {
  console.log('🔧 Starting slot ID extraction');
  
  try {
    // Attempt 1: Normal JSON parse
    const slots = JSON.parse(value_d);
    const ids = slots.map(s => s.slotId);
    console.log(`✅ Parsed ${ids.length} slots from JSON`);
    return ids;
  } catch (error) {
    console.warn('⚠️ JSON parse failed, trying fallback methods...');
    console.log('Raw value_d:', value_d.slice(0, 100) + '...');
  }

  try {
    // Attempt 2: Regex pattern matching
    const slotPattern = /SLOT\d+PMA/gi;
    const matches = value_d.match(slotPattern) || [];
    const uniqueIds = [...new Set(matches)];
    
    if (uniqueIds.length > 0) {
      console.log(`🔍 Extracted ${uniqueIds.length} slots via regex`);
      return uniqueIds;
    }
  } catch (error) {
    console.warn('⚠️ Regex extraction failed:', error.message);
  }

  try {
    // Attempt 3: Check existing booking
    console.log('🔎 Checking database for existing booking');
    const existing = await query(
      'SELECT slot_id FROM pma_booking_info WHERE booking_id = $1',
      [bookingId]
    );
    
    if (existing.rows.length > 0) {
      console.log(`📚 Found ${existing.rows[0].slot_id.length} slots in database`);
      return existing.rows[0].slot_id;
    }
  } catch (error) {
    console.warn('⚠️ Database fallback failed:', error.message);
  }

  throw new Error('All slot extraction methods failed');
};

export async function POST(req) {
  const startTime = Date.now();
  let tran_id = null;
  console.log(`\n🌐 [Payment Success] Process started at ${new Date().toISOString()}`);

  try {
    const { searchParams } = new URL(req.url);
    const formData = await req.formData();
    
    tran_id = searchParams.get('tran_id') || formData.get('tran_id');
    console.log(`🔍 Transaction ID: ${tran_id?.slice(0, 8)}...`);

    if (!tran_id) throw new Error('Missing transaction ID');

    // Validate transaction
    console.log('🔐 Validating with SSLCommerz...');
    const validationRes = await fetch(
      `https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php?tran_id=${tran_id}&store_id=${process.env.SSL_STORE_ID}&store_passwd=${process.env.SSL_STORE_PASSWORD}`
    );
    
    const validationData = await validationRes.json();
    const paymentRecord = validationData?.element?.[0];
    
    if (!paymentRecord || paymentRecord.status !== 'VALID') {
      throw new Error(validationData?.element?.[0]?.error || 'Invalid transaction');
    }

    const bookingId = paymentRecord.value_a;
    const memberId = paymentRecord.value_b;

    // Start database transaction
    console.log('🗃️ Starting database transaction...');
    await query('BEGIN');

    try {
      // Process bookings
      console.log('📦 Processing slot data...');
      const slotIds = await extractSlotIds(paymentRecord.value_d || '[]', bookingId);
      
      console.log('💾 Storing booking:', {
        bookingId,
        slotCount: slotIds.length,
        sampleSlot: slotIds[0]
      });

      await query(
        `INSERT INTO pma_booking_info (
          booking_id, pma_id, booking_date, slot_id, status
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (booking_id) 
        DO UPDATE SET
          pma_id = EXCLUDED.pma_id,
          booking_date = EXCLUDED.booking_date,
          slot_id = EXCLUDED.slot_id,
          status = EXCLUDED.status`,
        [
          bookingId,
          memberId,
          new Date(paymentRecord.value_c).toISOString().split('T')[0],
          slotIds,
          'BOOKED'
        ]
      );

      // Insert transaction record
      console.log('💳 Recording transaction...');
      await query(
        `INSERT INTO pma_transactions_history (
          transaction_id, pma_id, booking_id, amount, 
          payment_method, bank_tran_id, status, card_no
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          tran_id,
          memberId,
          bookingId,
          paymentRecord.currency_amount,
          paymentRecord.card_type,
          paymentRecord.bank_tran_id,
          'SUCCESS',
          paymentRecord.card_no
        ]
      );

      // Link transaction to booking
      await query(
        `UPDATE pma_booking_info
        SET transaction_id = $1
        WHERE booking_id = $2`,
        [tran_id, bookingId]
      );

      await query('COMMIT');
      console.log('✅ Transaction committed successfully');

      // Send notifications
      const paymentAlert = formatAlertMessage(
        '💳 Payment Successful',
        `Transaction ID : ${tran_id}\nAmount : ৳${paymentRecord.currency_amount.toLocaleString()} (5% Vat)\nTotal Slots: ${slotIds.length}`
      );
      await sendTelegramAlert(paymentAlert);

      // Fetch detailed booking info
      console.log(`📊 Fetching booking details`);
      const bookingDetails = await query(
        `SELECT 
          b.booking_id,
          b.booking_date,
          t.amount,
          jsonb_agg(jsonb_build_object(
            'name', s.slot_name,
            'timing', s.slot_timing,
            'price', COALESCE(s.offer_price, s.price)
          )) as slots
        FROM pma_booking_info b
        JOIN pma_transactions_history t ON b.transaction_id = t.transaction_id
        JOIN pma_booking_slots s ON s.slot_id = ANY(b.slot_id)
        WHERE b.booking_id = $1
        GROUP BY b.booking_id, b.booking_date, t.amount`,
        [bookingId]
      );

      if (bookingDetails.rows.length === 0) throw new Error('Booking details not found');

      const booking = bookingDetails.rows[0];
      const bookingDate = new Date(booking.booking_date).toLocaleDateString('en-CA');
      const totalAmount = parseFloat(booking.amount).toLocaleString('en-US', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 2
      });

      // Format booking details message
      const bookingMessage = `
      🎉 *BOOKING CONFIRMED* 🎉
      ══════════════════════════════════

      🔖 *Booking ID        :* #${booking.booking_id}
      🔖 *Transaction ID   :* ${tran_id}
      📆 *Booking Date    :* ${bookingDate}
      💵 *Total Payment   :* ${totalAmount}

      🎟️ *Your Reserved Slots:*

      ${booking.slots.map((slot, index) => 
      `${index + 1}. 🎯 *${slot.name}*
        🕒 ${slot.timing}`
      ).join('\n\n')}

      ══════════════════════════════════
      🎯 *We're ready to make your play unforgettable!*

      📌 *Important Notes:*
      • Arrive 15 minutes before your slot
      • Bring valid ID proof

      _Thank you for trusting Play Makers Arena!_
      🏟️ *Enjoy your game at Play Makers Arena!*
      `.replace(/^ +/gm, '');


      // Send booking details alert
      await sendTelegramAlert(bookingMessage);

      // Prepare response
      const response = NextResponse.redirect(
        `${process.env.BASE_URL}/member_dashboard?payment=success&booking_id=${bookingId}`,
        { status: 302, headers: { 'Cache-Control': 'no-store' } }
      );

      response.cookies.set('payment_status', 'success', {
        maxAge: 5,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return response;

    } catch (dbError) {
      await query('ROLLBACK');
      console.error('💥 Database transaction failed:', dbError.message);
      throw dbError;
    }

  } catch (error) {
    console.error('💥 Payment processing failed:', {
      tran_id: tran_id?.slice(0, 8) || 'unknown',
      error: error.message,
      stack: error.stack?.split('\n')[0]
    });

    await sendTelegramAlert(formatAlertMessage(
      '❌ Payment Failed',
      `Transaction: ${tran_id?.slice(0, 8) || 'unknown'}\nError: ${error.message.slice(0, 50)}`
    ));

    const response = NextResponse.redirect(
      `${process.env.BASE_URL}/member_dashboard?payment=failed`,
      {
        status: 302,
        headers: { 'Cache-Control': 'no-store' }
      }
    );

    response.cookies.set('payment_status', 'error', {
      maxAge: 5,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return response;
  }
}