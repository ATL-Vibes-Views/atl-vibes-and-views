"use client";

import { useState, useRef } from "react";
import { Search, Upload, X, Copy, Check, Trash2, Image as ImageIcon, FileVideo, FileText, File, Images } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { createBrowserClient } from "@/lib/supabase";

interface MediaAssetRow {
  id: string; file_url: string; file_name: string; file_type: string;
  mime_type: string; file_size: number; width: number | null; height: number | null;
  bucket: string | null; folder: string | null; title: string | null;
  alt_text: string | null; caption: string | null; created_at: string; is_active: boolean;
}

interface MediaLibraryClientProps { initialAssets: MediaAssetRow[]; }

const TYPE_FILTERS = ["All", "Images", "Videos", "Documents"] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];
const SORT_OPTIONS = ["Newest", "Oldest", "A–Z"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];
const FOLDERS = ["All Folders","uploads","heroes","hub-menu","thumbnails","site-images","blog-media","social-assets","business-media","team-assets","ad-creatives","misc"];
const BUCKETS = ["site-images","blog-media","social-assets","business-media","team-assets","ad-creatives","misc"];

function formatBytes(b: number) { if (b < 1024) return `${b} B`; if (b < 1048576) return `${(b/1024).toFixed(1)} KB`; return `${(b/1048576).toFixed(1)} MB`; }
function timeAgo(d: string) { const days = Math.floor((Date.now()-new Date(d).getTime())/86400000); if (days===0) return "Today"; if (days===1) return "Yesterday"; if (days<30) return `${days} days ago`; return `${Math.floor(days/30)} months ago`; }
function AssetIcon({ ft, size=32 }: { ft: string; size?: number }) {
  if (ft==="video") return <FileVideo size={size} className="text-[#6b7280]" />;
  if (ft==="document") return <FileText size={size} className="text-[#6b7280]" />;
  return <File size={size} className="text-[#6b7280]" />;
}

