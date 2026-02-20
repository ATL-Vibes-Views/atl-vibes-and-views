import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status") ?? "published";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

  const sb = createServiceRoleClient();

  /* Direct ID lookup — used by post cache preload */
  if (ids.length > 0) {
    const { data, error } = await sb
      .from("blog_posts")
      .select("id, title, slug, published_at, featured_image_url")
      .in("id", ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

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
