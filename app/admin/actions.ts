"use server";

import { createServiceRoleClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/* ============================================================
   ADMIN SERVER ACTIONS
   All INSERT / UPDATE operations use service-role client.
   ============================================================ */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── BLOG POSTS ───────────────────────────────────────────────

export async function createBlogPost(formData: FormData) {
  const supabase = createServiceRoleClient();
  const title = formData.get("title") as string;
  const slug = slugify(title);
  const content_html = (formData.get("content_html") as string) || null;
  const excerpt = (formData.get("excerpt") as string) || null;
  const type = (formData.get("type") as string) || null;
  const content_type = (formData.get("content_type") as string) || null;
  const category_id = (formData.get("category_id") as string) || null;
  const neighborhood_id = (formData.get("neighborhood_id") as string) || null;
  const area_id = (formData.get("area_id") as string) || null;
  const is_sponsored = formData.get("is_sponsored") === "on";
  const meta_title = (formData.get("meta_title") as string) || null;
  const meta_description = (formData.get("meta_description") as string) || null;

  const { error } = await supabase.from("blog_posts").insert({
    title,
    slug,
    content_html,
    excerpt,
    type,
    content_type,
    category_id,
    neighborhood_id,
    is_sponsored,
    meta_title,
    meta_description,
    status: "draft",
    content_source: "manual",
  } as never);

  if (error) return { error: error.message };
  revalidatePath("/admin/publishing");
  return { success: true };
}

export async function updateBlogPost(id: string, data: Record<string, unknown>) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/publishing");
  revalidatePath("/admin/posts");
  return { success: true };
}

export async function publishBlogPost(id: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/publishing");
  revalidatePath("/admin/posts");
  return { success: true };
}

export async function unpublishBlogPost(postId: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({ status: "archived", updated_at: new Date().toISOString() } as never)
    .eq("id", postId);
  if (error) return { error: error.message };
  revalidatePath("/admin/posts");
  revalidatePath("/admin/publishing");
  return { success: true };
}

// ─── STORIES ──────────────────────────────────────────────────

export async function createStory(formData: FormData) {
  const supabase = createServiceRoleClient();
  const headline = formData.get("headline") as string;
  const summary = (formData.get("summary") as string) || null;
  const source_url = (formData.get("source_url") as string) || null;
  const source_name = (formData.get("source_name") as string) || "manual_entry";
  const neighborhood_id = (formData.get("neighborhood_id") as string) || null;
  const category_id = (formData.get("category_id") as string) || null;
  const tier = (formData.get("tier") as string) || null;

  // Routing logic: tier determines status
  let status = "new";
  if (tier === "blog") status = "assigned_blog";
  else if (tier === "script") status = "assigned_script";
  else if (tier === "social") status = "assigned_social";

  const { error } = await supabase.from("stories").insert({
    headline,
    summary,
    source_url,
    source_name: source_name || "manual_entry",
    neighborhood_id,
    category_id,
    tier,
    status,
  } as never);

  if (error) return { error: error.message };
  revalidatePath("/admin/pipeline");
  return { success: true };
}

