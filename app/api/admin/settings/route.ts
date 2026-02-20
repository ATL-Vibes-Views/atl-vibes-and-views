import { createServiceRoleClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { updates } = await req.json();
    const sb = createServiceRoleClient();
    for (const update of updates) {
      const { id, ...fields } = update;
      await sb
        .from("site_settings")
        .update({ ...fields, updated_at: new Date().toISOString() } as never)
        .eq("id", id);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
