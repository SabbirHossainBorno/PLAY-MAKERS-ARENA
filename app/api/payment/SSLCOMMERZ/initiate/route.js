// app/api/payment/SSLCOMMERZ/initiate/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import { query } from '../../../../../lib/db';
import logger from '../../../../../lib/logger';
import sendTelegramAlert from '../../../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `🏟️ PLAY MAKERS ARENA\n--------------------------\n${title}\n${details}`;
};

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const startTime = Date.now();
  let tran_id = null;
  console.log('\n=== [Payment Initiation Started] ===');
  try {
    // 1. Request Metadata Collection
    const ipAddress = req.headers.get('x-forwarded-for') || 'Unknown IP';
    const userAgent = req.headers.get('user-agent')?.slice(0, 100) || 'Unknown UA';
    console.log(`[1/8] Request from IP: ${ipAddress}`);
    console.log(`[1/8] User Agent: ${userAgent}`);

    // 2. Cookie Validation
    const cookies = req.cookies;
    const pma_id = cookies.get('pma_id')?.value;
    const eid = cookies.get('eid')?.value?.slice(0, 6) + '...' || 'NO_EID';
    const sid = cookies.get('sid')?.value?.slice(0, 6) + '...' || 'NO_SESSION';

    console.log(`[2/8] Authentication Check:`);
    console.log('- PMA ID exists:', !!pma_id);
    console.log('- EID:', eid);
    console.log('- Session ID:', sid);
    if (!pma_id) {
      console.error('[2/8] ❌ Authentication failed - Missing PMA ID cookie');
      throw new Error('Member authentication failed - missing pma_id cookie');
    }

    // 3. Request Body Parsing
    const rawBody = await req.text();
    console.log(`[3/8] Raw Request Body (first 100 chars): ${rawBody.slice(0, 100)}...`);

    const { amount, memberInfo, bookingData } = JSON.parse(rawBody);
    console.log('[3/8] Parsed Request Data:');
    console.log('- Amount:', amount);
    console.log('- Booking Date:', bookingData?.selectedDate);
    console.log('- Selected Slots:', bookingData?.selectedSlots?.length || 0);
    console.log('- Slot ID:', bookingData.selectedSlots.map(s => s.slotId).join(', '));

    // 4. Data Validation
    const missingFields = [];
    console.log('[4/8] Data Validation:');

    if (!memberInfo) missingFields.push('memberInfo');
    if (!bookingData) missingFields.push('bookingData');
    if (bookingData) {
      if (!bookingData.selectedDate) missingFields.push('bookingData.selectedDate');
      if (!bookingData.selectedSlots?.length) missingFields.push('bookingData.selectedSlots');
      if (bookingData.selectedSlots?.some(s => !s.slotId)) {
        missingFields.push('bookingData.slots[].slotId');
      }
    }
    if (missingFields.length > 0) {
      console.error('[4/8] ❌ Validation failed - Missing fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    console.log('[4/8] ✅ All required fields present');

    const suffix = Date.now().toString().slice(-3); // Always digits
    const alpha = Math.random().toString(36).substring(2, 5).toUpperCase(); 
    const tran_id = `TXNPMA${suffix}${alpha}`;
    console.log(`[5/8] Generated Transaction ID: ${tran_id}`);

    // 6. Booking ID Generation
    console.log('[6/8] Generating Sequential Booking ID:');
    console.log('- Querying database for last booking ID...');

    const maxIdResult = await query(
      "SELECT booking_id FROM pma_booking_info WHERE booking_id LIKE 'BOOKED%PMA' ORDER BY created_at DESC LIMIT 1"
    );

    let lastNumber = 0;
    if (maxIdResult.rows.length > 0) {
      const lastId = maxIdResult.rows[0].booking_id;
      console.log(`- Last Booking ID Found: ${lastId}`);
      const idParts = lastId.match(/BOOKED(\d+)PMA/);
      lastNumber = idParts && idParts[1] ? parseInt(idParts[1], 10) : 0;
    } else {
      console.log('- No previous bookings found');
    }

    const newNumber = lastNumber + 1;
    const bookingId = `BOOKED${newNumber.toString().padStart(2, '0')}PMA`;
    console.log(`- New Booking ID: ${bookingId}`);

    // 7. SSLCommerz Payload Preparation
    console.log('[7/8] Preparing SSLCommerz Payload:');

    const postData = new URLSearchParams();
    postData.append('store_id', process.env.SSL_STORE_ID);
    postData.append('store_passwd', process.env.SSL_STORE_PASSWORD);
    postData.append('total_amount', amount.toFixed(2));
    postData.append('currency', 'BDT');
    postData.append('tran_id', tran_id);
    postData.append('success_url', `${process.env.BASE_URL}/api/payment/SSLCOMMERZ/success?tran_id=${tran_id}`);
    postData.append('fail_url', `${process.env.BASE_URL}/api/payment/SSLCOMMERZ/fail`);
    postData.append('cancel_url', `${process.env.BASE_URL}/api/payment/SSLCOMMERZ/cancel`);
    postData.append('ipn_url', `${process.env.BASE_URL}/api/payment/SSLCOMMERZ/ipn`);
    postData.append('cus_name', `${memberInfo.first_name} ${memberInfo.last_name}`);
    postData.append('cus_email', memberInfo.email);
    postData.append('cus_phone', memberInfo.phone);
    postData.append('shipping_method', 'NO');
    postData.append('product_name', 'Turf Booking');
    postData.append('product_category', 'Sports');
    postData.append('product_profile', 'general');
    postData.append('value_a', bookingId);
    postData.append('value_b', pma_id);
    postData.append('value_c', bookingData.selectedDate);
    postData.append('value_d', JSON.stringify(
      bookingData.selectedSlots.map(slot => ({
        slotId: slot.slotId,
        slotName: slot.slotName,
        slotTiming: slot.slotTiming,
        price: slot.price,
        offerPrice: slot.offerPrice
      }))
    ));
    console.log('- Store ID:', process.env.SSL_STORE_ID);
    console.log('- Transaction ID:', tran_id);
    console.log('- Success URL:', postData.get('success_url'));
    console.log('- Customer Name:', postData.get('cus_name'));
    console.log('- Booking Slots:', bookingData.selectedSlots.length);

    // 8. SSLCommerz API Call
    console.log('[8/8] Initiating SSLCommerz Session:');
    const sslStart = Date.now();

    console.log('- Endpoint: https://sandbox.sslcommerz.com/gwprocess/v3/api.php');
    console.log('- Payload Size:', Buffer.byteLength(postData.toString()), 'bytes');

    const response = await axios.post(
      'https://sandbox.sslcommerz.com/gwprocess/v3/api.php',
      postData,
      { 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000 
      }
    );
    const sslDuration = Date.now() - sslStart;
    console.log(`- SSL Response (${sslDuration}ms):`, {
      status: response.data.status,
      gatewayURL: response.data.GatewayPageURL?.slice(0, 50) + '...',
      sessionKey: response.data.sessionkey?.slice(0, 6) + '...'
    });

    if (response.data.status !== 'SUCCESS') {
      throw new Error(`SSLCommerz Error: ${response.data.failedreason || 'Unknown error'}`);
    }

    // Success Handling
    console.log('\n=== [Payment Initiation Successful] ===');
    console.log(`- Gateway URL: ${response.data.GatewayPageURL}`);
    console.log(`- Total Time: ${Date.now() - startTime}ms`);
    logger.info('PaymentInitiated', {
      meta: {
        pma_id,
        tran_id,
        bookingId,
        amount: amount.toFixed(2),
        slots: bookingData.selectedSlots.length,
        duration: Date.now() - startTime,
        taskName: 'PaymentInitiation'
      }
    });
    await sendTelegramAlert(formatAlertMessage('💰 Payment Initiated',
      `Member: ${pma_id}\nAmount: ৳${amount}\nBooking ID: ${bookingId}\nSlots: ${bookingData.selectedSlots.length}`));
      return NextResponse.json({
        paymentUrl: response.data.GatewayPageURL,
        tran_id,
        bookingId
      });
    } catch (error) {
      // Error Handling
      const duration = Date.now() - startTime;
      console.error('\n=== [Payment Initiation Failed] ===');
      console.error('- Error:', error.message);
      console.error('- Transaction ID:', tran_id || 'N/A');
      console.error('- Duration:', duration + 'ms');
      console.error('- Stack:', error.stack?.split('\n').slice(0, 3).join('\n '));
      logger.error('PaymentFailure', {
        meta: {
          pma_id: req.cookies.get('pma_id')?.value || 'NO_ID',
          error: error.message,
          duration,
          taskName: 'PaymentInitiation',
          stack: error.stack?.split('\n').slice(0, 3)
        }
      });
      await sendTelegramAlert(formatAlertMessage('❌ Payment Failed',
        `ID: ${tran_id || 'N/A'}\nMember: ${req.cookies.get('pma_id')?.value || 'Unknown'}\nError: ${error.message}`));
      return NextResponse.json(
        {
          success: false,
          message: `Payment initiation failed: ${error.message}`,
          ...(!req.cookies.get('pma_id') && { authError: 'Missing member session' }),
          referenceId: tran_id
        },
        { status: 500 }
      );
    }
  }
  