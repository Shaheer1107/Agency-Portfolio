import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/supabase/database.types";

export async function getPublishedProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Unable to load projects:", error.message);
    return [];
  }
  return data ?? [];
}
