// app/api/book_now/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const sessionId = request.cookies.get('sessionId')?.value || 'NO_SESSION';
  const eid = request.cookies.get('eid')?.value || 'NO_EID';
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown UA';

  const baseMeta = {
    eid,
    sid: sessionId,
    taskName: 'Booking',
    endpoint: '/api/book_now',
    ipAddress,
    userAgent,
    parameters: { date },
    timestamp: new Date().toISOString()
  };

  try {
    logger.info('Request initiated', {
      meta: {
        ...baseMeta,
        stage: 'START',
        details: 'New booking slots request received'
      }
    });

    // Validate date parameter
    if (!date) {
      logger.error('Missing required parameter', {
        meta: {
          ...baseMeta,
          taskName: 'Booking',
          errorType: 'CLIENT_ERROR',
          statusCode: 400,
          validation: {
            missingParams: ['date']
          }
        }
      });

      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Validate date format
    const validDate = new Date(date);
    if (isNaN(validDate.getTime())) {
      logger.error('Invalid date format', {
        meta: {
          ...baseMeta,
          taskName: 'Booking',
          errorType: 'INVALID_INPUT',
          statusCode: 400,
          validation: {
            receivedValue: date,
            expectedFormat: 'YYYY-MM-DD'
          }
        }
      });

      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Database query execution
    const queryStart = Date.now();
    let result;
    try {
      result = await query(
        `SELECT 
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
          ON bs.slot_id = ANY(bi.slot_id)
          AND bi.booking_date = $1
        ORDER BY bs.serial`,
        [date]
      );
    } catch (queryError) {
      logger.error('Database query failed', {
        meta: {
          ...baseMeta,
          taskName: 'Booking',
          errorType: 'DATABASE_ERROR',
          statusCode: 500,
          queryDetails: {
            sql: 'SELECT booking slots',
            params: [date],
            duration: Date.now() - queryStart
          },
          errorDetails: {
            message: queryError.message,
            code: queryError.code || 'UNKNOWN'
          }
        }
      });
      throw queryError;
    }
    
    const queryDuration = Date.now() - queryStart;

    // Analyze slot data
    const slotStats = {
      totalSlots: result.rowCount,
      bookedSlots: result.rows.filter(s => s.booked).length,
      availableSlots: result.rowCount - result.rows.filter(s => s.booked).length,
      slotTypes: [...new Set(result.rows.map(s => s.type))],
      priceRange: result.rows.reduce((acc, s) => {
        acc.min = Math.min(acc.min, s.price);
        acc.max = Math.max(acc.max, s.price);
        return acc;
      }, { min: Infinity, max: -Infinity })
    };

    // Success logging with slot details
    logger.info('Slots data retrieved', {
      meta: {
        ...baseMeta,
        taskName: 'Booking',
        statusCode: 200,
        performance: {
          queryDurationMs: queryDuration,
          resultCount: result.rowCount
        },
        slotStats,
        sampleData: result.rowCount > 0 ? {
          firstSlot: {
            id: result.rows[0].slotId,
            name: result.rows[0].slotName,
            booked: result.rows[0].booked
          },
          lastSlot: {
            id: result.rows[result.rowCount - 1].slotId,
            name: result.rows[result.rowCount - 1].slotName,
            booked: result.rows[result.rowCount - 1].booked
          }
        } : null
      }
    });

    return NextResponse.json({
      success: true,
      data: result.rows
    }, {
      headers: { 
        'Cache-Control': 'no-store, max-age=0',
        'X-Query-Duration': `${queryDuration}ms`,
        'X-Slot-Stats': `${slotStats.availableSlots}/${slotStats.totalSlots} available`
      }
    });

  } catch (error) {
    logger.error('Database operation failed', {
      meta: {
        ...baseMeta,
        taskName: 'Booking',
        errorType: 'SERVER_ERROR',
        statusCode: 500,
        errorDetails: {
          message: error.message,
          stack: error.stack,
          code: error.code || 'UNKNOWN',
          queryParameters: [date]
        }
      }
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch slots. Please try again later.',
        referenceId: baseMeta.timestamp
      },
      { status: 500 }
    );
  }
}