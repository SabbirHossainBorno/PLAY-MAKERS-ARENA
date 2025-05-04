// app/api/booking-summary/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDbConnection } from '../../../lib/db';
import logger from '../../../lib/logger';

export const dynamic = 'force-dynamic';

const getBaseMeta = async (request) => {
  const cookieStore = await cookies();
  const eid = cookieStore.get('eid')?.value || 'NO_EID';
  const sid = cookieStore.get('sessionId')?.value || 'NO_SESSION';
  const pma_id = cookieStore.get('pma_id')?.value || 'NO_PMA_ID';

  return {
    taskName: 'Booking-Summary',
    endpoint: '/api/booking-summary',
    identifiers: {
      eid,
      sid,
      pma_id
    },
    network: {
      ip: request.headers.get('x-forwarded-for') || 'Unknown IP',
      userAgent: request.headers.get('user-agent') || 'Unknown UA'
    },
    timestamp: new Date().toISOString()
  };
};

export async function GET(request) {
  const baseMeta = await getBaseMeta(request);
  
  try {
    logger.info('Booking summary request initiated', {
      meta: {
        ...baseMeta.identifiers,
        taskName: 'Booking-Summary',
        stage: 'START',
        details: 'Authentication check'
      }
    });

    if (!baseMeta.identifiers.pma_id || baseMeta.identifiers.pma_id === 'NO_PMA_ID') {
      logger.error('Unauthorized access attempt', {
        meta: {
          ...baseMeta.identifiers,
          taskName: 'Booking-Summary',
          errorType: 'UNAUTHENTICATED',
          statusCode: 401,
          validation: {
            missingCookies: ['pma_id']
          }
        }
      });

      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const pool = getDbConnection();
    const client = await pool.connect();
    
    try {
      logger.info('Database connection acquired', {
        meta: {
          ...baseMeta.identifiers,
          taskName: 'Booking-Summary',
          stage: 'DB_CONNECT',
          db: {
            connection: pool.totalCount,
            idle: pool.idleCount,
            waiting: pool.waitingCount
          }
        }
      });

      const queryText = `
        SELECT first_name, last_name, email, phone, nid, type 
        FROM pma_member_info 
        WHERE pma_id = $1
      `;

      const queryStart = Date.now();
      const result = await client.query(queryText, [baseMeta.identifiers.pma_id]);
      const queryDuration = Date.now() - queryStart;

      if (result.rows.length === 0) {
        logger.error('Member not found', {
          meta: {
            ...baseMeta.identifiers,
            taskName: 'Booking-Summary',
            errorType: 'NOT_FOUND',
            statusCode: 404,
            query: {
              duration: queryDuration,
              parameters: [baseMeta.identifiers.pma_id]
            }
          }
        });

        return NextResponse.json(
          { error: 'Member not found' },
          { status: 404 }
        );
      }

      logger.info('Member data retrieved', {
        meta: {
          ...baseMeta.identifiers,
          taskName: 'Booking-Summary',
          statusCode: 200,
          performance: {
            queryDurationMs: queryDuration
          },
          data: {
            fieldsReturned: Object.keys(result.rows[0]).length,
            memberType: result.rows[0].type
          }
        }
      });

      return NextResponse.json(result.rows[0], {
        headers: {
          'X-Query-Duration': `${queryDuration}ms`,
          'Cache-Control': 'no-store, max-age=0'
        }
      });

    } catch (queryError) {
      logger.error('Database query failed', {
        meta: {
          ...baseMeta.identifiers,
          taskName: 'Booking-Summary',
          errorType: 'DATABASE_ERROR',
          statusCode: 500,
          errorDetails: {
            message: queryError.message,
            code: queryError.code || 'UNKNOWN',
            stack: queryError.stack?.split('\n')[0] || 'No stack'
          }
        }
      });

      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      );
    } finally {
      client.release();
      logger.info('Database connection released', {
        meta: {
          ...baseMeta.identifiers,
          taskName: 'Booking-Summary',
          stage: 'DB_RELEASE'
        }
      });
    }

  } catch (error) {
    const errorMeta = await getBaseMeta(request);
    logger.error('Critical system failure', {
      meta: {
        ...errorMeta.identifiers,
        taskName: 'Booking-Summary',
        errorType: 'SERVER_ERROR',
        statusCode: 500,
        errorDetails: {
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 3).join('\n') || 'No stack'
        }
      }
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
