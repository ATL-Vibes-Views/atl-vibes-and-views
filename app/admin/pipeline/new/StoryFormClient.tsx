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
import { createStory } from "@/app/admin/actions";

interface StoryFormClientProps {
  categories: { id: string; name: string }[];
  neighborhoods: { id: string; name: string }[];
}

export function StoryFormClient({ categories, neighborhoods }: StoryFormClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const result = await createStory(formData);
    setSaving(false);
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    router.push("/admin/pipeline");
  }

  return (
    <>
      <PortalTopbar title="Add Story" />
      <div className="p-8 max-[899px]:pt-16 space-y-6">
        <Link href="/admin/pipeline" className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Pipeline
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-[720px]">
          <FormGroup label="Headline">
            <FormInput name="headline" placeholder="Story headline" required />
          </FormGroup>

          <FormGroup label="Summary">
            <FormTextarea name="summary" placeholder="Brief summary of the story" rows={4} />
          </FormGroup>

          <FormRow columns={2}>
            <FormGroup label="Source URL">
              <FormInput name="source_url" placeholder="https://..." />
            </FormGroup>
            <FormGroup label="Source Name">
              <FormInput name="source_name" placeholder="manual_entry" defaultValue="manual_entry" />
            </FormGroup>
          </FormRow>

          <FormRow columns={2}>
            <FormGroup label="Neighborhood">
              <select name="neighborhood_id" className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
                <option value="">No neighborhood</option>
                {neighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </FormGroup>
            <FormGroup label="Category">
              <select name="category_id" className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormGroup>
          </FormRow>

          <FormGroup label="Route to (optional)">
            <select name="tier" className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
              <option value="">Auto (S3 scores and routes)</option>
              <option value="blog">Blog</option>
              <option value="script">Script</option>
              <option value="social">Social</option>
            </select>
            <p className="text-[11px] text-[#6b7280] mt-1">
              Leave blank to let S3 score and route automatically. If selected, story status will be set to the corresponding assigned state.
            </p>
          </FormGroup>

          <ButtonBar>
            <Link
              href="/admin/pipeline"
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Story"}
            </button>
          </ButtonBar>
        </form>
      </div>
    </>
  );
}
