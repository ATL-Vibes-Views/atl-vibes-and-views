"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, X as XIcon } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { FormGroup } from "@/components/portal/FormGroup";
import { FormRow } from "@/components/portal/FormRow";
import { FormInput } from "@/components/portal/FormInput";
import { FormTextarea } from "@/components/portal/FormTextarea";
import { ButtonBar } from "@/components/portal/ButtonBar";
import { updateBlogPost } from "@/app/admin/actions";
import { uploadImage } from "@/lib/supabase-storage";

function field(obj: Record<string, unknown> | null, key: string, fallback = ""): string {
  if (!obj) return fallback;
  const v = obj[key];
  if (v === null || v === undefined) return fallback;
  return String(v);
}

interface PostEditClientProps {
  post: Record<string, unknown> | null;
  categories: { id: string; name: string }[];
  neighborhoods: { id: string; name: string }[];
}

export function PostEditClient({ post, categories, neighborhoods }: PostEditClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState(field(post, "title"));
  const [contentHtml, setContentHtml] = useState(field(post, "content_html"));
  const [excerpt, setExcerpt] = useState(field(post, "excerpt"));
  const [type, setType] = useState(field(post, "type"));
  const [contentType, setContentType] = useState(field(post, "content_type"));
  const [categoryId, setCategoryId] = useState(field(post, "category_id"));
  const [neighborhoodId, setNeighborhoodId] = useState(field(post, "neighborhood_id"));
  const [isSponsored, setIsSponsored] = useState(post?.is_sponsored === true);
  const [metaTitle, setMetaTitle] = useState(field(post, "meta_title"));
  const [metaDesc, setMetaDesc] = useState(field(post, "meta_description"));
  const [featuredImageUrl, setFeaturedImageUrl] = useState(field(post, "featured_image_url"));
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !post) return;
    setUploading(true);
    const result = await uploadImage(file, "blog-featured");
    if ("error" in result) {
      alert("Upload error: " + result.error);
      setUploading(false);
      return;
    }
    setFeaturedImageUrl(result.url);
    await updateBlogPost(String(post.id), { featured_image_url: result.url });
    setUploading(false);
  }, [post]);

  const handleSave = useCallback(async () => {
    if (!post) return;
    setSaving(true);
    const result = await updateBlogPost(String(post.id), {
      title,
      content_html: contentHtml || null,
      excerpt: excerpt || null,
      type: type || null,
      content_type: contentType || null,
      category_id: categoryId || null,
      neighborhood_id: neighborhoodId || null,
      is_sponsored: isSponsored,
      meta_title: metaTitle || null,
      meta_description: metaDesc || null,
    });
    setSaving(false);
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    setSaved(true);
    // Redirect based on post status after brief feedback
    const status = String(post.status ?? "draft");
    const redirectPath = (status === "draft" || status === "ready_for_review")
      ? "/admin/publishing"
      : "/admin/posts";
    setTimeout(() => {
      router.push(redirectPath);
    }, 1200);
  }, [post, title, contentHtml, excerpt, type, contentType, categoryId, neighborhoodId, isSponsored, metaTitle, metaDesc, router]);

  const postStatus = String(post?.status ?? "draft");
  const isDraft = postStatus === "draft" || postStatus === "ready_for_review";
  const backHref = isDraft ? "/admin/publishing" : "/admin/posts";
  const backLabel = isDraft ? "Back to Publishing Queue" : "Back to Posts";

  if (!post) {
    return (
      <>
        <PortalTopbar title="Post Not Found" />
        <div className="p-8 text-center">
          <p className="text-[13px] text-[#6b7280]">Blog post not found.</p>
          <Link href="/admin/posts" className="text-[#c1121f] text-sm hover:underline mt-2 inline-block">Back to Posts</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PortalTopbar title="Edit Blog Post" />
      <div className="p-8 space-y-6">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors">
          <ArrowLeft size={14} /> {backLabel}
        </Link>

        <div className="space-y-4 max-w-[720px]">
          <FormGroup label="Title">
            <FormInput value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormGroup>

          <FormGroup label="Content (HTML)">
            <FormTextarea value={contentHtml} onChange={(e) => setContentHtml(e.target.value)} rows={8} />
          </FormGroup>

          <FormGroup label="Excerpt">
            <FormTextarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
          </FormGroup>

          <FormGroup label="Featured Image">
            {featuredImageUrl ? (
              <div className="flex items-start gap-3">
                <div className="w-[200px] h-[120px] bg-[#f5f5f5] border border-[#e5e5e5] overflow-hidden">
                  <img src={featuredImageUrl} alt="Featured" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors cursor-pointer">
                    <Upload size={12} className="mr-1.5" /> Replace
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      setFeaturedImageUrl("");
                      if (post) await updateBlogPost(String(post.id), { featured_image_url: null });
                    }}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border border-[#e5e5e5] text-[#c1121f] hover:border-[#c1121f] transition-colors"
                  >
                    <XIcon size={12} className="mr-1.5" /> Remove
                  </button>
                </div>
              </div>
            ) : uploading ? (
              <div className="border-2 border-dashed border-[#e6c46d] bg-[#fefcf5] p-6 text-center">
                <Loader2 size={20} className="mx-auto mb-2 text-[#6b7280] animate-spin" />
                <p className="text-[12px] text-[#6b7280]">Uploading...</p>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-[#e5e5e5] bg-[#fafafa] p-6 text-center cursor-pointer hover:border-[#e6c46d] hover:bg-white transition-colors">
                <Upload size={20} className="mx-auto mb-2 text-[#6b7280]" />
                <p className="text-[12px] text-[#6b7280]">Drop featured image here or click to upload</p>
                <p className="text-[11px] text-[#9ca3af] mt-1">PNG, JPG, WebP up to 10MB</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </FormGroup>

          <FormRow columns={2}>
            <FormGroup label="Type">
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
                <option value="">Select type</option>
                <option value="news">News</option>
                <option value="roundup">Roundup</option>
                <option value="evergreen_seo">Evergreen SEO</option>
                <option value="sponsor_feature">Sponsor Feature</option>
                <option value="neighborhood_guide">Neighborhood Guide</option>
              </select>
            </FormGroup>
            <FormGroup label="Content Type">
              <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
                <option value="">Select content type</option>
                <option value="news">News</option>
                <option value="guide">Guide</option>
              </select>
            </FormGroup>
          </FormRow>

          <FormRow columns={2}>
            <FormGroup label="Category">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormGroup>
            <FormGroup label="Neighborhood">
              <select value={neighborhoodId} onChange={(e) => setNeighborhoodId(e.target.value)} className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
                <option value="">No neighborhood</option>
                {neighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </FormGroup>
          </FormRow>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_sponsored" checked={isSponsored} onChange={(e) => setIsSponsored(e.target.checked)} className="w-4 h-4 border border-[#e5e5e5]" />
            <label htmlFor="is_sponsored" className="text-[13px] text-[#374151]">Sponsored post</label>
          </div>

          <FormRow columns={2}>
            <FormGroup label="Meta Title">
              <FormInput value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
            </FormGroup>
            <FormGroup label="Meta Description">
              <FormInput value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} />
            </FormGroup>
          </FormRow>

          <ButtonBar>
            <Link
              href={backHref}
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
                saved
                  ? "bg-[#16a34a] text-white"
                  : "bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870]"
              }`}
            >
              {saved ? "Saved \u2713" : saving ? "Saving..." : "Save Changes"}
            </button>
          </ButtonBar>
        </div>
      </div>
    </>
  );
}
