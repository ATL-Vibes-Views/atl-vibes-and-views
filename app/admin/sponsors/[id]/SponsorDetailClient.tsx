"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { TabNav } from "@/components/portal/TabNav";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FormGroup } from "@/components/portal/FormGroup";
import { FormInput } from "@/components/portal/FormInput";
import { FormTextarea } from "@/components/portal/FormTextarea";
import { FormRow } from "@/components/portal/FormRow";
import { ImagePicker } from "@/components/portal/ImagePicker";

/* ============================================================
   SPONSOR DETAIL — 5 tabs per spec:
   1. Sponsor Info (contact, contract dates, value, talking points)
   2. Package & Fulfillment (deliverable tracker w/ progress bars, This Week's To-Do)
   3. Fulfillment Log (chronological timeline with content links)
   4. Ad Creatives & Flights (creative cards with ImagePicker + flights table)
   5. Sponsored Content (blog posts tagged to this sponsor)
   ============================================================ */

export interface SponsorData {
  id: string;
  sponsor_name: string;
  business_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  campaign_name: string | null;
  campaign_start: string | null;
  campaign_end: string | null;
  campaign_value: number | null;
  placement: unknown;
  talking_points: string | null;
  status: string;
  notes: string | null;
  package_type: string | null;
  placements_total: number | null;
  placements_used: number | null;
  category_focus: string | null;
  neighborhood_focus: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface PostRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
}

export interface CampaignRow {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  budget: number | null;
  status: string;
}

export interface CreativeRow {
  id: string;
  campaign_id: string;
  creative_type: string;
  headline: string | null;
  target_url: string;
  image_url: string | null;
  is_active: boolean;
}

export interface FlightRow {
  id: string;
  campaign_id: string;
  placement_id: string;
  creative_id: string | null;
  start_date: string;
  end_date: string;
  status: string;
  impressions: number | null;
  clicks: number | null;
}

export interface DeliverableRow {
  id: string;
  deliverable_type: string;
  label: string;
  quantity_owed: number;
  quantity_delivered: number;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
}

export interface FulfillmentLogRow {
  id: string;
  deliverable_id: string | null;
  title: string | null;
  description: string | null;
  channel: string | null;
  platform: string | null;
  content_url: string | null;
  delivered_at: string | null;
}

export interface DropdownOption {
  id: string;
  name: string;
}

interface SponsorDetailClientProps {
  sponsor: SponsorData;
  posts: PostRow[];
  campaigns: CampaignRow[];
  creatives: CreativeRow[];
  flights: FlightRow[];
  deliverables: DeliverableRow[];
  fulfillmentLog: FulfillmentLogRow[];
  packageOptions: DropdownOption[];
  categoryOptions: DropdownOption[];
  neighborhoodOptions: DropdownOption[];
}

const TABS = [
  { label: "Sponsor Info", key: "info" },
  { label: "Package & Fulfillment", key: "fulfillment" },
  { label: "Fulfillment Log", key: "log" },
  { label: "Ad Creatives & Flights", key: "creatives" },
  { label: "Sponsored Content", key: "content" },
];

const statusBadgeMap: Record<string, "green" | "gold" | "gray" | "blue" | "red" | "purple" | "orange"> = {
  active: "green",
  pending: "gold",
  completed: "gray",
  paused: "blue",
  cancelled: "red",
  draft: "gray",
  published: "green",
  scheduled: "purple",
  in_progress: "orange",
  overdue: "red",
  delivered: "green",
};

/* ── Progress bar for deliverable fulfillment ── */
function ProgressBar({ delivered, promised }: { delivered: number; promised: number }) {
  const pct = promised > 0 ? Math.min(100, Math.round((delivered / promised) * 100)) : 0;
  const color = pct >= 100 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#c1121f";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-semibold text-[#374151] whitespace-nowrap">{delivered}/{promised}</span>
    </div>
  );
}