export function MediaLibraryClient({ initialAssets }: MediaLibraryClientProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [folderFilter, setFolderFilter] = useState("All Folders");
  const [sort, setSort] = useState<SortOption>("Newest");
  const [drawer, setDrawer] = useState<MediaAssetRow | null>(null);
  const [editTitle, setEditTitle] = useState(""); const [editAlt, setEditAlt] = useState(""); const [editCaption, setEditCaption] = useState("");
  const [saving, setSaving] = useState(false); const [saveMsg, setSaveMsg] = useState("");
  const [copied, setCopied] = useState(false); const [deleteConfirm, setDeleteConfirm] = useState(false); const [deleting, setDeleting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [upFile, setUpFile] = useState<File|null>(null); const [upPreview, setUpPreview] = useState<string|null>(null);
  const [upTitle, setUpTitle] = useState(""); const [upAlt, setUpAlt] = useState(""); const [upCaption, setUpCaption] = useState("");
  const [upBucket, setUpBucket] = useState("site-images"); const [upFolder, setUpFolder] = useState("uploads");
  const [uploading, setUploading] = useState(false); const [upError, setUpError] = useState("");
  const [hasMore, setHasMore] = useState(initialAssets.length === 48); const [page, setPage] = useState(1); const [loadingMore, setLoadingMore] = useState(false);
  const upInputRef = useRef<HTMLInputElement>(null);

  const filtered = assets.filter(a => {
    const q = search.toLowerCase();
    const ms = !q || (a.title??"").toLowerCase().includes(q) || a.file_name.toLowerCase().includes(q);
    const mt = typeFilter==="All" || (typeFilter==="Images"&&a.file_type==="image") || (typeFilter==="Videos"&&a.file_type==="video") || (typeFilter==="Documents"&&a.file_type==="document");
    const mf = folderFilter==="All Folders" || a.folder===folderFilter || a.bucket===folderFilter;
    return ms && mt && mf;
  }).sort((a,b) => sort==="Oldest" ? new Date(a.created_at).getTime()-new Date(b.created_at).getTime() : sort==="A–Z" ? (a.title??a.file_name).localeCompare(b.title??b.file_name) : new Date(b.created_at).getTime()-new Date(a.created_at).getTime());

  function openDrawer(a: MediaAssetRow) { setDrawer(a); setEditTitle(a.title??""); setEditAlt(a.alt_text??""); setEditCaption(a.caption??""); setCopied(false); setDeleteConfirm(false); setSaveMsg(""); }

  async function handleSave() {
    if (!drawer) return; setSaving(true); setSaveMsg("");
    const sb = createBrowserClient();
    const { error } = await (sb.from("media_assets").update({ title: editTitle, alt_text: editAlt, caption: editCaption } as never).eq("id", drawer.id) as unknown as Promise<{ error: { message: string }|null }>);
    setSaving(false);
    if (error) { setSaveMsg("Error: "+error.message); return; }
    setSaveMsg("Saved!"); setTimeout(()=>setSaveMsg(""), 2500);
    setAssets(p => p.map(a => a.id===drawer.id ? {...a, title:editTitle, alt_text:editAlt, caption:editCaption} : a));
    setDrawer(p => p ? {...p, title:editTitle, alt_text:editAlt, caption:editCaption} : p);
  }

  async function handleCopy() { if (!drawer) return; await navigator.clipboard.writeText(drawer.file_url); setCopied(true); setTimeout(()=>setCopied(false), 2000); }

  async function handleDelete() {
    if (!drawer) return; setDeleting(true);
    const sb = createBrowserClient();
    const { error } = await (sb.from("media_assets").update({ is_active: false } as never).eq("id", drawer.id) as unknown as Promise<{ error: { message: string }|null }>);
    setDeleting(false);
    if (error) { alert("Delete failed: "+error.message); return; }
    setAssets(p => p.filter(a => a.id !== drawer.id)); setDrawer(null);
  }

  async function handleLoadMore() {
    setLoadingMore(true);
    const sb = createBrowserClient();
    const { data } = await (sb.from("media_assets").select("id,file_url,file_name,file_type,mime_type,file_size,width,height,bucket,folder,title,alt_text,caption,created_at,is_active").eq("is_active",true).order("created_at",{ascending:false}).range(page*48, page*48+47) as unknown as Promise<{data:MediaAssetRow[]|null}>);
    const rows = data??[]; setAssets(p=>[...p,...rows]); setHasMore(rows.length===48); setPage(p=>p+1); setLoadingMore(false);
  }

  function handleFileSelect(files: FileList|null) {
    if (!files?.length) return; const f = files[0]; setUpFile(f);
    setUpTitle(f.name.replace(/\.[^.]+$/,"").replace(/[-_]/g," ")); setUpError("");
    setUpPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  }

  async function handleUpload() {
    if (!upFile) return;
    if (!upTitle.trim()) { setUpError("Title is required."); return; }
    if (upFile.type.startsWith("image/") && !upAlt.trim()) { setUpError("Alt text is required for images."); return; }
    setUploading(true); setUpError("");

    // Step 1: upload file directly to Supabase Storage from the browser
    const sb = createBrowserClient();
    const ext = upFile.name.split(".").pop()?.toLowerCase() ?? "bin";
    const sanitized = upFile.name.replace(/\.[^.]+$/,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,40);
    const storagePath = `${upFolder}/${Date.now()}-${sanitized}.${ext}`;

    const { error: storageError } = await sb.storage
      .from(upBucket)
      .upload(storagePath, upFile, { cacheControl: "3600", upsert: false });

    if (storageError) { setUploading(false); setUpError(storageError.message); return; }

    const { data: urlData } = sb.storage.from(upBucket).getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    // Step 2: POST metadata to API route — inserts media_assets row via service role
    const res = await fetch("/api/admin/upload-asset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_url: publicUrl,
        file_name: upFile.name,
        mime_type: upFile.type,
        file_size: upFile.size,
        bucket: upBucket,
        folder: upFolder,
        title: upTitle.trim(),
        alt_text: upAlt.trim() || null,
        caption: upCaption.trim() || null,
      }),
    });
    const result = await res.json() as { id: string; url: string } | { error: string };
    setUploading(false);
    if ("error" in result) { setUpError(result.error); return; }

    const fileType = upFile.type.startsWith("image/") ? "image" : upFile.type.startsWith("video/") ? "video" : "other";
    const newAsset: MediaAssetRow = { id: result.id, file_url: publicUrl, file_name: upFile.name, file_type: fileType, mime_type: upFile.type, file_size: upFile.size, width: null, height: null, bucket: upBucket, folder: upFolder, title: upTitle.trim(), alt_text: upAlt.trim()||null, caption: upCaption.trim()||null, created_at: new Date().toISOString(), is_active: true };
    setAssets(p=>[newAsset,...p]);
    setUploadOpen(false); setUpFile(null); setUpPreview(null); setUpTitle(""); setUpAlt(""); setUpCaption(""); setUpBucket("site-images"); setUpFolder("uploads");
  }

  return (
    <>
      <PortalTopbar title="Media Library" />
      <div className="p-6 md:p-8">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#c1121f] mb-1">ASSETS</p>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-[22px] font-bold text-[#1a1a1a]">Media Library</h1>
            <button type="button" onClick={()=>setUploadOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#fee198] text-[#1a1a1a] text-[13px] font-semibold hover:bg-[#fdd870] transition-colors">
              <Upload size={14} /> Upload Asset
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search assets…" className="w-full h-[36px] pl-8 pr-3 text-[13px] border border-[#e5e5e5] rounded-full focus:outline-none focus:border-[#1a1a1a]" />
          </div>
          <div className="flex gap-1">
            {TYPE_FILTERS.map(t=>(
              <button key={t} type="button" onClick={()=>setTypeFilter(t)} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${typeFilter===t?"bg-[#1a1a1a] text-white":"border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db]"}`}>{t}</button>
            ))}
          </div>
          <select value={folderFilter} onChange={e=>setFolderFilter(e.target.value)} className="h-[36px] px-3 text-[13px] border border-[#e5e5e5] rounded-full bg-white focus:outline-none focus:border-[#1a1a1a]">
            {FOLDERS.map(f=><option key={f} value={f}>{f}</option>)}
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value as SortOption)} className="h-[36px] px-3 text-[13px] border border-[#e5e5e5] rounded-full bg-white focus:outline-none focus:border-[#1a1a1a]">
            {SORT_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <span className="text-[12px] text-[#6b7280] ml-auto">{filtered.length} asset{filtered.length!==1?"s":""}</span>
        </div>

        {filtered.length===0 ? (
          <div className="text-center py-20"><Images size={40} className="mx-auto mb-3 text-[#d1d5db]" /><p className="text-[14px] text-[#6b7280]">No assets found.</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(asset=>(
              <button key={asset.id} type="button" onClick={()=>openDrawer(asset)} className="text-left border border-[#e5e5e5] rounded-lg overflow-hidden hover:border-[#d1d5db] hover:shadow-sm transition-all group">
                <div className="aspect-[4/3] bg-[#f3f4f6] flex items-center justify-center overflow-hidden">
                  {asset.file_type==="image" ? <img src={asset.file_url} alt={asset.alt_text??asset.file_name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200" /> : <AssetIcon ft={asset.file_type} size={36} />}
                </div>
                <div className="p-2.5">
                  <p className="text-[12px] font-semibold text-[#1a1a1a] truncate">{asset.title??asset.file_name}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full">{asset.bucket??"—"}</span>
                    {asset.width&&asset.height&&<span className="text-[10px] text-[#9ca3af]">{asset.width}×{asset.height}</span>}
                  </div>
                  <p className="text-[10px] text-[#9ca3af] mt-0.5">{timeAgo(asset.created_at)}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {hasMore&&<div className="text-center mt-8"><button type="button" onClick={handleLoadMore} disabled={loadingMore} className="px-6 py-2.5 rounded-full border border-[#e5e5e5] text-[13px] text-[#374151] hover:border-[#d1d5db] transition-colors disabled:opacity-50">{loadingMore?"Loading…":"Load More"}</button></div>}
      </div>

      {/* Detail Drawer */}
      {drawer&&(
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setDrawer(null)} />
          <div className="relative z-10 w-[320px] bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5]">
              <h3 className="text-[14px] font-semibold text-[#1a1a1a] truncate pr-2">{drawer.title??drawer.file_name}</h3>
              <button type="button" onClick={()=>setDrawer(null)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f3f4f6] transition-colors flex-shrink-0"><X size={16} /></button>
            </div>
            <div className="bg-[#f3f4f6] flex items-center justify-center p-4">
              {drawer.file_type==="image" ? <img src={drawer.file_url} alt={drawer.alt_text??drawer.file_name} className="max-h-[200px] max-w-full object-contain rounded" /> : <AssetIcon ft={drawer.file_type} size={48} />}
            </div>
            <div className="p-5 space-y-4 flex-1">
              {[["Title",editTitle,setEditTitle],["Alt Text",editAlt,setEditAlt],["Caption",editCaption,setEditCaption]].map(([lbl,val,setter])=>(
                <div key={lbl as string}>
                  <label className="block text-[11px] font-semibold text-[#374151] uppercase tracking-wide mb-1">{lbl as string}</label>
                  <input type="text" value={val as string} onChange={e=>(setter as (v:string)=>void)(e.target.value)} className="w-full h-[36px] px-3 text-[13px] border border-[#e5e5e5] rounded focus:outline-none focus:border-[#1a1a1a]" />
                </div>
              ))}
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-full bg-[#fee198] text-[#1a1a1a] text-[12px] font-semibold hover:bg-[#fdd870] transition-colors disabled:opacity-50">{saving?"Saving…":"Save Changes"}</button>
                {saveMsg&&<span className={`text-[12px] ${saveMsg.startsWith("Error")?"text-[#c1121f]":"text-[#16a34a]"}`}>{saveMsg}</span>}
              </div>
              <div className="border-t border-[#e5e5e5] pt-4 space-y-2">
                {[["File name",drawer.file_name],["File size",formatBytes(drawer.file_size)],["Dimensions",drawer.width&&drawer.height?`${drawer.width} × ${drawer.height}`:"—"],["MIME type",drawer.mime_type],["Bucket",drawer.bucket??"—"],["Folder",drawer.folder??"—"],["Uploaded",new Date(drawer.created_at).toLocaleDateString()]].map(([k,v])=>(
                  <div key={k} className="flex gap-2"><span className="text-[11px] text-[#9ca3af] w-[80px] flex-shrink-0">{k}</span><span className="text-[11px] text-[#374151] break-all">{v}</span></div>
                ))}
              </div>
              <div className="border-t border-[#e5e5e5] pt-4 space-y-2">
                <button type="button" onClick={handleCopy} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-[#e5e5e5] text-[12px] text-[#374151] hover:border-[#d1d5db] transition-colors">
                  {copied?<Check size={13} className="text-[#16a34a]" />:<Copy size={13} />}{copied?"Copied!":"Copy URL"}
                </button>
                {!deleteConfirm ? (
                  <button type="button" onClick={()=>setDeleteConfirm(true)} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-[#fecaca] text-[12px] text-[#c1121f] hover:bg-[#fef2f2] transition-colors"><Trash2 size={13} />Delete Asset</button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-[#374151] text-center">Are you sure? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={()=>setDeleteConfirm(false)} className="flex-1 px-3 py-1.5 rounded-full border border-[#e5e5e5] text-[12px] text-[#374151] hover:border-[#d1d5db] transition-colors">Cancel</button>
                      <button type="button" onClick={handleDelete} disabled={deleting} className="flex-1 px-3 py-1.5 rounded-full bg-[#c1121f] text-white text-[12px] font-semibold hover:bg-[#a00f1a] transition-colors disabled:opacity-50">{deleting?"Deleting…":"Confirm"}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadOpen&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={()=>setUploadOpen(false)} />
          <div className="relative z-10 bg-white w-full max-w-[520px] rounded-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5]">
              <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Upload Asset</h2>
              <button type="button" onClick={()=>setUploadOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f3f4f6] transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {!upFile ? (
                <div onClick={()=>upInputRef.current?.click()} onDrop={e=>{e.preventDefault();handleFileSelect(e.dataTransfer.files);}} onDragOver={e=>e.preventDefault()} className="border-2 border-dashed border-[#e5e5e5] bg-[#fafafa] p-10 text-center cursor-pointer hover:border-[#fee198] hover:bg-white transition-colors rounded">
                  <ImageIcon size={28} className="mx-auto mb-2 text-[#9ca3af]" />
                  <p className="text-[13px] text-[#6b7280]">Drop file here or click to browse</p>
                  <p className="text-[11px] text-[#9ca3af] mt-1">PNG, JPG, WebP, MP4, PDF up to 50MB</p>
                  <input ref={upInputRef} type="file" onChange={e=>handleFileSelect(e.target.files)} className="hidden" />
                </div>
              ) : (
                <>
                  {upPreview&&<img src={upPreview} alt="Preview" className="w-full max-h-[180px] object-contain border border-[#e5e5e5] rounded" />}
                  {!upPreview&&<div className="flex items-center gap-3 p-3 border border-[#e5e5e5] rounded bg-[#fafafa]"><File size={24} className="text-[#6b7280]" /><span className="text-[13px] text-[#374151]">{upFile.name}</span></div>}
                  {[["Title *",upTitle,setUpTitle,true],["Alt Text"+(upFile.type.startsWith("image/")?" *":""),upAlt,setUpAlt,false],["Caption",upCaption,setUpCaption,false]].map(([lbl,val,setter])=>(
                    <div key={lbl as string}>
                      <label className="block text-[12px] font-semibold text-[#374151] mb-1">{lbl as string}</label>
                      <input type="text" value={val as string} onChange={e=>(setter as (v:string)=>void)(e.target.value)} className="w-full h-[38px] px-3 text-[13px] border border-[#e5e5e5] rounded focus:outline-none focus:border-[#1a1a1a]" />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#374151] mb-1">Bucket</label>
                      <select value={upBucket} onChange={e=>setUpBucket(e.target.value)} className="w-full h-[38px] px-3 text-[13px] border border-[#e5e5e5] rounded bg-white focus:outline-none focus:border-[#1a1a1a]">
                        {BUCKETS.map(b=><option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#374151] mb-1">Folder</label>
                      <input type="text" value={upFolder} onChange={e=>setUpFolder(e.target.value)} className="w-full h-[38px] px-3 text-[13px] border border-[#e5e5e5] rounded focus:outline-none focus:border-[#1a1a1a]" placeholder="e.g. heroes" />
                    </div>
                  </div>
                  {upError&&<p className="text-[12px] text-[#c1121f]">{upError}</p>}
                </>
              )}
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e5e5] bg-[#fafafa]">
              <button type="button" onClick={()=>{setUploadOpen(false);setUpFile(null);setUpPreview(null);setUpTitle("");setUpAlt("");setUpCaption("");setUpError("");}} className="px-5 py-2 rounded-full border border-[#e5e5e5] text-[13px] text-[#374151] hover:border-[#d1d5db] transition-colors">Cancel</button>
              {upFile&&<button type="button" onClick={handleUpload} disabled={uploading} className="px-6 py-2 rounded-full bg-[#fee198] text-[#1a1a1a] text-[13px] font-semibold hover:bg-[#fdd870] transition-colors disabled:opacity-50">{uploading?"Uploading…":"Upload"}</button>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
