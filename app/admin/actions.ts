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

/** Shared helper: fully reset a story back to 'new' with all assignment fields cleared */
async function _resetStoryFull(supabase: ReturnType<typeof createServiceRoleClient>, storyId: string) {
  return supabase
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
    .eq("id", storyId);
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

  // ── Sponsor fulfillment tracking (additive) ──
  const { data: post } = (await supabase
    .from("blog_posts")
    .select("title, is_sponsored, sponsor_business_id")
    .eq("id", id)
    .single()) as { data: { title: string; is_sponsored: boolean; sponsor_business_id: string | null } | null };

  if (post?.is_sponsored && post.sponsor_business_id) {
    const { data: sponsor } = (await supabase
      .from("sponsors")
      .select("id, sponsor_name")
      .eq("business_id", post.sponsor_business_id)
      .single()) as { data: { id: string; sponsor_name: string } | null };

    if (sponsor) {
      // Find active blog_feature deliverable
      const { data: deliverable } = (await supabase
        .from("sponsor_deliverables")
        .select("id")
        .eq("sponsor_id", sponsor.id)
        .eq("deliverable_type", "blog_feature")
        .eq("status", "active")
        .limit(1)
        .single()) as { data: { id: string } | null };

      // Insert fulfillment log entry
      await supabase.from("sponsor_fulfillment_log").insert({
        sponsor_id: sponsor.id,
        deliverable_id: deliverable?.id ?? null,
        deliverable_type: "blog_feature",
        title: post.title,
        channel: "website",
        platform: "website",
        post_id: id,
        delivered_at: new Date().toISOString(),
      } as never);

      // Increment deliverable quantity if found
      if (deliverable) {
        const { data: delRow } = (await supabase
          .from("sponsor_deliverables")
          .select("quantity_delivered")
          .eq("id", deliverable.id)
          .single()) as { data: { quantity_delivered: number } | null };
        if (delRow) {
          await supabase
            .from("sponsor_deliverables")
            .update({ quantity_delivered: delRow.quantity_delivered + 1, updated_at: new Date().toISOString() } as never)
            .eq("id", deliverable.id);
        }
      }

      // Increment placements_used on sponsor
      const { data: sponsorRow } = (await supabase
        .from("sponsors")
        .select("placements_used")
        .eq("id", sponsor.id)
        .single()) as { data: { placements_used: number | null } | null };
      await supabase
        .from("sponsors")
        .update({ placements_used: (sponsorRow?.placements_used ?? 0) + 1, updated_at: new Date().toISOString() } as never)
        .eq("id", sponsor.id);
    }
  }

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

  // Reset source story via post_source_stories
  const { data: links } = (await supabase
    .from("post_source_stories")
    .select("story_id")
    .eq("post_id", postId)) as { data: { story_id: string }[] | null };

  if (links?.length) {
    for (const link of links) {
      await _resetStoryFull(supabase, link.story_id);
    }
  }

  revalidatePath("/admin/posts");
  revalidatePath("/admin/publishing");
  revalidatePath("/admin/pipeline");
  return { success: true };
}

