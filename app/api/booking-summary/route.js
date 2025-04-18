// app/api/member_info/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDbConnection } from '../../../lib/db';

export const dynamic = 'force-dynamic'; // Enables dynamic server behavior

export async function GET() {
  try {
    // Await cookies() to ensure proper async handling
    const cookieStore = await cookies(); 
    const pma_id = cookieStore.get('pma_id')?.value;

    if (!pma_id) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    const pool = getDbConnection();
    const client = await pool.connect();

    try {
      const queryText = `
        SELECT first_name, last_name, email, phone, nid, type 
        FROM pma_member_info 
        WHERE pma_id = $1
      `;

      const result = await client.query(queryText, [pma_id]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Member not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(result.rows[0]);

    } catch (queryError) {
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      );
    } finally {
      client.release();
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
