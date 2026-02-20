import { NextRequest, NextResponse } from "next/server";
import { uploadAsset } from "@/lib/supabase-storage";

// Vercel Hobby/Pro API routes have a hard 4.5 MB request body limit that
// cannot be raised via config in the App Router. Reject files above 4 MB
// early with a clear message rather than letting Vercel return a cryptic
// FUNCTION_PAYLOAD_TOO_LARGE error.
const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum upload size is 4 MB. Please compress the image before uploading.` },
        { status: 413 }
      );
    }

    const bucket = (formData.get("bucket") as string) || "site-images";
    const folder = (formData.get("folder") as string) || "uploads";
    const title = (formData.get("title") as string) || file.name;
    const alt_text = (formData.get("alt_text") as string) || undefined;
    const caption = (formData.get("caption") as string) || undefined;

    const result = await uploadAsset(file, {
      bucket,
      folder,
      title,
      alt_text: alt_text || undefined,
      caption: caption || undefined,
      source: "user_uploaded",
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
