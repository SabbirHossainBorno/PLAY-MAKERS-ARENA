import { NextResponse } from 'next/server';
import { sendConfirmationEmail } from '../../../lib/email';

export async function GET() {
  try {
    await sendConfirmationEmail(
      'borno665544nagad@gmail.com', 
      'test-token-123'
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
}