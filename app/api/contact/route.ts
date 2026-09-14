import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    if (!email || !email.includes('@')) return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    const supabase = await createClient();
    const { error } = await supabase.from('inquiries').insert({ email, company_size: body.company_size ?? null, process: body.process ?? null, message: body.message ?? null });
    if (error) return NextResponse.json({ error: 'Unable to submit your request.' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
}