export async function updateStoryStatus(id: string, status: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("stories")
    .update({ status, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/pipeline");
  return { success: true };
}

export async function resetStoryToNew(id: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("stories")
    .update({
      status: "new",
      score: null,
      tier: null,
      assigned_blog: false,
      assigned_script: false,
      used_in_blog: false,
      used_in_script: false,
      used_in_blog_at: null,
      used_in_script_at: null,
      expires_at: null,
      banked_at: null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/pipeline");
  return { success: true };
}

// ─── SCRIPTS ──────────────────────────────────────────────────

export async function createScript(formData: FormData) {
  const supabase = createServiceRoleClient();
  const title = formData.get("title") as string;
  const script_text = formData.get("script_text") as string;
  const hook = (formData.get("hook") as string) || null;
  const format = (formData.get("format") as string) || null;
  const story_id = (formData.get("story_id") as string) || null;

  const { error } = await supabase.from("scripts").insert({
    title,
    script_text,
    call_to_action: hook,
    format,
    story_id,
    status: "draft",
    platform: "reel",
  } as never);

  if (error) return { error: error.message };
  revalidatePath("/admin/scripts");
  return { success: true };
}

export async function updateScript(id: string, data: Record<string, unknown>) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("scripts")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/scripts");
  return { success: true };
}

export async function rejectScript(id: string) {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  // Fetch story_id before killing so we can reset the parent story
  const { data: script } = (await supabase
    .from("scripts")
    .select("story_id")
    .eq("id", id)
    .single()) as { data: { story_id: string | null } | null };

  const { error } = await supabase
    .from("scripts")
    .update({ status: "killed", updated_at: now } as never)
    .eq("id", id);
  if (error) return { error: error.message };

  // Reset parent story back to scored so it returns to the Pipeline
  if (script?.story_id) {
    await supabase
      .from("stories")
      .update({ status: "scored", updated_at: now } as never)
      .eq("id", script.story_id);
  }

  revalidatePath("/admin/scripts");
  revalidatePath("/admin/social");
  return { success: true };
}

export async function approveScript(id: string, storyId: string | null) {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  // Update this script's status to approved
  const { error } = await supabase
    .from("scripts")
    .update({ status: "approved", updated_at: now } as never)
    .eq("id", id);
  if (error) return { error: error.message };

  // Also approve all caption rows for the same story
  if (storyId) {
    await supabase
      .from("scripts")
      .update({ status: "approved", updated_at: now } as never)
      .eq("story_id", storyId);
  }

  revalidatePath("/admin/scripts");
  revalidatePath("/admin/social");
  return { success: true };
}

// ─── REVIEWS ──────────────────────────────────────────────────

export async function updateReviewStatus(id: string, status: string) {
  const supabase = createServiceRoleClient();
  const updateData: Record<string, unknown> = {
    status,
    moderated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (status === "approved") {
    updateData.published_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from("reviews")
    .update(updateData as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/reviews");
  return { success: true };
}

// ─── SUBMISSIONS ──────────────────────────────────────────────

export async function updateSubmissionStatus(id: string, status: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("submissions")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/submissions");
  return { success: true };
}

// ─── MEDIA ITEMS ──────────────────────────────────────────────

export async function createMediaItem(formData: FormData) {
  const supabase = createServiceRoleClient();
  const title = formData.get("title") as string;
  const slug = slugify(title);
  const excerpt = (formData.get("excerpt") as string) || null;
  const description = (formData.get("description") as string) || null;
  const media_type = (formData.get("media_type") as string) || "video";
  const source_type = (formData.get("source_type") as string) || "embed";
  const embed_url = (formData.get("embed_url") as string) || null;
  const seo_title = (formData.get("seo_title") as string) || null;
  const meta_description = (formData.get("meta_description") as string) || null;

  const { error } = await supabase.from("media_items").insert({
    title,
    slug,
    excerpt,
    description,
    media_type,
    source_type,
    embed_url,
    seo_title,
    meta_description,
    status: "draft",
  } as never);

  if (error) return { error: error.message };
  revalidatePath("/admin/media");
  return { success: true };
}

export async function updateMediaItem(id: string, data: Record<string, unknown>) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("media_items")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/media");
  return { success: true };
}

// ─── BUSINESS LISTINGS ────────────────────────────────────────

export async function updateBusiness(id: string, data: Record<string, unknown>) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("business_listings")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/businesses/${id}`);
  revalidatePath("/admin/businesses");
  return { success: true };
}

// ─── EVENTS ───────────────────────────────────────────────────

export async function updateEvent(id: string, data: Record<string, unknown>) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("events")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/events/${id}`);
  revalidatePath("/admin/events");
  return { success: true };
}

// ─── NEIGHBORHOODS ────────────────────────────────────────────

export async function updateNeighborhood(id: string, data: Record<string, unknown>) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("neighborhoods")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/neighborhoods/${id}`);
  revalidatePath("/admin/neighborhoods");
  return { success: true };
}

// ─── AREAS ────────────────────────────────────────────────────

export async function updateArea(id: string, data: Record<string, unknown>) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("areas")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/areas/${id}`);
  revalidatePath("/admin/areas");
  return { success: true };
}

// ─── SPONSORS ─────────────────────────────────────────────────

export async function updateSponsor(id: string, data: Record<string, unknown>) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("sponsors")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/sponsors/${id}`);
  revalidatePath("/admin/sponsors");
  return { success: true };
}

// ─── SPONSOR PACKAGES ─────────────────────────────────────────

export async function createSponsorPackage(formData: FormData) {
  const supabase = createServiceRoleClient();
  const name = formData.get("name") as string;
  const slug = slugify(name);
  const price_display = formData.get("price_display") as string;
  const billing_cycle = (formData.get("billing_cycle") as string) || "monthly";
  const description = (formData.get("description") as string) || null;

  const { error } = await supabase.from("sponsor_packages").insert({
    name,
    slug,
    price_display,
    billing_cycle,
    description,
  } as never);

  if (error) return { error: error.message };
  revalidatePath("/admin/sponsors/packages");
  return { success: true };
}

export async function updateSponsorPackage(id: string, data: Record<string, unknown>) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("sponsor_packages")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sponsors/packages");
  return { success: true };
}

// ─── CITIES (Beyond ATL) ──────────────────────────────────────

export async function updateCity(id: string, data: Record<string, unknown>) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("cities")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/beyond-atl/${id}`);
  revalidatePath("/admin/beyond-atl");
  return { success: true };
}

// ─── AD PLACEMENTS ────────────────────────────────────────────

