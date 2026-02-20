import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

// The file is uploaded directly from the browser to Supabase Storage
// (bypassing Vercel's 4.5 MB payload limit). This route only receives
// lightweight JSON metadata and inserts the media_assets row using the
// service role key.

function deriveFileType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf" || mimeType.startsWith("text/")) return "document";
  return "other";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      file_url: string;
      file_name: string;
      mime_type: string;
      file_size: number;
      bucket: string;
      folder: string;
      title?: string;
      alt_text?: string;
      caption?: string;
      width?: number | null;
      height?: number | null;
    };

    const { file_url, file_name, mime_type, file_size, bucket, folder } = body;
    if (!file_url || !file_name || !mime_type || !bucket || !folder) {
      return NextResponse.json({ error: "Missing required metadata fields" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { data: row, error } = await (supabase
      .from("media_assets")
      .insert({
        file_url,
        file_name,
        file_type: deriveFileType(mime_type),
        mime_type,
        file_size: file_size ?? 0,
        width: body.width ?? null,
        height: body.height ?? null,
        bucket,
        folder,
        title: body.title ?? file_name,
        alt_text: body.alt_text ?? null,
        caption: body.caption ?? null,
        source: "user_uploaded",
        is_active: true,
      } as never)
      .select("id")
      .single() as unknown as Promise<{ data: { id: string } | null; error: { message: string } | null }>);

    if (error || !row) {
      return NextResponse.json({ error: error?.message ?? "Failed to insert media_assets row" }, { status: 500 });
    }

    return NextResponse.json({ id: row.id, url: file_url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
