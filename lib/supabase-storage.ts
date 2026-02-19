import { createBrowserClient } from "@/lib/supabase";

/* ============================================================
   SUPABASE STORAGE — Upload helper for site-images bucket
   ============================================================ */

const BUCKET = "site-images";

export async function uploadImage(
  file: File,
  folder: string = "uploads"
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = createBrowserClient();

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl, path: fileName };
}

export async function deleteImage(path: string): Promise<{ error?: string }> {
  const supabase = createBrowserClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) return { error: error.message };
  return {};
}

/* ============================================================
   UPLOAD ASSET — Full media_assets row creation
   Returns UploadedAsset with UUID from media_assets table
   ============================================================ */

export interface UploadedAsset {
  id: string;
  url: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  bucket: string;
  folder: string;
}

export interface UploadAssetOptions {
  bucket: string;
  folder: string;
  title?: string;
  alt_text?: string;
  caption?: string;
  source?: "original" | "stock" | "ai_generated" | "user_uploaded";
}

function deriveFileType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf" || mimeType.startsWith("text/")) return "document";
  return "other";
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  try {
    const sharp = (await import("sharp")).default;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { width, height } = await sharp(buffer).metadata();
    if (width && height) return { width, height };
    return null;
  } catch {
    return null;
  }
}

export async function uploadAsset(
  file: File,
  options: UploadAssetOptions
): Promise<UploadedAsset | { error: string }> {
  const { createServiceRoleClient } = await import("@/lib/supabase");
  const supabase = createServiceRoleClient();

  // 1. Upload to Supabase Storage
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const sanitized = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
  const storagePath = `${options.folder}/${Date.now()}-${sanitized}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(options.bucket)
    .upload(storagePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { error: uploadError.message };

  // 2. Get public URL
  const { data: urlData } = supabase.storage
    .from(options.bucket)
    .getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  // 3. Image dimensions
  const fileType = deriveFileType(file.type);
  let width: number | undefined;
  let height: number | undefined;
  if (fileType === "image") {
    const dims = await getImageDimensions(file);
    if (dims) { width = dims.width; height = dims.height; }
  }

  // 4. Insert into media_assets
  const { data: row, error: dbError } = await (supabase
    .from("media_assets")
    .insert({
      file_url: publicUrl,
      file_name: file.name,
      file_type: fileType,
      mime_type: file.type,
      file_size: file.size,
      width: width ?? null,
      height: height ?? null,
      bucket: options.bucket,
      folder: options.folder,
      title: options.title ?? file.name,
      alt_text: options.alt_text ?? null,
      caption: options.caption ?? null,
      source: options.source ?? "user_uploaded",
      is_active: true,
    } as never)
    .select("id")
    .single() as unknown as Promise<{ data: { id: string } | null; error: { message: string } | null }>);

  if (dbError || !row) {
    return { error: dbError?.message ?? "Failed to create media_assets record" };
  }

  return {
    id: row.id,
    url: publicUrl,
    file_name: file.name,
    file_type: fileType,
    mime_type: file.type,
    file_size: file.size,
    width,
    height,
    bucket: options.bucket,
    folder: options.folder,
  };
}
