import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/project-utils";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error)
    return NextResponse.json(
      { error: "Unable to load projects." },
      { status: 500 },
    );
  return NextResponse.json({ projects: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  const payload = await request.json();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      title: String(payload.title ?? "").trim(),
      slug: slugify(String(payload.slug || payload.title || "project")),
      category: String(payload.category ?? "AI Automation").trim(),
      description: String(payload.description ?? "").trim(),
      case_study: payload.case_study ?? null,
      image_url: payload.image_url ?? null,
      video_url: payload.video_url ?? null,
      technologies: Array.isArray(payload.technologies)
        ? payload.technologies
        : [],
      results: payload.results ?? {},
      published: Boolean(payload.published),
    })
    .select()
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ project: data }, { status: 201 });
}
