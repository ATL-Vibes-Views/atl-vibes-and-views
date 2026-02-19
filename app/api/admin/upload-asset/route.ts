import { NextRequest, NextResponse } from "next/server";
import { uploadAsset } from "@/lib/supabase-storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
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
