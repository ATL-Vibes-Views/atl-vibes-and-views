"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/lib/supabase-storage";

/* ============================================================
   IMAGE PICKER — Drag-drop upload with Supabase Storage
   Shows preview, supports upload + URL input
   ============================================================ */

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  hint?: string;
}

export function ImagePicker({
  value,
  onChange,
  folder = "uploads",
  label = "Drop image here or click to upload",
  hint = "PNG, JPG up to 5MB",
}: ImagePickerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    const file = files[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const result = await uploadImage(file, folder);

    if ("error" in result) {
      setError(result.error);
      setUploading(false);
      return;
    }

    onChange(result.url);
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  }

  if (value) {
    return (
      <div className="relative border border-[#e5e5e5] bg-[#fafafa]">
        <img
          src={value}
          alt="Selected"
          className="w-full h-[180px] object-cover"
        />
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-[#e5e5e5] bg-[#fafafa] p-6 text-center cursor-pointer hover:border-[#e6c46d] hover:bg-white transition-colors"
      >
        {uploading ? (
          <p className="text-[12px] font-body text-[#6b7280]">Uploading...</p>
        ) : (
          <>
            <ImageIcon size={20} className="mx-auto mb-2 text-[#6b7280]" />
            <p className="text-[12px] font-body text-[#6b7280]">{label}</p>
            <p className="text-[11px] font-body text-[#9ca3af] mt-1">{hint}</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>
      {error && (
        <p className="mt-1 text-[11px] text-[#c1121f]">{error}</p>
      )}
    </div>
  );
}
