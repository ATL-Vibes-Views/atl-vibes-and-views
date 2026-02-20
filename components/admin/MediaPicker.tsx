"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, X, Search, FolderOpen, Image as ImageIcon, FileVideo, FileText, File, Check } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";

/* ============================================================
   MEDIA PICKER — Admin modal for selecting or uploading assets
   Returns { id, url } pair — never a raw URL alone
   ============================================================ */

interface MediaAssetRow {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  bucket: string | null;
  folder: string | null;
  title: string | null;
  alt_text: string | null;
  caption: string | null;
  created_at: string;
}

export interface MediaPickerProps {
  value?: { id: string; url: string } | null;
  onChange: (asset: { id: string; url: string } | null) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  allowedTypes?: ("image" | "video" | "document")[];
}

const FOLDERS = [
  "uploads",
  "heroes",
  "hub-menu",
  "thumbnails",
  "site-images",
  "blog-media",
  "social-assets",
  "business-media",
  "team-assets",
  "ad-creatives",
  "misc",
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

function AssetIcon({ fileType, className }: { fileType: string; className?: string }) {
  if (fileType === "video") return <FileVideo size={32} className={className ?? "text-[#6b7280]"} />;
  if (fileType === "document") return <FileText size={32} className={className ?? "text-[#6b7280]"} />;
  return <File size={32} className={className ?? "text-[#6b7280]"} />;
}

export function MediaPicker({
  value,
  onChange,
  bucket = "site-images",
  folder = "uploads",
  label = "Choose Image",
  allowedTypes,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"upload" | "library">("upload");

  // Upload tab state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedAsset, setUploadedAsset] = useState<{ id: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Library tab state
  const [assets, setAssets] = useState<MediaAssetRow[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState("");
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [selected, setSelected] = useState<MediaAssetRow | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const PAGE_SIZE = 48;

  const loadAssets = useCallback(async (reset = false) => {
    setLibraryLoading(true);
    setLibraryError("");
    const supabase = createBrowserClient();
    const offset = reset ? 0 : page * PAGE_SIZE;

    let query = supabase
      .from("media_assets")
      .select("id, file_url, file_name, file_type, mime_type, file_size, width, height, bucket, folder, title, alt_text, caption, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE);

    if (allowedTypes && allowedTypes.length > 0) {
      query = query.in("file_type", allowedTypes);
    }

    const { data, error } = await (query as unknown as Promise<{ data: MediaAssetRow[] | null; error: { message: string } | null }>);

    if (error) {
      setLibraryError(error.message);
    } else {
      const rows = data ?? [];
      setAssets(reset ? rows : (prev) => [...prev, ...rows]);
      setHasMore(rows.length === PAGE_SIZE);
      if (!reset) setPage((p) => p + 1);
    }
    setLibraryLoading(false);
  }, [page, allowedTypes]);

  useEffect(() => {
    if (open && tab === "library") {
      setPage(0);
      loadAssets(true);
    }
  }, [open, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose() {
    setOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadTitle("");
    setUploadAlt("");
    setUploadCaption("");
    setUploadError("");
    setUploadedAsset(null);
    setSearch("");
    setFolderFilter("all");
    setSelected(null);
  }

  function handleFileSelect(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    setSelectedFile(file);
    setUploadTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
    setUploadError("");
    setUploadedAsset(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    if (!uploadTitle.trim()) { setUploadError("Title is required."); return; }
    if (selectedFile.type.startsWith("image/") && !uploadAlt.trim()) {
      setUploadError("Alt text is required for images."); return;
    }
    setUploading(true);
    setUploadError("");

    // Step 1: upload file directly to Supabase Storage from the browser
    // (bypasses Vercel's 4.5 MB payload limit)
    const sb = createBrowserClient();
    const ext = selectedFile.name.split(".").pop()?.toLowerCase() ?? "bin";
    const sanitized = selectedFile.name
      .replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const storagePath = `${folder}/${Date.now()}-${sanitized}.${ext}`;

    const { error: storageError } = await sb.storage
      .from(bucket)
      .upload(storagePath, selectedFile, { cacheControl: "3600", upsert: false });

    if (storageError) {
      setUploading(false);
      setUploadError(storageError.message);
      return;
    }

    const { data: urlData } = sb.storage.from(bucket).getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    // Step 2: POST metadata to API route — inserts media_assets row via service role
    const res = await fetch("/api/admin/upload-asset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_url: publicUrl,
        file_name: selectedFile.name,
        mime_type: selectedFile.type,
        file_size: selectedFile.size,
        bucket,
        folder,
        title: uploadTitle.trim(),
        alt_text: uploadAlt.trim() || null,
        caption: uploadCaption.trim() || null,
      }),
    });
    const result = await res.json() as { id: string; url: string } | { error: string };

    setUploading(false);
    if ("error" in result) {
      setUploadError(result.error);
      return;
    }
    setUploadedAsset({ id: result.id, url: result.url });
  }

  function handleUseUploaded() {
    if (!uploadedAsset) return;
    onChange(uploadedAsset);
    handleClose();
  }

  function handleUseSelected() {
    if (!selected) return;
    onChange({ id: selected.id, url: selected.file_url });
    handleClose();
  }

  const filteredAssets = assets.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      (a.title ?? "").toLowerCase().includes(q) ||
      a.file_name.toLowerCase().includes(q);
    const matchesFolder = folderFilter === "all" || a.folder === folderFilter || a.bucket === folderFilter;
    return matchesSearch && matchesFolder;
  });

  return (
    <>
      {/* Trigger */}
      {value ? (
        <div className="flex items-start gap-3">
          <img
            src={value.url}
            alt="Selected asset"
            className="w-20 h-16 object-cover border border-[#e5e5e5] rounded"
          />
          <div className="flex flex-col gap-1 pt-1">
            <span className="text-[12px] text-[#6b7280] truncate max-w-[180px]">{value.url.split("/").pop()}</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setOpen(true); setTab("library"); }}
                className="text-[12px] text-[#1a1a1a] underline hover:text-[#c1121f] transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="text-[12px] text-[#6b7280] hover:text-[#c1121f] transition-colors"
              >
                × Clear
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1a1a1a] text-white text-[13px] font-semibold hover:bg-[#333] transition-colors"
        >
          <Upload size={14} />
          {label}
        </button>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={handleClose}
          />

          {/* Panel */}
          <div className="relative z-10 bg-white w-full max-w-[680px] max-h-[90vh] flex flex-col shadow-2xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5]">
              <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Select Media</h2>
              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f3f4f6] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#e5e5e5] px-6">
              {(["upload", "library"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-4 py-3 text-[13px] font-semibold capitalize border-b-2 transition-colors ${
                    tab === t
                      ? "border-[#fee198] text-[#1a1a1a]"
                      : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* ── UPLOAD TAB ── */}
              {tab === "upload" && (
                <div className="space-y-4">
                  {uploadedAsset ? (
                    <div className="space-y-4">
                      <img
                        src={uploadedAsset.url}
                        alt="Uploaded"
                        className="w-full max-h-[240px] object-contain border border-[#e5e5e5] rounded"
                      />
                      <p className="text-[13px] text-[#374151] text-center">Upload successful!</p>
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={handleUseUploaded}
                          className="px-6 py-2.5 rounded-full bg-[#fee198] text-[#1a1a1a] text-[13px] font-semibold hover:bg-[#fdd870] transition-colors"
                        >
                          Use This Asset
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Drop zone */}
                      {!selectedFile ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDrop={(e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files); }}
                          onDragOver={(e) => e.preventDefault()}
                          className="border-2 border-dashed border-[#e5e5e5] bg-[#fafafa] p-8 text-center cursor-pointer hover:border-[#fee198] hover:bg-white transition-colors rounded"
                        >
                          <ImageIcon size={24} className="mx-auto mb-2 text-[#9ca3af]" />
                          <p className="text-[13px] text-[#6b7280]">Drop file here or click to browse</p>
                          <p className="text-[11px] text-[#9ca3af] mt-1">PNG, JPG, WebP, MP4 up to 50MB</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={allowedTypes?.map((t) => t === "image" ? "image/*" : t === "video" ? "video/*" : "application/pdf,text/*").join(",") ?? "*/*"}
                            onChange={(e) => handleFileSelect(e.target.files)}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {previewUrl && selectedFile.type.startsWith("image/") && (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-full max-h-[200px] object-contain border border-[#e5e5e5] rounded"
                            />
                          )}
                          {!selectedFile.type.startsWith("image/") && (
                            <div className="flex items-center gap-3 p-3 border border-[#e5e5e5] rounded bg-[#fafafa]">
                              <AssetIcon fileType={deriveFileTypeFromMime(selectedFile.type)} />
                              <span className="text-[13px] text-[#374151]">{selectedFile.name}</span>
                            </div>
                          )}

                          <div>
                            <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                              Title <span className="text-[#c1121f]">*</span>
                            </label>
                            <input
                              type="text"
                              value={uploadTitle}
                              onChange={(e) => setUploadTitle(e.target.value)}
                              className="w-full h-[38px] px-3 text-[13px] border border-[#e5e5e5] rounded focus:outline-none focus:border-[#1a1a1a]"
                              placeholder="Descriptive title"
                            />
                          </div>

                          {selectedFile.type.startsWith("image/") && (
                            <div>
                              <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                                Alt Text <span className="text-[#c1121f]">*</span>
                              </label>
                              <input
                                type="text"
                                value={uploadAlt}
                                onChange={(e) => setUploadAlt(e.target.value)}
                                className="w-full h-[38px] px-3 text-[13px] border border-[#e5e5e5] rounded focus:outline-none focus:border-[#1a1a1a]"
                                placeholder="Describe the image for screen readers"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Caption</label>
                            <input
                              type="text"
                              value={uploadCaption}
                              onChange={(e) => setUploadCaption(e.target.value)}
                              className="w-full h-[38px] px-3 text-[13px] border border-[#e5e5e5] rounded focus:outline-none focus:border-[#1a1a1a]"
                              placeholder="Optional caption"
                            />
                          </div>

                          <div className="flex items-center gap-2 text-[12px] text-[#6b7280]">
                            <FolderOpen size={14} />
                            <span>Folder: <strong className="text-[#374151]">{folder}</strong></span>
                          </div>

                          {uploadError && (
                            <p className="text-[12px] text-[#c1121f]">{uploadError}</p>
                          )}

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => { setSelectedFile(null); setPreviewUrl(null); setUploadError(""); }}
                              className="px-4 py-2 rounded-full border border-[#e5e5e5] text-[13px] text-[#374151] hover:border-[#d1d5db] transition-colors"
                            >
                              Change File
                            </button>
                            <button
                              type="button"
                              onClick={handleUpload}
                              disabled={uploading}
                              className="px-6 py-2 rounded-full bg-[#fee198] text-[#1a1a1a] text-[13px] font-semibold hover:bg-[#fdd870] transition-colors disabled:opacity-50"
                            >
                              {uploading ? "Uploading…" : "Upload"}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── LIBRARY TAB ── */}
              {tab === "library" && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title or filename…"
                        className="w-full h-[36px] pl-8 pr-3 text-[13px] border border-[#e5e5e5] rounded focus:outline-none focus:border-[#1a1a1a]"
                      />
                    </div>
                    <select
                      value={folderFilter}
                      onChange={(e) => setFolderFilter(e.target.value)}
                      className="h-[36px] px-3 text-[13px] border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#1a1a1a]"
                    >
                      <option value="all">All Folders</option>
                      {FOLDERS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  {libraryError && (
                    <p className="text-[12px] text-[#c1121f]">{libraryError}</p>
                  )}

                  {libraryLoading && assets.length === 0 ? (
                    <p className="text-[13px] text-[#6b7280] text-center py-8">Loading…</p>
                  ) : filteredAssets.length === 0 ? (
                    <div className="text-center py-12">
                      <ImageIcon size={32} className="mx-auto mb-3 text-[#d1d5db]" />
                      <p className="text-[13px] text-[#6b7280]">
                        {assets.length === 0
                          ? "No media uploaded yet. Switch to the Upload tab to add your first asset."
                          : "No assets match your search."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        {filteredAssets.map((asset) => (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => setSelected(selected?.id === asset.id ? null : asset)}
                            className={`relative text-left border-2 rounded overflow-hidden transition-colors ${
                              selected?.id === asset.id
                                ? "border-[#fee198]"
                                : "border-[#e5e5e5] hover:border-[#d1d5db]"
                            }`}
                          >
                            {/* Thumbnail */}
                            <div className="aspect-[4/3] bg-[#f3f4f6] flex items-center justify-center overflow-hidden">
                              {asset.file_type === "image" ? (
                                <img
                                  src={asset.file_url}
                                  alt={asset.alt_text ?? asset.file_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <AssetIcon fileType={asset.file_type} />
                              )}
                            </div>
                            {/* Selected check */}
                            {selected?.id === asset.id && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#fee198] flex items-center justify-center">
                                <Check size={11} className="text-[#1a1a1a]" />
                              </div>
                            )}
                            {/* Meta */}
                            <div className="p-2">
                              <p className="text-[11px] font-semibold text-[#1a1a1a] truncate">
                                {asset.title ?? asset.file_name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full">
                                  {asset.bucket ?? "—"}
                                </span>
                                {asset.width && asset.height && (
                                  <span className="text-[10px] text-[#9ca3af]">
                                    {asset.width}×{asset.height}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {hasMore && (
                        <div className="text-center pt-2">
                          <button
                            type="button"
                            onClick={() => loadAssets(false)}
                            disabled={libraryLoading}
                            className="px-5 py-2 rounded-full border border-[#e5e5e5] text-[13px] text-[#374151] hover:border-[#d1d5db] transition-colors disabled:opacity-50"
                          >
                            {libraryLoading ? "Loading…" : "Load More"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e5e5] bg-[#fafafa]">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 rounded-full border border-[#e5e5e5] text-[13px] text-[#374151] hover:border-[#d1d5db] transition-colors"
              >
                Cancel
              </button>
              {tab === "library" && selected && (
                <button
                  type="button"
                  onClick={handleUseSelected}
                  className="px-6 py-2 rounded-full bg-[#fee198] text-[#1a1a1a] text-[13px] font-semibold hover:bg-[#fdd870] transition-colors"
                >
                  Use This Asset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function deriveFileTypeFromMime(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf" || mimeType.startsWith("text/")) return "document";
  return "other";
}
