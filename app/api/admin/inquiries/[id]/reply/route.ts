import { NextResponse } from "next/server";
import { sendInquiryReply } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { reply } = await request.json();
  if (!reply || typeof reply !== "string" || !reply.trim()) {
    return NextResponse.json({ error: "Reply message is required." }, { status: 400 });
  }
  const { id } = await params;
  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .select("email")
    .eq("id", id)
    .single();
  if (inquiryError || !inquiry) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });

  try {
    await sendInquiryReply(inquiry.email, reply.trim());
    const { error } = await supabase
      .from("inquiries")
      .update({ status: "replied", replied_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to send reply right now." }, { status: 503 });
  }
}