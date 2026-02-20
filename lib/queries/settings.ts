import { createServerClient } from "@/lib/supabase";
import type { HeroPost } from "@/components/ui/HeroSection";

/* ============================================================
   SETTINGS QUERIES — site_settings table + hero resolution
   ============================================================ */

export type SiteSetting = {
  id: string;
  key: string;
  label: string;
  group_name: string;
  value_text: string | null;
  value_media_id: string | null;
  value_post_id: string | null;
};

export type HeroData = {
  type: "image" | "video" | "post" | null;
  imageUrl: string | null;
  videoUrl: string | null;
  postId: string | null;
  alt: string | null;
};

const FALLBACK_HERO: HeroData = {
  type: null,
  imageUrl: null,
  videoUrl: null,
  postId: null,
  alt: null,
};

/* ── Resolve a media_assets row to url + mime ── */
async function resolveMediaUrl(
  id: string | null
): Promise<{ url: string; mime_type: string; alt: string | null } | null> {
  if (!id) return null;
  const sb = createServerClient();
  const { data } = await sb
    .from("media_assets")
    .select("file_url, mime_type, alt_text")
    .eq("id", id)
    .single() as { data: { file_url: string; mime_type: string; alt_text: string | null } | null };
  if (!data) return null;
  return { url: data.file_url, mime_type: data.mime_type, alt: data.alt_text };
}

/* ── Fetch all settings rows for a group ── */
export async function getSettingsByGroup(group_name: string): Promise<SiteSetting[]> {
  const sb = createServerClient();
  const { data } = await sb
    .from("site_settings")
    .select("*")
    .eq("group_name", group_name) as { data: SiteSetting[] | null };
  return data ?? [];
}

/* ── Resolve complete hero data for a static page group ── */
export async function getPageHero(groupName: string): Promise<HeroData> {
  const settings = await getSettingsByGroup(groupName);
  if (!settings.length) return FALLBACK_HERO;

  const byKeySuffix = (suffix: string) =>
    settings.find((s) => s.key.endsWith(suffix));

  const contentType = byKeySuffix("_content_type")?.value_text as
    | "image"
    | "video"
    | "post"
    | null;
  if (!contentType) return FALLBACK_HERO;

  if (contentType === "image" || contentType === "video") {
    const mediaId = byKeySuffix("_media_id")?.value_media_id ?? null;
    if (mediaId) {
      const asset = await resolveMediaUrl(mediaId);
      if (asset) {
        const isVideo = asset.mime_type.startsWith("video/");
        return {
          type: isVideo ? "video" : "image",
          imageUrl: isVideo ? null : asset.url,
          videoUrl: isVideo ? asset.url : null,
          postId: null,
          alt: asset.alt,
        };
      }
    }
    const fallbackUrl = byKeySuffix("_video_url")?.value_text ?? null;
    return {
      type: contentType,
      imageUrl: contentType === "image" ? fallbackUrl : null,
      videoUrl: contentType === "video" ? fallbackUrl : null,
      postId: null,
      alt: null,
    };
  }

  if (contentType === "post") {
    const postId = byKeySuffix("_featured_post_id")?.value_post_id ?? null;
    return { type: "post", imageUrl: null, videoUrl: null, postId, alt: null };
  }

  return FALLBACK_HERO;
}

/* ── Resolve hero data from a record's own columns (areas, neighborhoods, cities) ── */
export async function getRecordHero(
  record: Record<string, unknown> | null
): Promise<HeroData> {
  if (!record) return FALLBACK_HERO;

  const contentType = record.hero_content_type as "image" | "video" | "post" | null;

  if (!contentType) {
    const legacyUrl = record.hero_image_url as string | null;
    return legacyUrl
      ? { type: "image", imageUrl: legacyUrl, videoUrl: null, postId: null, alt: null }
      : FALLBACK_HERO;
  }

  if (contentType === "image" || contentType === "video") {
    const mediaId = record.hero_media_id as string | null;
    if (mediaId) {
      const asset = await resolveMediaUrl(mediaId);
      if (asset) {
        const isVideo = asset.mime_type.startsWith("video/");
        return {
          type: isVideo ? "video" : "image",
          imageUrl: isVideo ? null : asset.url,
          videoUrl: isVideo ? asset.url : null,
          postId: null,
          alt: asset.alt,
        };
      }
    }
    const fallbackUrl = record.hero_image_url as string | null;
    return {
      type: contentType,
      imageUrl: contentType === "image" ? fallbackUrl : null,
      videoUrl: contentType === "video" ? fallbackUrl : null,
      postId: null,
      alt: null,
    };
  }

  if (contentType === "post") {
    return {
      type: "post",
      imageUrl: null,
      videoUrl: null,
      postId: record.hero_featured_post_id as string | null,
      alt: null,
    };
  }

  return FALLBACK_HERO;
}

/* ── Fetch a blog post for use as a hero ── */
export async function getHeroPost(postId: string | null): Promise<HeroPost | null> {
  if (!postId) return null;
  const sb = createServerClient();
  const { data } = await sb
    .from("blog_posts")
    .select("title, slug, featured_image_url, excerpt, published_at, categories(name), profiles(full_name)")
    .eq("id", postId)
    .eq("status", "published")
    .single() as { data: any };
  if (!data) return null;
  return {
    title: data.title,
    slug: data.slug,
    featured_image_url: data.featured_image_url,
    published_at: data.published_at,
    author: data.profiles?.full_name ?? "ATL Vibes & Views",
    category: data.categories?.name ?? null,
  };
}

/* ── Get a single section image URL by key (partner pages, etc.) ── */
export async function getSectionImageUrl(key: string): Promise<string | null> {
  const sb = createServerClient();
  const { data } = await sb
    .from("site_settings")
    .select("value_media_id, value_text")
    .eq("key", key)
    .single() as { data: Pick<SiteSetting, "value_media_id" | "value_text"> | null };
  if (!data) return null;
  if (data.value_media_id) {
    const asset = await resolveMediaUrl(data.value_media_id);
    return asset?.url ?? null;
  }
  return data.value_text ?? null;
}