export async function createAdPlacement(formData: FormData) {
  const supabase = createServiceRoleClient();
  const name = formData.get("name") as string;
  const channel = formData.get("channel") as string;
  const placement_key = formData.get("placement_key") as string;
  const page_type = (formData.get("page_type") as string) || null;
  const dimensions = (formData.get("dimensions") as string) || null;
  const description = (formData.get("description") as string) || null;

  const { error } = await supabase.from("ad_placements").insert({
    name,
    channel,
    placement_key,
    page_type,
    dimensions,
    description,
  } as never);

  if (error) return { error: error.message };
  revalidatePath("/admin/ad-placements");
  return { success: true };
}

// ─── DISTRIBUTION ────────────────────────────────────────────

export async function distributeScript(
  scriptId: string,
  data: {
    platformCaptions: Record<string, unknown>;
    platforms: string[];
    scheduleMode: "now" | "later";
    scheduledDate?: string;
    storyId?: string | null;
  }
) {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  // Save platform captions to the filming script record
  const updateData: Record<string, unknown> = {
    platform_captions: data.platformCaptions,
    updated_at: now,
  };

  if (data.scheduleMode === "now") {
    updateData.status = "posted";
    updateData.posted_at = now;
  } else {
    updateData.status = "scheduled";
    if (data.scheduledDate) updateData.scheduled_date = data.scheduledDate;
  }

  const { error: scriptErr } = await supabase
    .from("scripts")
    .update(updateData as never)
    .eq("id", scriptId);
  if (scriptErr) return { error: scriptErr.message };

  // Insert published_content for each active platform (publish now only)
  if (data.scheduleMode === "now") {
    for (const platform of data.platforms) {
      await supabase.from("published_content").insert({
        source_story_id: data.storyId || null,
        platform,
        content_format: "reel",
        published_at: now,
      } as never);
    }
  }

  // Insert into content_calendar
  const calendarStatus = data.scheduleMode === "now" ? "published" : "scheduled";
  const calendarDate = data.scheduleMode === "now"
    ? now.split("T")[0]
    : data.scheduledDate ?? now.split("T")[0];
  await supabase.from("content_calendar").insert({
    story_id: data.storyId || null,
    tier: "script",
    scheduled_date: calendarDate,
    status: calendarStatus,
  } as never);

  revalidatePath("/admin/social");
  revalidatePath("/admin/calendar");
  return { success: true };
}

export async function saveDraftDistribution(
  scriptId: string,
  data: {
    platformCaptions: Record<string, unknown>;
    scheduledDate?: string;
  }
) {
  const supabase = createServiceRoleClient();
  const updateData: Record<string, unknown> = {
    platform_captions: data.platformCaptions,
    updated_at: new Date().toISOString(),
  };
  if (data.scheduledDate) updateData.scheduled_date = data.scheduledDate;

  const { error } = await supabase
    .from("scripts")
    .update(updateData as never)
    .eq("id", scriptId);
  if (error) return { error: error.message };
  revalidatePath("/admin/social");
  return { success: true };
}

export async function rejectSocialItem(id: string, kind: "script" | "story") {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  if (kind === "script") {
    const { error } = await supabase
      .from("scripts")
      .update({ status: "killed", updated_at: now } as never)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("stories")
      .update({ status: "discarded", updated_at: now } as never)
      .eq("id", id);
    if (error) return { error: error.message };
  }
  revalidatePath("/admin/social");
  return { success: true };
}

export async function uploadScriptMedia(
  scriptId: string,
  field: "media_url" | "thumbnail_url",
  publicUrl: string
) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("scripts")
    .update({ [field]: publicUrl, updated_at: new Date().toISOString() } as never)
    .eq("id", scriptId);
  if (error) return { error: error.message };
  revalidatePath("/admin/social");
  return { success: true };
}

// ─── PLATFORM CAPTIONS (inline save from Social Queue) ────────

export async function savePlatformCaption(
  scriptId: string,
  platformKey: string,
  captionData: Record<string, unknown>
) {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  // Fetch existing platform_captions
  const { data: script, error: fetchErr } = (await supabase
    .from("scripts")
    .select("platform_captions")
    .eq("id", scriptId)
    .single()) as {
    data: { platform_captions: Record<string, unknown> | null } | null;
    error: unknown;
  };
  if (fetchErr) return { error: String(fetchErr) };

  const existing = (script?.platform_captions ?? {}) as Record<string, unknown>;
  const merged = { ...existing, [platformKey]: captionData };

  const { error } = await supabase
    .from("scripts")
    .update({ platform_captions: merged, updated_at: now } as never)
    .eq("id", scriptId);
  if (error) return { error: error.message };
  revalidatePath("/admin/social");
  return { success: true };
}

// ─── AD CREATIVES ─────────────────────────────────────────────

export async function updateAdCreative(id: string, data: Record<string, unknown>) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("ad_creatives")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sponsors/creatives");
  return { success: true };
}
