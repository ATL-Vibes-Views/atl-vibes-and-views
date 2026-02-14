"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";

interface UploadZoneProps {
  onUpload: (files: FileList) => void;
  accept?: string;
  label?: string;
  hint?: string;
}

export function UploadZone({
  onUpload,
  accept,
  label = "Drop files here or click to upload",
  hint = "PNG, JPG up to 5MB",
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-[#e5e5e5] bg-[#fafafa] p-6 text-center cursor-pointer hover:border-[#e6c46d] hover:bg-white transition-colors"
    >
      <Upload size={20} className="mx-auto mb-2 text-[#6b7280]" />
      <p className="text-[12px] font-body text-[#6b7280]">{label}</p>
      <p className="text-[11px] font-body text-[#9ca3af] mt-1">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        multiple
      />
    </div>
  );
}
