"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { FormGroup } from "@/components/portal/FormGroup";
import { FormRow } from "@/components/portal/FormRow";
import { FormInput } from "@/components/portal/FormInput";
import { FormTextarea } from "@/components/portal/FormTextarea";
import { ToggleSwitch } from "@/components/portal/ToggleSwitch";
import { ButtonBar } from "@/components/portal/ButtonBar";
import { UploadZone } from "@/components/portal/UploadZone";

interface MediaAddClientProps {
  neighborhoods: { id: string; name: string }[];
}

export function MediaAddClient({ neighborhoods }: MediaAddClientProps) {
  return (
    <>
      <PortalTopbar title="Add Media" />
      <div className="p-8 max-[899px]:pt-16 space-y-6">
        <Link href="/admin/media" className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Media
        </Link>

        <div className="space-y-4 max-w-[720px]">
          <FormGroup label="Title">
            <FormInput placeholder="Enter media title" />
          </FormGroup>

          <FormGroup label="Slug">
            <FormInput placeholder="auto-generated-from-title" readOnly className="bg-[#f5f5f5]" />
          </FormGroup>

          <FormRow columns={2}>
            <FormGroup label="Media Type">
              <select className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
                <option value="">Select type</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="audio">Audio</option>
              </select>
            </FormGroup>
            <FormGroup label="Source Type">
              <select className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
                <option value="">Select source</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="upload">Upload</option>
                <option value="external">External</option>
              </select>
            </FormGroup>
          </FormRow>

          <FormGroup label="Embed URL">
            <FormInput placeholder="https://youtube.com/watch?v=..." />
          </FormGroup>

          <FormGroup label="Description">
            <FormTextarea placeholder="Brief description of the media item" rows={4} />
          </FormGroup>

          <FormGroup label="Neighborhood">
            <select className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
              <option value="">No neighborhood</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </FormGroup>

          <FormGroup label="Thumbnail">
            <UploadZone
              onUpload={(files) => console.log("Upload thumbnail:", files)}
              accept="image/*"
              label="Drop thumbnail image here"
              hint="PNG, JPG, WebP up to 5MB"
            />
          </FormGroup>

          <ToggleSwitch label="Featured" checked={false} onChange={() => console.log("Toggle featured")} />

          <ButtonBar>
            <Link
              href="/admin/media"
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={() => console.log("Save media")}
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors"
            >
              Save Media
            </button>
          </ButtonBar>
        </div>
      </div>
    </>
  );
}