export function SponsorDetailClient({
  sponsor,
  posts,
  campaigns,
  creatives,
  flights,
  deliverables,
  fulfillmentLog,
  packageOptions,
  categoryOptions,
  neighborhoodOptions,
}: SponsorDetailClientProps) {
  const [activeTab, setActiveTab] = useState("info");

  /* ── This week's to-do items (deliverables due within 7 days) ── */
  const thisWeekTodos = useMemo(() => {
    const now = new Date();
    const weekOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return deliverables.filter((d) => {
      if (d.status === "delivered" || d.status === "completed") return false;
      if (!d.due_date) return false;
      const due = new Date(d.due_date);
      return due <= weekOut;
    });
  }, [deliverables]);

  return (
    <>
      <PortalTopbar
        title={sponsor.sponsor_name}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/sponsors"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </Link>
            <button
              onClick={() => console.log("Save sponsor:", sponsor.id)}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
            >
              Save Changes
            </button>
          </div>
        }
      />
      <div className="p-8 max-[899px]:pt-16 space-y-6">
        {/* Status bar */}
        <div className="flex items-center gap-3">
          <StatusBadge variant={statusBadgeMap[sponsor.status] ?? "gray"}>
            {sponsor.status}
          </StatusBadge>
          {sponsor.package_type && (
            <span className="text-[12px] text-[#6b7280]">Package: {sponsor.package_type}</span>
          )}
          {sponsor.campaign_value != null && (
            <span className="text-[12px] text-[#6b7280]">Value: ${sponsor.campaign_value.toLocaleString()}</span>
          )}
        </div>

        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ═══════════════════════════════════════════
            TAB 1 — Sponsor Info
            ═══════════════════════════════════════════ */}
        {activeTab === "info" && (
          <div className="space-y-6">
            <StatGrid columns={4}>
              <StatCard label="Campaign Value" value={sponsor.campaign_value ? `$${sponsor.campaign_value.toLocaleString()}` : "—"} />
              <StatCard label="Placements Used" value={`${sponsor.placements_used ?? 0} / ${sponsor.placements_total ?? 0}`} />
              <StatCard label="Content Pieces" value={posts.length} />
              <StatCard label="Ad Campaigns" value={campaigns.length} />
            </StatGrid>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact info */}
              <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
                <h3 className="font-display text-[16px] font-semibold text-black">Contact</h3>
                <FormGroup label="Sponsor Name">
                  <FormInput value={sponsor.sponsor_name} readOnly />
                </FormGroup>
                <FormRow>
                  <FormGroup label="Contact Name">
                    <FormInput value={sponsor.contact_name ?? ""} readOnly />
                  </FormGroup>
                  <FormGroup label="Email">
                    <FormInput value={sponsor.contact_email ?? ""} readOnly />
                  </FormGroup>
                </FormRow>
                <FormGroup label="Phone">
                  <FormInput value={sponsor.contact_phone ?? ""} readOnly />
                </FormGroup>
              </div>

              {/* Contract dates & value */}
              <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
                <h3 className="font-display text-[16px] font-semibold text-black">Contract</h3>
                <FormRow>
                  <FormGroup label="Start Date">
                    <FormInput type="date" value={sponsor.campaign_start ?? ""} readOnly />
                  </FormGroup>
                  <FormGroup label="End Date">
                    <FormInput type="date" value={sponsor.campaign_end ?? ""} readOnly />
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup label="Campaign Value">
                    <FormInput value={sponsor.campaign_value ? `$${sponsor.campaign_value.toLocaleString()}` : ""} readOnly />
                  </FormGroup>
                  <FormGroup label="Status">
                    <FormInput value={sponsor.status} readOnly />
                  </FormGroup>
                </FormRow>
              </div>
            </div>

            {/* Talking points */}
            <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
              <h3 className="font-display text-[16px] font-semibold text-black">Talking Points</h3>
              <FormGroup label="Key messaging & talking points for content creation">
                <FormTextarea value={sponsor.talking_points ?? ""} readOnly rows={5} placeholder="No talking points yet..." />
              </FormGroup>
            </div>

            {/* Notes */}
            <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
              <h3 className="font-display text-[16px] font-semibold text-black">Internal Notes</h3>
              <FormTextarea value={sponsor.notes ?? ""} readOnly rows={4} placeholder="No notes yet..." />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            TAB 2 — Package & Fulfillment
            ═══════════════════════════════════════════ */}
        {activeTab === "fulfillment" && (
          <div className="space-y-6">
            {/* Package summary */}
            <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
              <h3 className="font-display text-[16px] font-semibold text-black">Package Summary</h3>
              <FormRow>
                <FormGroup label="Package Type">
                  <select
                    defaultValue={sponsor.package_type ?? ""}
                    onChange={(e) => console.log("Package type changed:", e.target.value)}
                    className="w-full border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] font-body text-[#374151] focus:border-[#e6c46d] focus:outline-none transition-colors"
                  >
                    <option value="">Select package...</option>
                    {packageOptions.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </FormGroup>
                <FormGroup label="Category Focus">
                  <select
                    defaultValue={sponsor.category_focus ?? ""}
                    onChange={(e) => console.log("Category focus changed:", e.target.value)}
                    className="w-full border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] font-body text-[#374151] focus:border-[#e6c46d] focus:outline-none transition-colors"
                  >
                    <option value="">Select category...</option>
                    {categoryOptions.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </FormGroup>
                <FormGroup label="Neighborhood Focus">
                  <select
                    defaultValue={sponsor.neighborhood_focus ?? ""}
                    onChange={(e) => console.log("Neighborhood focus changed:", e.target.value)}
                    className="w-full border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] font-body text-[#374151] focus:border-[#e6c46d] focus:outline-none transition-colors"
                  >
                    <option value="">Select neighborhood...</option>
                    {neighborhoodOptions.map((n) => (
                      <option key={n.id} value={n.name}>{n.name}</option>
                    ))}
                  </select>
                </FormGroup>
              </FormRow>
            </div>

            {/* Deliverable tracker with progress bars */}
            <div>
              <h3 className="font-display text-[16px] font-semibold text-black mb-3">Deliverable Tracker</h3>
              {deliverables.length === 0 ? (
                <div className="bg-white border border-[#e5e5e5] p-8 text-center">
                  <p className="text-[13px] text-[#6b7280]">No deliverables defined for this sponsor yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliverables.map((d) => (
                    <div key={d.id} className="bg-white border border-[#e5e5e5] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-display text-[14px] font-semibold text-black">{d.label}</span>
                          <span className="ml-2 text-[11px] text-[#9ca3af] uppercase">{d.deliverable_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {d.due_date && (
                            <span className="text-[11px] text-[#6b7280]">
                              Due {new Date(d.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                          <StatusBadge variant={statusBadgeMap[d.status] ?? "gray"}>
                            {d.status}
                          </StatusBadge>
                        </div>
                      </div>
                      <ProgressBar delivered={d.quantity_delivered} promised={d.quantity_owed} />
                      {d.notes && (
                        <p className="text-[11px] text-[#6b7280] mt-2">{d.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* This Week's To-Do */}
            <div>
              <h3 className="font-display text-[16px] font-semibold text-black mb-3">
                This Week&apos;s To-Do
                {thisWeekTodos.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#c1121f] text-white text-[10px] font-bold">
                    {thisWeekTodos.length}
                  </span>
                )}
              </h3>
              {thisWeekTodos.length === 0 ? (
                <div className="bg-white border border-[#e5e5e5] p-6 text-center">
                  <p className="text-[13px] text-[#6b7280]">Nothing due this week.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {thisWeekTodos.map((d) => (
                    <div key={d.id} className="bg-white border border-[#e5e5e5] p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[13px] font-semibold text-black">{d.label}</span>
                        <span className="ml-2 text-[11px] text-[#9ca3af]">{d.deliverable_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#c1121f] font-semibold">
                          Due {d.due_date ? new Date(d.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                        </span>
                        <span className="text-[11px] text-[#6b7280]">{d.quantity_delivered}/{d.quantity_owed}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            TAB 3 — Fulfillment Log
            ═══════════════════════════════════════════ */}
        {activeTab === "log" && (
          <div className="space-y-4">
            <h3 className="font-display text-[16px] font-semibold text-black">Fulfillment Timeline</h3>
            {fulfillmentLog.length === 0 ? (
              <div className="bg-white border border-[#e5e5e5] p-8 text-center">
                <p className="text-[13px] text-[#6b7280]">No fulfillment activity logged yet.</p>
              </div>
            ) : (
              <div className="relative pl-6">
                {/* Timeline line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#e5e5e5]" />

                {fulfillmentLog.map((entry) => {
                  const dateStr = entry.delivered_at ? new Date(entry.delivered_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }) : "—";
                  return (
                    <div key={entry.id} className="relative mb-4">
                      {/* Timeline dot */}
                      <div className="absolute left-[-17px] top-2 w-3 h-3 rounded-full bg-[#c1121f] border-2 border-white" />
                      <div className="bg-white border border-[#e5e5e5] p-4 ml-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-display text-[13px] font-semibold text-black">{entry.title ?? "Untitled"}</span>
                          <span className="text-[11px] text-[#6b7280]">{dateStr}</span>
                        </div>
                        {entry.description && (
                          <p className="text-[12px] text-[#374151] mt-1">{entry.description}</p>
                        )}
                        {(entry.channel || entry.platform) && (
                          <div className="flex items-center gap-2 mt-1.5">
                            {entry.channel && (
                              <span className="text-[10px] bg-[#f5f5f5] text-[#6b7280] px-2 py-0.5 rounded-full uppercase">{entry.channel}</span>
                            )}
                            {entry.platform && (
                              <span className="text-[10px] bg-[#f5f5f5] text-[#6b7280] px-2 py-0.5 rounded-full uppercase">{entry.platform}</span>
                            )}
                          </div>
                        )}
                        {entry.content_url && (
                          <a
                            href={entry.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-[12px] text-[#c1121f] font-semibold hover:underline"
                          >
                            View Content →
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════
            TAB 4 — Ad Creatives & Flights
            ═══════════════════════════════════════════ */}
        {activeTab === "creatives" && (
          <div className="space-y-6">
            {/* Creative cards with ImagePicker */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-[16px] font-semibold text-black">Ad Creatives</h3>
                <button
                  onClick={() => console.log("Add creative for sponsor:", sponsor.id)}
                  className="px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
                >
                  + Add Creative
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {creatives.length === 0 ? (
                  <p className="col-span-full text-center text-[13px] text-[#6b7280] py-10 bg-white border border-[#e5e5e5]">
                    No creatives for this sponsor.
                  </p>
                ) : (
                  creatives.map((c) => (
                    <div key={c.id} className="bg-white border border-[#e5e5e5] overflow-hidden">
                      <ImagePicker
                        value={c.image_url ?? ""}
                        onChange={(url) => console.log("Update creative image:", c.id, url)}
                        folder={`sponsors/${sponsor.id}`}
                        label={c.creative_type}
                      />
                      <div className="p-3">
                        <p className="text-[13px] font-semibold text-black truncate">{c.headline ?? "Untitled"}</p>
                        <p className="text-[11px] text-[#6b7280] truncate mt-0.5">{c.target_url}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-[#9ca3af] uppercase">{c.creative_type}</span>
                          <StatusBadge variant={c.is_active ? "green" : "gray"}>
                            {c.is_active ? "Active" : "Inactive"}
                          </StatusBadge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Flights table */}
            <div>
              <h3 className="font-display text-[16px] font-semibold text-black mb-3">Ad Flights</h3>
              <AdminDataTable
                columns={[
                  {
                    key: "placement_id",
                    header: "Placement",
                    render: (item: FlightRow) => (
                      <span className="text-[12px] font-mono text-[#6b7280]">{item.placement_id.slice(0, 8)}...</span>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (item: FlightRow) => (
                      <StatusBadge variant={statusBadgeMap[item.status] ?? "gray"}>
                        {item.status}
                      </StatusBadge>
                    ),
                  },
                  {
                    key: "start_date",
                    header: "Start",
                    render: (item: FlightRow) => (
                      <span className="text-[12px] text-[#6b7280]">
                        {new Date(item.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    ),
                  },
                  {
                    key: "end_date",
                    header: "End",
                    render: (item: FlightRow) => (
                      <span className="text-[12px] text-[#6b7280]">
                        {new Date(item.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    ),
                  },
                  {
                    key: "impressions",
                    header: "Impressions",
                    render: (item: FlightRow) => (
                      <span className="text-[13px] text-[#374151]">{item.impressions?.toLocaleString() ?? "—"}</span>
                    ),
                  },
                  {
                    key: "clicks",
                    header: "Clicks",
                    render: (item: FlightRow) => (
                      <span className="text-[13px] text-[#374151]">{item.clicks?.toLocaleString() ?? "—"}</span>
                    ),
                  },
                ]}
                data={flights}
                emptyMessage="No ad flights for this sponsor."
              />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            TAB 5 — Sponsored Content
            ═══════════════════════════════════════════ */}
        {activeTab === "content" && (
          <div className="space-y-4">
            <h3 className="font-display text-[16px] font-semibold text-black">
              Sponsored Blog Posts
              <span className="ml-2 text-[13px] font-normal text-[#6b7280]">({posts.length})</span>
            </h3>
            <AdminDataTable
              columns={[
                {
                  key: "title",
                  header: "Post Title",
                  width: "50%",
                  render: (item: PostRow) => (
                    <Link
                      href="/admin/posts"
                      className="font-display text-[14px] font-semibold text-black hover:text-[#c1121f] transition-colors"
                    >
                      {item.title}
                    </Link>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (item: PostRow) => (
                    <StatusBadge variant={statusBadgeMap[item.status] ?? "gray"}>
                      {item.status}
                    </StatusBadge>
                  ),
                },
                {
                  key: "published_at",
                  header: "Published",
                  render: (item: PostRow) => (
                    <span className="text-[12px] text-[#6b7280]">
                      {item.published_at
                        ? new Date(item.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </span>
                  ),
                },
              ]}
              data={posts}
              emptyMessage="No sponsored content yet."
            />
          </div>
        )}
      </div>
    </>
  );
}
