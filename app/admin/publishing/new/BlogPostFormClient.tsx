"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { FormGroup } from "@/components/portal/FormGroup";
import { FormRow } from "@/components/portal/FormRow";
import { FormInput } from "@/components/portal/FormInput";
import { FormTextarea } from "@/components/portal/FormTextarea";
import { ButtonBar } from "@/components/portal/ButtonBar";
import { createBlogPost } from "@/app/admin/actions";

interface BlogPostFormClientProps {
  categories: { id: string; name: string }[];
  neighborhoods: { id: string; name: string }[];
}

export function BlogPostFormClient({ categories, neighborhoods }: BlogPostFormClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const result = await createBlogPost(formData);
    setSaving(false);
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    router.push("/admin/publishing");
  }

  return (
    <>
      <PortalTopbar title="Add Blog Post" />
      <div className="p-8 space-y-6">
        <Link href="/admin/publishing" className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Publishing Queue
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-[720px]">
          <FormGroup label="Title">
            <FormInput name="title" placeholder="Enter blog post title" required />
          </FormGroup>

          <FormGroup label="Content (HTML)">
            <FormTextarea name="content_html" placeholder="Enter blog post content..." rows={8} />
          </FormGroup>

          <FormGroup label="Excerpt">
            <FormTextarea name="excerpt" placeholder="Brief excerpt or summary" rows={3} />
          </FormGroup>

          <FormRow columns={2}>
            <FormGroup label="Type">
              <select name="type" className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
                <option value="">Select type</option>
                <option value="news">News</option>
                <option value="roundup">Roundup</option>
                <option value="evergreen_seo">Evergreen SEO</option>
                <option value="sponsor_feature">Sponsor Feature</option>
                <option value="neighborhood_guide">Neighborhood Guide</option>
              </select>
            </FormGroup>
            <FormGroup label="Content Type">
              <select name="content_type" className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
                <option value="">Select content type</option>
                <option value="news">News</option>
                <option value="guide">Guide</option>
              </select>
            </FormGroup>
          </FormRow>

          <FormRow columns={2}>
            <FormGroup label="Category">
              <select name="category_id" className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormGroup>
            <FormGroup label="Neighborhood">
              <select name="neighborhood_id" className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
                <option value="">No neighborhood</option>
                {neighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </FormGroup>
          </FormRow>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="is_sponsored" id="is_sponsored" className="w-4 h-4 border border-[#e5e5e5]" />
            <label htmlFor="is_sponsored" className="text-[13px] text-[#374151]">Sponsored post</label>
          </div>

          <FormRow columns={2}>
            <FormGroup label="Meta Title">
              <FormInput name="meta_title" placeholder="SEO title (optional)" />
            </FormGroup>
            <FormGroup label="Meta Description">
              <FormInput name="meta_description" placeholder="SEO description (optional)" />
            </FormGroup>
          </FormRow>

          <ButtonBar>
            <Link
              href="/admin/publishing"
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save as Draft"}
            </button>
          </ButtonBar>
        </form>
      </div>
    </>
  );
}
