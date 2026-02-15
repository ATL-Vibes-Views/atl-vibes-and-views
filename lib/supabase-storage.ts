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
