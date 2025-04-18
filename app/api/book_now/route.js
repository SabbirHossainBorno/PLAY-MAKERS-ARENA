//app/api/book_now/route.js
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  try {
    logger.info(`[BookNow API] Request received for date: ${date}`);
    
    if (!date) {
      logger.error('[BookNow API] Date parameter missing');
      return new Response(JSON.stringify({
        success: false,
        error: 'Date parameter is required'
      }), { status: 400 });
    }

    const validDate = new Date(date);
    if (isNaN(validDate.getTime())) {
      logger.error(`[BookNow API] Invalid date format: ${date}`);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      }), { status: 400 });
    }

    const result = await query(`
      SELECT 
        bs.serial,
        bs.slot_id AS "slotId",
        bs.slot_name AS "slotName",
        bs.slot_timing AS "slotTiming",
        bs.price,
        bs.type,
        bs.offer,
        bs.offer_price AS "offerPrice",
        CASE 
          WHEN bi.booking_id IS NOT NULL THEN true
          ELSE false
        END as booked
      FROM pma_booking_slots bs
      LEFT JOIN pma_booking_info bi 
        ON bs.slot_id = bi.slot_id 
        AND bi.booking_date = $1
      ORDER BY bs.serial
    `, [date]);

    logger.info(`[BookNow API] Successfully fetched ${result.rowCount} slots for ${date}`);
    
    return new Response(JSON.stringify({
      success: true,
      data: result.rows
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error) {
    logger.error(`[BookNow API] Error: ${error.message}`, { date });
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch slots. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}