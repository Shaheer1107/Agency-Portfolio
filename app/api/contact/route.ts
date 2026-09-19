import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendInquiryNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    const inquiry = { email, company_size: body.company_size ?? null, process: body.process ?? null, message: body.message ?? null };
    const supabase = await createClient();
    const { error } = await supabase.from('inquiries').insert(inquiry);
    if (error) return NextResponse.json({ error: 'Unable to submit your request.' }, { status: 500 });
    try {
      await sendInquiryNotification(inquiry);
    } catch {
      return NextResponse.json({ error: 'Your request was saved, but email delivery is temporarily unavailable.' }, { status: 503 });
    }
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
}
