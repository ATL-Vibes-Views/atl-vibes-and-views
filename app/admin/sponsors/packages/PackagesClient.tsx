"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { Modal } from "@/components/portal/Modal";
import { createSponsorPackage, updateSponsorPackage } from "@/app/admin/actions";

/* ============================================================
   PACKAGE TEMPLATES — Card layout with parsed deliverables
   ============================================================ */

interface DeliverableItem {
  quantity?: number;
  unit?: string;
  label?: string;
  frequency?: string;
  [key: string]: unknown;
}

interface PackageTemplate {
  id: string;
  name: string;
  price: number | null;
  price_display: string | null;
  billing_cycle: string | null;
  placements_included: number | null;
  description: string | null;
  features: string | null;
  deliverables: DeliverableItem[] | null;
  is_active: boolean;
  created_at: string;
}

interface PackagesClientProps {
  packages: PackageTemplate[];
  sponsors: { id: string; package_id: string | null; package_type: string | null; status: string }[];
}

function parseDeliverableLine(d: DeliverableItem): string {
  // Handle various JSONB shapes: { quantity, unit, frequency }, { label }, or string-like entries
  if (d.label) {
    const parts: string[] = [];
    if (d.quantity) parts.push(String(d.quantity));
    if (d.unit) parts.push(d.unit);
    if (parts.length > 0) return `${parts.join(" ")} — ${d.label}`;
    return d.label;
  }
  if (d.quantity && d.unit) {
    const freq = d.frequency ? `/${d.frequency}` : "";
    return `${d.quantity} ${d.unit}${freq}`;
  }
  // Fallback: stringify the first meaningful value
  const vals = Object.values(d).filter((v) => v != null && v !== "");
  return vals.join(" — ") || "—";
}

export function PackagesClient({ packages, sponsors }: PackagesClientProps) {
  const router = useRouter();
  const [showNewModal, setShowNewModal] = useState(false);
  const [editPkg, setEditPkg] = useState<PackageTemplate | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const result = await createSponsorPackage(formData);
    setSaving(false);
    if (result.error) { alert("Error: " + result.error); return; }
    setShowNewModal(false);
    router.refresh();
  }, [router]);

  const handleEdit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editPkg) return;
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    formData.forEach((value, key) => { data[key] = value || null; });
    const result = await updateSponsorPackage(editPkg.id, data);
    setSaving(false);
    if (result.error) { alert("Error: " + result.error); return; }
    setEditPkg(null);
    router.refresh();
  }, [editPkg, router]);

  // Count sponsors by package_id
  const usageMap = useMemo(() => {
    const map: Record<string, number> = {};
    sponsors.forEach((s) => {
      if (s.package_id) {
        map[s.package_id] = (map[s.package_id] ?? 0) + 1;
      }
    });
    return map;
  }, [sponsors]);

  return (
    <>
      <PortalTopbar
        title="Package Templates"
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/sponsors"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              <ArrowLeft size={14} /> Sponsors
            </Link>
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
            >
              + New Package
            </button>
          </div>
        }
      />
      <div className="p-8 max-[899px]:pt-16 space-y-4">
        {packages.length === 0 ? (
          <div className="bg-white border border-[#e5e5e5] p-10 text-center">
            <p className="text-[13px] text-[#6b7280]">No package templates yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {packages.map((pkg) => {
              const deliverables = Array.isArray(pkg.deliverables) ? pkg.deliverables : [];
              const sponsorCount = usageMap[pkg.id] ?? 0;

              return (
                <div
                  key={pkg.id}
                  className="bg-white border border-[#e5e5e5] flex flex-col"
                >
                  {/* Card header */}
                  <div className="px-5 pt-5 pb-3 border-b border-[#f0f0f0]">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-[#6b7280]" />
                        <h3 className="font-display text-[16px] font-semibold text-black">
                          {pkg.name}
                        </h3>
                      </div>
                      <StatusBadge variant={pkg.is_active ? "green" : "gray"}>
                        {pkg.is_active ? "Active" : "Inactive"}
                      </StatusBadge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-[22px] font-bold text-black">
                        {pkg.price_display ?? (pkg.price ? `$${pkg.price.toLocaleString()}` : "—")}
                      </span>
                      {pkg.billing_cycle && (
                        <span className="text-[12px] text-[#6b7280]">/ {pkg.billing_cycle}</span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {pkg.description && (
                    <div className="px-5 pt-3">
                      <p className="text-[12px] text-[#6b7280] leading-relaxed">{pkg.description}</p>
                    </div>
                  )}

                  {/* Deliverables list */}
                  <div className="px-5 pt-3 pb-4 flex-1">
                    {deliverables.length > 0 ? (
                      <ul className="space-y-1.5">
                        {deliverables.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12px] text-[#374151]">
                            <span className="text-[#c1121f] mt-0.5 flex-shrink-0">&#10003;</span>
                            <span>{parseDeliverableLine(d as DeliverableItem)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-[#9ca3af] italic">No deliverables defined</p>
                    )}
                  </div>

                  {/* Card footer */}
                  <div className="px-5 py-3 border-t border-[#f0f0f0] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#6b7280]">
                        {sponsorCount} active sponsor{sponsorCount !== 1 ? "s" : ""}
                      </span>
                      {pkg.placements_included != null && (
                        <span className="text-[11px] text-[#6b7280]">
                          {pkg.placements_included} placement{pkg.placements_included !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setEditPkg(pkg)}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Package Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="New Package">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Name</label>
            <input name="name" required className="w-full px-3 py-2 text-[13px] border border-[#e5e5e5]" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Price Display</label>
            <input name="price_display" required placeholder="$499/mo" className="w-full px-3 py-2 text-[13px] border border-[#e5e5e5]" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Billing Cycle</label>
            <select name="billing_cycle" className="w-full px-3 py-2 text-[13px] border border-[#e5e5e5]">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Description</label>
            <textarea name="description" rows={3} className="w-full px-3 py-2 text-[13px] border border-[#e5e5e5]" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowNewModal(false)} className="px-6 py-2.5 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151]">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] disabled:opacity-50">{saving ? "Saving..." : "Create"}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Package Modal */}
      <Modal isOpen={!!editPkg} onClose={() => setEditPkg(null)} title="Edit Package">
        {editPkg && (
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1">Name</label>
              <input name="name" defaultValue={editPkg.name} className="w-full px-3 py-2 text-[13px] border border-[#e5e5e5]" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1">Price Display</label>
              <input name="price_display" defaultValue={editPkg.price_display ?? ""} className="w-full px-3 py-2 text-[13px] border border-[#e5e5e5]" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1">Description</label>
              <textarea name="description" defaultValue={editPkg.description ?? ""} rows={3} className="w-full px-3 py-2 text-[13px] border border-[#e5e5e5]" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditPkg(null)} className="px-6 py-2.5 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151]">Cancel</button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
