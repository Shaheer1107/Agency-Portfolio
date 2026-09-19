import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_categories")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Unable to load categories." }, { status: 500 });
  return NextResponse.json({ categories: data ?? [] });
}