//app/api/client-log/route.js
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function POST(req) {
  try {
    const { level, message, meta } = await req.json();

    if (!level || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    logger[level](message, { meta });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Logging failed' }, { status: 500 });
  }
}
