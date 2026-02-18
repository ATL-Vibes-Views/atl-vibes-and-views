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
import { createScript } from "@/app/admin/actions";

export function ScriptFormClient() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const result = await createScript(formData);
    setSaving(false);
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    router.push("/admin/scripts");
  }

  return (
    <>
      <PortalTopbar title="Add Script" />
      <div className="p-8 space-y-6">
        <Link href="/admin/scripts" className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Scripts
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-[720px]">
          <FormGroup label="Title">
            <FormInput name="title" placeholder="Script title" required />
          </FormGroup>

          <FormGroup label="Script Text">
            <FormTextarea name="script_text" placeholder="Write the filming script here..." rows={10} required />
          </FormGroup>

          <FormGroup label="Hook / Call to Action">
            <FormInput name="hook" placeholder="Opening hook or CTA" />
          </FormGroup>

          <FormRow columns={2}>
            <FormGroup label="Format">
              <select name="format" className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]">
                <option value="">Select format</option>
                <option value="talking_head">Talking Head</option>
                <option value="green_screen">Green Screen</option>
                <option value="voiceover">Voiceover</option>
                <option value="text_overlay">Text Overlay</option>
                <option value="b_roll">B-Roll</option>
              </select>
            </FormGroup>
            <FormGroup label="Story ID (optional)">
              <FormInput name="story_id" placeholder="UUID of linked story" />
            </FormGroup>
          </FormRow>

          <ButtonBar>
            <Link
              href="/admin/scripts"
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Script"}
            </button>
          </ButtonBar>
        </form>
      </div>
    </>
  );
}
