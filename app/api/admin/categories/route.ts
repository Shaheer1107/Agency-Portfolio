import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function authorized() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await authorized();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data, error } = await supabase
    .from("project_categories")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ categories: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user } = await authorized();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const name = String((await request.json()).name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Category name is required." }, { status: 400 });
  const { data, error } = await supabase
    .from("project_categories")
    .insert({ name })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ category: data }, { status: 201 });
}