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
import { UploadZone } from "@/components/portal/UploadZone";
import { createMediaItem } from "@/app/admin/actions";

interface MediaAddClientProps {
  neighborhoods: { id: string; name: string }[];
  sponsors: { id: string; sponsor_name: string }[];
}

export function MediaAddClient({ neighborhoods, sponsors }: MediaAddClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [mediaType, setMediaType] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const result = await createMediaItem(formData);
    setSaving(false);
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    router.push("/admin/media");
  }

  return (
    <>
      <PortalTopbar title="Add Media" />
      <div className="p-8 space-y-6">
        <Link href="/admin/media" className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Media
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-[720px]">
          <FormGroup label="Title">
            <FormInput name="title" placeholder="Enter media title" required />
          </FormGroup>

          <FormRow columns={2}>
            <FormGroup label="Media Type">
              <select name="media_type" value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]" required>
                <option value="">Select type</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="podcast">Podcast</option>
                <option value="short">Short</option>
                <option value="image">Image</option>
              </select>
            </FormGroup>
            <FormGroup label="Source Type">
              <select name="source_type" className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]" required>
                <option value="embed">Embed</option>
                <option value="asset">Asset (Upload)</option>
              </select>
            </FormGroup>
          </FormRow>

          {mediaType === "podcast" && (
            <FormGroup label="Sponsor" hint="Link this podcast episode to a sponsor for fulfillment tracking">
              <select name="sponsor_id" className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
                <option value="">None</option>
                {sponsors.map((s) => (
                  <option key={s.id} value={s.id}>{s.sponsor_name}</option>
                ))}
              </select>
            </FormGroup>
          )}

          <FormGroup label="Embed URL">
            <FormInput name="embed_url" placeholder="https://youtube.com/watch?v=..." />
          </FormGroup>

          <FormGroup label="Excerpt">
            <FormInput name="excerpt" placeholder="Short excerpt" />
          </FormGroup>

          <FormGroup label="Description">
            <FormTextarea name="description" placeholder="Brief description of the media item" rows={4} />
          </FormGroup>

          <FormRow columns={2}>
            <FormGroup label="SEO Title">
              <FormInput name="seo_title" placeholder="SEO title (optional)" />
            </FormGroup>
            <FormGroup label="Meta Description">
              <FormInput name="meta_description" placeholder="Meta description (optional)" />
            </FormGroup>
          </FormRow>

          <FormGroup label="Thumbnail">
            <UploadZone
              onUpload={(files) => console.log("Upload thumbnail:", files)}
              accept="image/*"
              label="Drop thumbnail image here"
              hint="PNG, JPG, WebP up to 5MB — file upload deferred"
            />
          </FormGroup>

          <ButtonBar>
            <Link
              href="/admin/media"
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Media"}
            </button>
          </ButtonBar>
        </form>
      </div>
    </>
  );
}
