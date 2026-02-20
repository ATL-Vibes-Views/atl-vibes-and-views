import { createServiceRoleClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  if (!ids.length) return NextResponse.json([]);
  const sb = createServiceRoleClient();
  const { data } = await sb
    .from("media_assets")
    .select("id, file_url, file_name, mime_type, alt_text, title")
    .in("id", ids) as { data: any[] | null };
  return NextResponse.json(data ?? []);
}