export async function rejectDraftPost(postId: string) {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  // 1. Archive the blog post
  const { error } = await supabase
    .from("blog_posts")
    .update({ status: "archived", updated_at: now } as never)
    .eq("id", postId);
  if (error) return { error: error.message };

  // 2. Find source story via post_source_stories join table
  const { data: links } = (await supabase
    .from("post_source_stories")
    .select("story_id")
    .eq("post_id", postId)) as { data: { story_id: string }[] | null };

  // 3. Reset each source story back to fresh 'new'
  if (links?.length) {
    for (const link of links) {
      await _resetStoryFull(supabase, link.story_id);
    }
  }

  revalidatePath("/admin/publishing");
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/posts");
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

  // Fetch current status to decide banked_at handling (S7 compatibility)
  const { data: story, error: fetchErr } = await supabase
    .from("stories")
    .select("status")
    .eq("id", id)
    .single();
  if (fetchErr) return { error: fetchErr.message };

  const wasBanked = (story as { status: string }).status === "banked";

  const updates: Record<string, unknown> = {
    status: "new",
    score: 0,
    tier: null,
    assigned_blog: false,
    assigned_script: false,
    used_in_blog: false,
    used_in_script: false,
    used_in_blog_at: null,
    used_in_script_at: null,
    expires_at: null,
    updated_at: new Date().toISOString(),
  };
  // S7 compat: preserve banked_at for banked stories so the
  // original bank timestamp survives recycling.
  if (!wasBanked) updates.banked_at = null;

  const { error } = await supabase
    .from("stories")
    .update(updates as never)
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

  // Reset parent story back to fresh 'new' with all assignment fields cleared
  if (script?.story_id) {
    await _resetStoryFull(supabase, script.story_id);
  }

  revalidatePath("/admin/scripts");
  revalidatePath("/admin/social");
  revalidatePath("/admin/pipeline");
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

export async function getSponsorNameByBusinessId(businessId: string) {
  const supabase = createServiceRoleClient();
  const { data } = (await supabase
    .from("sponsors")
    .select("id, sponsor_name")
    .eq("business_id", businessId)
    .single()) as { data: { id: string; sponsor_name: string } | null };
  return data;
}

export async function unpublishBlogPostReverseCredit(postId: string) {
  const supabase = createServiceRoleClient();

  // ── Run ALL existing unpublish logic exactly as-is ──
  const { error } = await supabase
    .from("blog_posts")
    .update({ status: "archived", updated_at: new Date().toISOString() } as never)
    .eq("id", postId);
  if (error) return { error: error.message };

  // Reset source story via post_source_stories
  const { data: links } = (await supabase
    .from("post_source_stories")
    .select("story_id")
    .eq("post_id", postId)) as { data: { story_id: string }[] | null };

  if (links?.length) {
    for (const link of links) {
      await _resetStoryFull(supabase, link.story_id);
    }
  }

  // ── Reverse fulfillment credit ──
  // Find the fulfillment log entries for this post
  const { data: logEntries } = (await supabase
    .from("sponsor_fulfillment_log")
    .select("id, sponsor_id, deliverable_id")
    .eq("post_id", postId)) as { data: { id: string; sponsor_id: string; deliverable_id: string | null }[] | null };

  const logEntry = logEntries?.[0] ?? null;

  if (logEntry) {
    // Delete the fulfillment log entry by post_id
    await supabase
      .from("sponsor_fulfillment_log")
      .delete()
      .eq("post_id", postId);

    // Decrement deliverable quantity if applicable (don't go below 0)
    if (logEntry.deliverable_id) {
      const { data: delRow } = (await supabase
        .from("sponsor_deliverables")
        .select("quantity_delivered")
        .eq("id", logEntry.deliverable_id)
        .single()) as { data: { quantity_delivered: number } | null };
      if (delRow) {
        await supabase
          .from("sponsor_deliverables")
          .update({
            quantity_delivered: Math.max(0, delRow.quantity_delivered - 1),
            updated_at: new Date().toISOString(),
          } as never)
          .eq("id", logEntry.deliverable_id);
      }
    }

    // Decrement placements_used on sponsor (don't go below 0)
    const { data: sponsorRow } = (await supabase
      .from("sponsors")
      .select("placements_used")
      .eq("id", logEntry.sponsor_id)
      .single()) as { data: { placements_used: number | null } | null };
    if (sponsorRow) {
      await supabase
        .from("sponsors")
        .update({
          placements_used: Math.max(0, (sponsorRow.placements_used ?? 0) - 1),
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", logEntry.sponsor_id);
    }
  }

  revalidatePath("/admin/posts");
  revalidatePath("/admin/publishing");
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/sponsors");
  return { success: true };
}

export async function voidFulfillmentEntry(entryId: string, voidReason: string | null) {
  const supabase = createServiceRoleClient();

  // Fetch the entry to get sponsor_id and deliverable_id
  const { data: entry } = (await supabase
    .from("sponsor_fulfillment_log")
    .select("id, sponsor_id, deliverable_id, voided")
    .eq("id", entryId)
    .single()) as { data: { id: string; sponsor_id: string; deliverable_id: string | null; voided: boolean } | null };

  if (!entry) return { error: "Fulfillment entry not found" };
  if (entry.voided) return { error: "Entry already voided" };

  // Mark as voided
  await supabase
    .from("sponsor_fulfillment_log")
    .update({
      voided: true,
      voided_at: new Date().toISOString(),
      void_reason: voidReason || null,
    } as never)
    .eq("id", entryId);

  // Decrement deliverable quantity if applicable (don't go below 0)
  if (entry.deliverable_id) {
    const { data: delRow } = (await supabase
      .from("sponsor_deliverables")
      .select("quantity_delivered")
      .eq("id", entry.deliverable_id)
      .single()) as { data: { quantity_delivered: number } | null };
    if (delRow) {
      await supabase
        .from("sponsor_deliverables")
        .update({
          quantity_delivered: Math.max(0, delRow.quantity_delivered - 1),
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", entry.deliverable_id);
    }
  }

  // Decrement placements_used on sponsor (don't go below 0)
  const { data: sponsorRow } = (await supabase
    .from("sponsors")
    .select("placements_used")
    .eq("id", entry.sponsor_id)
    .single()) as { data: { placements_used: number | null } | null };
  if (sponsorRow) {
    await supabase
      .from("sponsors")
      .update({
        placements_used: Math.max(0, (sponsorRow.placements_used ?? 0) - 1),
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", entry.sponsor_id);
  }

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

// ─── SPONSOR NOTES ───────────────────────────────────────────

export async function addSponsorNote(
  sponsorId: string,
  noteType: "talking_point_log" | "internal_note_log" | "internal_note",
  content: string,
) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("sponsor_notes").insert({
    sponsor_id: sponsorId,
    note_type: noteType,
    content,
  } as never);
  if (error) return { error: error.message };
  revalidatePath(`/admin/sponsors/${sponsorId}`);
  return { success: true };
}

// ─── SPONSOR TASKS (sponsor_notes with note_type = internal_note_log) ──

export async function addTask(
  sponsorId: string,
  description: string,
  dueDate: string | null,
) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("sponsor_notes").insert({
    sponsor_id: sponsorId,
    note_type: "internal_note_log",
    content: description,
    due_date: dueDate || null,
    completed: false,
  } as never);
  if (error) return { error: error.message };
  revalidatePath(`/admin/sponsors/${sponsorId}`);
  return { success: true };
}

export async function updateTask(
  taskId: string,
  description: string,
  dueDate: string | null,
) {
  const supabase = createServiceRoleClient();
  const { data: task } = (await supabase
    .from("sponsor_notes")
    .select("sponsor_id")
    .eq("id", taskId)
    .single()) as { data: { sponsor_id: string } | null };
  const { error } = await supabase
    .from("sponsor_notes")
    .update({ content: description, due_date: dueDate || null, updated_at: new Date().toISOString() } as never)
    .eq("id", taskId);
  if (error) return { error: error.message };
  if (task) revalidatePath(`/admin/sponsors/${task.sponsor_id}`);
  return { success: true };
}

export async function deleteTask(taskId: string) {
  const supabase = createServiceRoleClient();
  const { data: task } = (await supabase
    .from("sponsor_notes")
    .select("sponsor_id")
    .eq("id", taskId)
    .single()) as { data: { sponsor_id: string } | null };
  const { error } = await supabase
    .from("sponsor_notes")
    .delete()
    .eq("id", taskId)
    .eq("note_type", "internal_note_log");
  if (error) return { error: error.message };
  if (task) revalidatePath(`/admin/sponsors/${task.sponsor_id}`);
  return { success: true };
}

export async function completeTask(taskId: string) {
  const supabase = createServiceRoleClient();
  const { data: task } = (await supabase
    .from("sponsor_notes")
    .select("sponsor_id")
    .eq("id", taskId)
    .single()) as { data: { sponsor_id: string } | null };
  const { error } = await supabase
    .from("sponsor_notes")
    .update({ completed: true, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() } as never)
    .eq("id", taskId);
  if (error) return { error: error.message };
  if (task) revalidatePath(`/admin/sponsors/${task.sponsor_id}`);
  return { success: true };
}

export async function uncompleteTask(taskId: string) {
  const supabase = createServiceRoleClient();
  const { data: task } = (await supabase
    .from("sponsor_notes")
    .select("sponsor_id")
    .eq("id", taskId)
    .single()) as { data: { sponsor_id: string } | null };
  const { error } = await supabase
    .from("sponsor_notes")
    .update({ completed: false, completed_at: null, updated_at: new Date().toISOString() } as never)
    .eq("id", taskId);
  if (error) return { error: error.message };
  if (task) revalidatePath(`/admin/sponsors/${task.sponsor_id}`);
  return { success: true };
}

// ─── SPONSOR DELIVERABLE AUTO-CREATE ─────────────────────────

interface PkgDeliverable {
  type: string;
  label: string;
  channel: string;
  quantity_per_month?: number;
  quantity_per_contract?: number;
}

export async function autoCreateDeliverables(sponsorId: string, packageId: string) {
  const supabase = createServiceRoleClient();

  // Step 1: Fetch the package deliverables JSONB
  const { data: pkg } = (await supabase
    .from("sponsor_packages")
    .select("deliverables")
    .eq("id", packageId)
    .single()) as { data: { deliverables: PkgDeliverable[] | null } | null };

  console.log("[autoCreateDeliverables] package JSONB for", packageId, "→", JSON.stringify(pkg?.deliverables));

  if (!pkg?.deliverables?.length) return { error: "No deliverables found in package" };

  const newPkgTypes = pkg.deliverables.map((d) => d.type);

  // Step 2: Fetch sponsor campaign dates
  const { data: sponsor } = (await supabase
    .from("sponsors")
    .select("campaign_start, campaign_end")
    .eq("id", sponsorId)
    .single()) as { data: { campaign_start: string | null; campaign_end: string | null } | null };

  let campaignMonths = 1;
  if (sponsor?.campaign_start && sponsor?.campaign_end) {
    const start = new Date(sponsor.campaign_start);
    const end = new Date(sponsor.campaign_end);
    const diffDays = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    campaignMonths = Math.ceil(diffDays / 30);
  }

  // Step 3: Fetch existing deliverables
  const { data: existing } = (await supabase
    .from("sponsor_deliverables")
    .select("id, deliverable_type, quantity_owed, quantity_delivered")
    .eq("sponsor_id", sponsorId)) as { data: { id: string; deliverable_type: string; quantity_owed: number; quantity_delivered: number }[] | null };

  const existingRows = existing ?? [];
  const existingByType = new Map(existingRows.map((e) => [e.deliverable_type, e]));

  // Step 4: Delete stale rows (only if quantity_delivered = 0)
  const staleRows = existingRows.filter((e) => !newPkgTypes.includes(e.deliverable_type) && e.quantity_delivered === 0);
  let removed = 0;
  if (staleRows.length > 0) {
    const staleIds = staleRows.map((r) => r.id);
    await supabase.from("sponsor_deliverables").delete().in("id", staleIds);
    removed = staleRows.length;
  }

  // Step 5: Create missing deliverables + update quantity_owed on existing
  const toInsert: Record<string, unknown>[] = [];
  let updated = 0;

  for (const item of pkg.deliverables) {
    const qtyOwed = item.quantity_per_contract != null
      ? item.quantity_per_contract
      : (item.quantity_per_month ?? 0) * campaignMonths;

    const existingRow = existingByType.get(item.type);
    if (!existingRow) {
      toInsert.push({
        sponsor_id: sponsorId,
        deliverable_type: item.type,
        label: item.label,
        channel: item.channel,
        quantity_owed: qtyOwed,
        quantity_delivered: 0,
        quantity_scheduled: 0,
        status: "active",
      });
    } else if (existingRow.quantity_owed !== qtyOwed && existingRow.quantity_delivered === 0) {
      await supabase.from("sponsor_deliverables")
        .update({ quantity_owed: qtyOwed, label: item.label, channel: item.channel, updated_at: new Date().toISOString() } as never)
        .eq("id", existingRow.id);
      updated++;
    }
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from("sponsor_deliverables").insert(toInsert as never);
    if (error) return { error: error.message };
  }

  revalidatePath(`/admin/sponsors/${sponsorId}`);

  // Build message
  const added = toInsert.length;
  if (removed === 0 && added === 0 && updated === 0) {
    return { success: true, message: "Package deliverables up to date." };
  }
  const parts: string[] = [];
  if (removed > 0) parts.push(`${removed} removed`);
  if (added > 0) parts.push(`${added} added`);
  if (updated > 0) parts.push(`${updated} updated`);
  return { success: true, message: `Package updated — ${parts.join(", ")}.` };
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

  // ── Sponsor fulfillment tracking (publish now only) ──
  if (data.scheduleMode === "now") {
    // Fetch script title + story_id
    const { data: scriptRow } = (await supabase
      .from("scripts")
      .select("title, story_id")
      .eq("id", scriptId)
      .single()) as { data: { title: string; story_id: string | null } | null };

    const storyId = scriptRow?.story_id ?? data.storyId ?? null;

    if (storyId) {
      // Look up story_businesses to find linked business
      const { data: storyBiz } = (await supabase
        .from("story_businesses")
        .select("business_id")
        .eq("story_id", storyId)
        .limit(1)
        .single()) as { data: { business_id: string } | null };

      if (storyBiz?.business_id) {
        // Check for active sponsor with this business_id
        const { data: sponsor } = (await supabase
          .from("sponsors")
          .select("id")
          .eq("business_id", storyBiz.business_id)
          .eq("is_active", true)
          .limit(1)
          .single()) as { data: { id: string } | null };

        if (sponsor) {
          const platformLabel = data.platforms[0] ?? "social";

          // ── Reel deliverable ──
          const { data: reelDel } = (await supabase
            .from("sponsor_deliverables")
            .select("id")
            .eq("sponsor_id", sponsor.id)
            .eq("deliverable_type", "reel")
            .eq("status", "active")
            .limit(1)
            .single()) as { data: { id: string } | null };

          if (reelDel) {
            await supabase.from("sponsor_fulfillment_log").insert({
              sponsor_id: sponsor.id,
              deliverable_id: reelDel.id,
              deliverable_type: "reel",
              title: scriptRow?.title ?? "Untitled Reel",
              channel: "social",
              platform: platformLabel,
              delivered_at: now,
            } as never);

            // Increment reel quantity_delivered
            const { data: reelRow } = (await supabase
              .from("sponsor_deliverables")
              .select("quantity_delivered")
              .eq("id", reelDel.id)
              .single()) as { data: { quantity_delivered: number } | null };
            if (reelRow) {
              await supabase
                .from("sponsor_deliverables")
                .update({ quantity_delivered: reelRow.quantity_delivered + 1, updated_at: now } as never)
                .eq("id", reelDel.id);
            }

            // Increment placements_used on sponsor
            const { data: sponsorRow } = (await supabase
              .from("sponsors")
              .select("placements_used")
              .eq("id", sponsor.id)
              .single()) as { data: { placements_used: number | null } | null };
            await supabase
              .from("sponsors")
              .update({ placements_used: (sponsorRow?.placements_used ?? 0) + 1, updated_at: now } as never)
              .eq("id", sponsor.id);
          }

          // ── Story Boost deliverable ──
          const { data: boostDel } = (await supabase
            .from("sponsor_deliverables")
            .select("id")
            .eq("sponsor_id", sponsor.id)
            .eq("deliverable_type", "story_boost")
            .eq("status", "active")
            .limit(1)
            .single()) as { data: { id: string } | null };

          if (boostDel) {
            await supabase.from("sponsor_fulfillment_log").insert({
              sponsor_id: sponsor.id,
              deliverable_id: boostDel.id,
              deliverable_type: "story_boost",
              title: scriptRow?.title ?? "Untitled Reel",
              channel: "social",
              platform: platformLabel,
              delivered_at: now,
            } as never);

            // Increment story_boost quantity_delivered
            const { data: boostRow } = (await supabase
              .from("sponsor_deliverables")
              .select("quantity_delivered")
              .eq("id", boostDel.id)
              .single()) as { data: { quantity_delivered: number } | null };
            if (boostRow) {
              await supabase
                .from("sponsor_deliverables")
                .update({ quantity_delivered: boostRow.quantity_delivered + 1, updated_at: now } as never)
                .eq("id", boostDel.id);
            }
          }
        }
      }
    }
  }

  revalidatePath("/admin/social");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/sponsors");
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

    // Reset parent story back to fresh 'new' with all assignment fields cleared
    if (script?.story_id) {
      await _resetStoryFull(supabase, script.story_id);
    }
  } else {
    const { error } = await supabase
      .from("stories")
      .update({ status: "discarded", updated_at: now } as never)
      .eq("id", id);
    if (error) return { error: error.message };
  }
  revalidatePath("/admin/social");
  revalidatePath("/admin/pipeline");
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

export async function removeScriptMedia(
  scriptId: string,
  field: "media_url" | "thumbnail_url",
  storagePath: string | null
) {
  const supabase = createServiceRoleClient();
  if (storagePath) {
    await supabase.storage.from("site-images").remove([storagePath]);
  }
  const { error } = await supabase
    .from("scripts")
    .update({ [field]: null, updated_at: new Date().toISOString() } as never)
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

// ─── AD CAMPAIGNS (Phase 3C) ─────────────────────────────────

export async function createAdCampaign(
  sponsorId: string,
  data: { name: string; start_date: string | null; end_date: string | null; budget: number | null; notes: string | null },
) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("ad_campaigns").insert({
    sponsor_id: sponsorId,
    name: data.name,
    start_date: data.start_date,
    end_date: data.end_date,
    budget: data.budget,
    notes: data.notes,
    status: "draft",
  } as never);
  if (error) return { error: error.message };
  revalidatePath(`/admin/sponsors/${sponsorId}`);
  return { success: true };
}

// ─── AD CREATIVES — CREATE (Phase 3C) ─────────────────────────

export async function createAdCreative(
  campaignId: string,
  sponsorId: string,
  data: {
    creative_type: string;
    headline: string | null;
    body: string | null;
    cta_text: string | null;
    target_url: string;
    alt_text: string | null;
  },
) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("ad_creatives").insert({
    campaign_id: campaignId,
    creative_type: data.creative_type,
    headline: data.headline,
    body: data.body,
    cta_text: data.cta_text,
    target_url: data.target_url,
    alt_text: data.alt_text,
    is_active: true,
  } as never);
  if (error) return { error: error.message };
  revalidatePath(`/admin/sponsors/${sponsorId}`);
  return { success: true };
}

// ─── AD FLIGHTS — CREATE (Phase 3C) ──────────────────────────

export async function createAdFlight(
  campaignId: string,
  sponsorId: string,
  data: {
    placement_id: string;
    creative_id: string | null;
    start_date: string;
    end_date: string;
    share_of_voice: number;
    priority: number;
  },
) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("ad_flights").insert({
    campaign_id: campaignId,
    placement_id: data.placement_id,
    creative_id: data.creative_id,
    start_date: data.start_date,
    end_date: data.end_date,
    share_of_voice: data.share_of_voice,
    priority: data.priority,
    status: "scheduled",
  } as never);
  if (error) return { error: error.message };
  revalidatePath(`/admin/sponsors/${sponsorId}`);
  return { success: true };
}

// ─── CREATE REEL (one-off from Social Queue) ──────────────────

export async function createReel(data: {
  title: string;
  story_id: string | null;
  platform_captions: Record<string, unknown>;
  media_url: string | null;
  sponsor_id: string | null;
}) {
  const supabase = createServiceRoleClient();

  const { data: inserted, error } = (await supabase
    .from("scripts")
    .insert({
      title: data.title,
      story_id: data.story_id || null,
      platform_captions: data.platform_captions,
      media_url: data.media_url || null,
      platform: "reel",
      format: "reel",
      status: "approved",
    } as never)
    .select("id")
    .single()) as { data: { id: string } | null; error: { message: string } | null };
  if (error) return { error: error.message };

  // If sponsor selected and story selected, link story to sponsor's business
  if (data.sponsor_id && data.story_id) {
    const { data: sponsor } = (await supabase
      .from("sponsors")
      .select("business_id")
      .eq("id", data.sponsor_id)
      .single()) as { data: { business_id: string | null } | null };

    if (sponsor?.business_id) {
      // Check if link already exists
      const { data: existing } = (await supabase
        .from("story_businesses")
        .select("id")
        .eq("story_id", data.story_id)
        .eq("business_id", sponsor.business_id)
        .limit(1)
        .single()) as { data: { id: string } | null };

      if (!existing) {
        await supabase.from("story_businesses").insert({
          story_id: data.story_id,
          business_id: sponsor.business_id,
        } as never);
      }
    }
  }

  revalidatePath("/admin/social");
  return { success: true };
}

// ─── TRIGGER BLOG GENERATION (S4 webhook) ─────────────────────

export async function triggerBlogGeneration(storyId: string) {
  const webhookUrl = process.env.MAKE_S4_WEBHOOK_URL;
  if (!webhookUrl) return { error: "MAKE_S4_WEBHOOK_URL is not configured" };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story_id: storyId }),
    });
    if (!res.ok) {
      return { error: `Webhook returned ${res.status}: ${res.statusText}` };
    }
  } catch (e) {
    return { error: `Webhook request failed: ${e instanceof Error ? e.message : String(e)}` };
  }

  revalidatePath("/admin/pipeline");
  return { success: true };
}
