import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status") ?? "published";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

  const sb = createServiceRoleClient();
  let query = sb
    .from("blog_posts")
    .select("id, title, slug, published_at, featured_image_url")
    .eq("status", status)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
