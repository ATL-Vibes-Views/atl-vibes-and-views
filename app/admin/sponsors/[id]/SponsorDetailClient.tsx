"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Check, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import {
  updateSponsor,
  updateDeliverable,
  voidFulfillmentEntry,
  addSponsorNote,
  autoCreateDeliverables,
  addTask,
  updateTask,
  deleteTask,
  completeTask,
  uncompleteTask,
  createAdCampaign,
  createAdCreative,
  createAdFlight,
  logPinnedPost,
} from "@/app/admin/actions";
import { Modal } from "@/components/portal/Modal";
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
import { FormSelect } from "@/components/portal/FormSelect";
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
  package_id: string | null;
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
  body: string | null;
  cta_text: string | null;
  target_url: string;
  image_url: string | null;
  is_active: boolean;
}

export interface AdPlacementRow {
  id: string;
  name: string;
  channel: string;
  placement_key: string;
}

export interface FlightRow {
  id: string;
  campaign_id: string;
  placement_id: string;
  creative_id: string | null;
  start_date: string;
  end_date: string;
  status: string;
  share_of_voice: number | null;
}

export interface DeliverableRow {
  id: string;
  deliverable_type: string;
  label: string;
  channel?: string;
  quantity_owed: number;
  quantity_delivered: number;
  quantity_scheduled?: number;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
  newsletter_type_id: string | null;
}

export interface FulfillmentLogRow {
  id: string;
  sponsor_id: string;
  deliverable_id: string | null;
  deliverable_type: string | null;
  title: string | null;
  description: string | null;
  channel: string | null;
  platform: string | null;
  content_url: string | null;
  post_id: string | null;
  newsletter_id: string | null;
  delivered_at: string | null;
  voided: boolean;
  voided_at: string | null;
  void_reason: string | null;
  unpinned_at: string | null;
  blog_title: string | null;
  blog_slug: string | null;
}

export interface SponsorNoteRow {
  id: string;
  sponsor_id: string;
  note_type: string;
  content: string;
  due_date: string | null;
  completed: boolean | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessContact {
  business_name: string | null;
  email: string | null;
  phone: string | null;
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
  blogPostCount: number;
  totalDeliverableOwed: number;
  adCampaignCount: number;
  sponsorNotes: SponsorNoteRow[];
  businessContact: BusinessContact | null;
  adPlacements: AdPlacementRow[];
  newsletterTypes: { id: string; name: string }[];
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

/* ── Format date for log entries ── */
function formatNoteDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ── Format short date for task rows ── */
function formatShortDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/* ── Strip [TASK] prefix from legacy content ── */
function stripTaskPrefix(content: string) {
  return content.replace(/^\[TASK\]\s*/i, "");
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
  blogPostCount,
  totalDeliverableOwed,
  adCampaignCount,
  sponsorNotes,
  businessContact,
  adPlacements,
  newsletterTypes,
}: SponsorDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [saving, setSaving] = useState(false);

  /* ── Toast notification ── */
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ── Editable form state for contact + talking points + notes ── */
  const autoName = (!sponsor.contact_name && businessContact?.business_name) ? businessContact.business_name : null;
  const autoEmail = (!sponsor.contact_email && businessContact?.email) ? businessContact.email : null;
  const autoPhone = (!sponsor.contact_phone && businessContact?.phone) ? businessContact.phone : null;

  const [contactName, setContactName] = useState(sponsor.contact_name ?? autoName ?? "");
  const [contactEmail, setContactEmail] = useState(sponsor.contact_email ?? autoEmail ?? "");
  const [contactPhone, setContactPhone] = useState(sponsor.contact_phone ?? autoPhone ?? "");
  const [contactNameAutoFilled, setContactNameAutoFilled] = useState(!!autoName);
  const [contactEmailAutoFilled, setContactEmailAutoFilled] = useState(!!autoEmail);
  const [contactPhoneAutoFilled, setContactPhoneAutoFilled] = useState(!!autoPhone);
  const [talkingPoints, setTalkingPoints] = useState(sponsor.talking_points ?? "");
  const [sponsorName, setSponsorName] = useState(sponsor.sponsor_name);

  const handleSaveSponsor = useCallback(async () => {
    setSaving(true);
    const result = await updateSponsor(sponsor.id, {
      sponsor_name: sponsorName,
      contact_name: contactName || null,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
      talking_points: talkingPoints || null,
    });
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    setContactNameAutoFilled(false);
    setContactEmailAutoFilled(false);
    setContactPhoneAutoFilled(false);
    router.refresh();
  }, [sponsor.id, sponsorName, contactName, contactEmail, contactPhone, talkingPoints, router]);

  const handleSelectChange = useCallback(async (fieldName: string, value: string) => {
    setSaving(true);
    const result = await updateSponsor(sponsor.id, { [fieldName]: value || null });
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [sponsor.id, router]);

  /* ── Talking Points Log Thread state ── */
  const talkingPointNotes = useMemo(
    () => sponsorNotes.filter((n) => n.note_type === "talking_point_log"),
    [sponsorNotes],
  );
  const [showTpLogForm, setShowTpLogForm] = useState(false);
  const [tpLogContent, setTpLogContent] = useState("");
  const [tpLogSaving, setTpLogSaving] = useState(false);

  const handleAddTpLog = useCallback(async () => {
    if (!tpLogContent.trim()) return;
    setTpLogSaving(true);
    const result = await addSponsorNote(sponsor.id, "talking_point_log", tpLogContent.trim());
    setTpLogSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    setTpLogContent("");
    setShowTpLogForm(false);
    router.refresh();
  }, [sponsor.id, tpLogContent, router]);

  /* ── Internal Notes Log Thread state (Fix 3) ── */
  const internalNotes = useMemo(
    () => sponsorNotes.filter((n) => n.note_type === "internal_note"),
    [sponsorNotes],
  );
  const [showInternalNoteForm, setShowInternalNoteForm] = useState(false);
  const [internalNoteContent, setInternalNoteContent] = useState("");
  const [internalNoteSaving, setInternalNoteSaving] = useState(false);

  const handleAddInternalNote = useCallback(async () => {
    if (!internalNoteContent.trim()) return;
    setInternalNoteSaving(true);
    const result = await addSponsorNote(sponsor.id, "internal_note", internalNoteContent.trim());
    setInternalNoteSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    setInternalNoteContent("");
    setShowInternalNoteForm(false);
    router.refresh();
  }, [sponsor.id, internalNoteContent, router]);

  /* ── Task state (Fix 4) ── */
  const allTasks = useMemo(
    () => sponsorNotes.filter((n) => n.note_type === "internal_note_log"),
    [sponsorNotes],
  );
  const activeTasks = useMemo(
    () => allTasks
      .filter((t) => !t.completed)
      .sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      }),
    [allTasks],
  );
  const completedTasks = useMemo(
    () => allTasks.filter((t) => t.completed),
    [allTasks],
  );

  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskDesc, setEditTaskDesc] = useState("");
  const [editTaskDue, setEditTaskDue] = useState("");
  const [editingTaskSaving, setEditingTaskSaving] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);

  const handleAddTaskSubmit = useCallback(async () => {
    if (!newTaskDesc.trim() || !newTaskDue) return;
    setAddingTask(true);
    const result = await addTask(sponsor.id, newTaskDesc.trim(), newTaskDue);
    setAddingTask(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    setNewTaskDesc("");
    setNewTaskDue("");
    setShowAddTaskForm(false);
    router.refresh();
  }, [sponsor.id, newTaskDesc, newTaskDue, router]);

  const handleEditTaskSubmit = useCallback(async () => {
    if (!editingTaskId || !editTaskDesc.trim() || !editTaskDue) return;
    setEditingTaskSaving(true);
    const result = await updateTask(editingTaskId, editTaskDesc.trim(), editTaskDue);
    setEditingTaskSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    setEditingTaskId(null);
    router.refresh();
  }, [editingTaskId, editTaskDesc, editTaskDue, router]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    const result = await deleteTask(taskId);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [router]);

  const handleToggleComplete = useCallback(async (task: SponsorNoteRow) => {
    const result = task.completed
      ? await uncompleteTask(task.id)
      : await completeTask(task.id);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [router]);

  /* ── This Week's To-Do (tasks by due date) ── */
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const weekFromNow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }, []);

  const overdueTasks = useMemo(
    () => activeTasks.filter((t) => t.due_date && t.due_date < todayStr),
    [activeTasks, todayStr],
  );
  const dueThisWeekTasks = useMemo(
    () => activeTasks.filter((t) => t.due_date && t.due_date >= todayStr && t.due_date <= weekFromNow),
    [activeTasks, todayStr, weekFromNow],
  );

  /* ── Auto-create deliverables handler ── */
  const [creatingDeliverables, setCreatingDeliverables] = useState(false);

  const handlePackageChange = useCallback(async (value: string) => {
    setSaving(true);
    // Save package_id to sponsor
    const result = await updateSponsor(sponsor.id, { package_id: value || null });
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }

    // Auto-create deliverables if package selected
    if (value) {
      setCreatingDeliverables(true);
      const delResult = await autoCreateDeliverables(sponsor.id, value);
      setCreatingDeliverables(false);
      if ("error" in delResult && delResult.error) {
        alert("Error creating deliverables: " + delResult.error);
      } else if ("message" in delResult && delResult.message) {
        alert(delResult.message);
      }
    }
    router.refresh();
  }, [sponsor.id, router]);

  /* ── Pacing calculation (Tab 2) ── */
  const pacingInfo = useMemo(() => {
    const now = new Date();
    if (!sponsor.campaign_start) return { state: "no_dates" as const };

    const start = new Date(sponsor.campaign_start);
    if (!sponsor.campaign_end) return { state: "no_dates" as const };

    const end = new Date(sponsor.campaign_end);
    if (now < start) return { state: "not_started" as const, startDate: sponsor.campaign_start };
    if (now > end) return { state: "completed" as const };

    const totalDays = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const campaignProgressPct = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

    const behindPace = deliverables
      .filter((d) => d.status !== "delivered" && d.status !== "completed" && d.quantity_owed > 0)
      .map((d) => {
        const deliveryPct = (d.quantity_delivered / d.quantity_owed) * 100;
        const isBehind = deliveryPct < campaignProgressPct - 10;
        const dueThisWeek = isBehind
          ? Math.ceil((d.quantity_owed * (campaignProgressPct / 100)) - d.quantity_delivered)
          : 0;
        return { ...d, deliveryPct, isBehind, dueThisWeek };
      })
      .filter((d) => d.isBehind);

    return {
      state: "active" as const,
      campaignProgressPct,
      behindPace,
    };
  }, [sponsor.campaign_start, sponsor.campaign_end, deliverables]);

  /* ── Tab 5: Podcast entries from fulfillment log ── */
  const podcastEntries = useMemo(
    () => fulfillmentLog.filter((e) => e.deliverable_type === "podcast_segment" && !e.voided),
    [fulfillmentLog],
  );

  /* ── Tab 5: Reel entries from fulfillment log ── */
  const reelEntries = useMemo(
    () => fulfillmentLog.filter((e) => e.deliverable_type === "reel" && !e.voided),
    [fulfillmentLog],
  );

  /* ── Tab 5: Social post entries from fulfillment log ── */
  const socialEntries = useMemo(
    () => fulfillmentLog.filter((e) =>
      (e.deliverable_type === "story_boost" || e.deliverable_type === "pinned_post") && !e.voided
    ),
    [fulfillmentLog],
  );

  /* ── Tab 4: Ad Campaign/Creative/Flight state (Phase 3C) ── */
  const campaignCreativesMap = useMemo(() => {
    const map: Record<string, CreativeRow[]> = {};
    for (const c of creatives) {
      if (!map[c.campaign_id]) map[c.campaign_id] = [];
      map[c.campaign_id].push(c);
    }
    return map;
  }, [creatives]);

  const campaignFlightsMap = useMemo(() => {
    const map: Record<string, FlightRow[]> = {};
    for (const f of flights) {
      if (!map[f.campaign_id]) map[f.campaign_id] = [];
      map[f.campaign_id].push(f);
    }
    return map;
  }, [flights]);

  const placementMap = useMemo(() => {
    const map: Record<string, AdPlacementRow> = {};
    for (const p of adPlacements) map[p.id] = p;
    return map;
  }, [adPlacements]);

  const creativeMap = useMemo(() => {
    const map: Record<string, CreativeRow> = {};
    for (const c of creatives) map[c.id] = c;
    return map;
  }, [creatives]);

  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const toggleCampaign = (id: string) => setExpandedCampaigns((prev) => ({ ...prev, [id]: !prev[id] }));

  // Add Campaign modal
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignStart, setNewCampaignStart] = useState("");
  const [newCampaignEnd, setNewCampaignEnd] = useState("");
  const [newCampaignBudget, setNewCampaignBudget] = useState("");
  const [newCampaignNotes, setNewCampaignNotes] = useState("");
  const [savingCampaign, setSavingCampaign] = useState(false);

  const handleCreateCampaign = useCallback(async () => {
    if (!newCampaignName.trim()) return;
    setSavingCampaign(true);
    const result = await createAdCampaign(sponsor.id, {
      name: newCampaignName.trim(),
      start_date: newCampaignStart || null,
      end_date: newCampaignEnd || null,
      budget: newCampaignBudget ? parseFloat(newCampaignBudget) : null,
      notes: newCampaignNotes.trim() || null,
    });
    setSavingCampaign(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    setShowCampaignModal(false);
    setNewCampaignName(""); setNewCampaignStart(""); setNewCampaignEnd(""); setNewCampaignBudget(""); setNewCampaignNotes("");
    setToast("Campaign created successfully.");
    router.refresh();
  }, [sponsor.id, newCampaignName, newCampaignStart, newCampaignEnd, newCampaignBudget, newCampaignNotes, router]);

  // Add Creative modal
  const [showCreativeModal, setShowCreativeModal] = useState<string | null>(null); // campaign_id
  const [newCreativeType, setNewCreativeType] = useState("image");
  const [newCreativeHeadline, setNewCreativeHeadline] = useState("");
  const [newCreativeBody, setNewCreativeBody] = useState("");
  const [newCreativeCta, setNewCreativeCta] = useState("");
  const [newCreativeUrl, setNewCreativeUrl] = useState("");
  const [newCreativeAlt, setNewCreativeAlt] = useState("");
  const [savingCreative, setSavingCreative] = useState(false);

  const handleCreateCreative = useCallback(async () => {
    if (!showCreativeModal || !newCreativeUrl.trim()) return;
    setSavingCreative(true);
    const result = await createAdCreative({
      campaign_id: showCreativeModal,
      creative_type: newCreativeType,
      headline: newCreativeHeadline.trim() || null,
      body: newCreativeBody.trim() || null,
      cta_text: newCreativeCta.trim() || null,
      target_url: newCreativeUrl.trim(),
      alt_text: newCreativeAlt.trim() || null,
    });
    setSavingCreative(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    setShowCreativeModal(null);
    setNewCreativeType("image"); setNewCreativeHeadline(""); setNewCreativeBody(""); setNewCreativeCta(""); setNewCreativeUrl(""); setNewCreativeAlt("");
    setToast("Creative added successfully.");
    router.refresh();
  }, [showCreativeModal, sponsor.id, newCreativeType, newCreativeHeadline, newCreativeBody, newCreativeCta, newCreativeUrl, newCreativeAlt, router]);

  // Add Flight modal
  const [showFlightModal, setShowFlightModal] = useState<string | null>(null); // campaign_id
  const [newFlightPlacement, setNewFlightPlacement] = useState("");
  const [newFlightCreative, setNewFlightCreative] = useState("");
  const [newFlightStart, setNewFlightStart] = useState("");
  const [newFlightEnd, setNewFlightEnd] = useState("");
  const [newFlightSov, setNewFlightSov] = useState("100");
  const [newFlightPriority, setNewFlightPriority] = useState("0");
  const [savingFlight, setSavingFlight] = useState(false);

  /* ── Pinned Post modal state ── */
  const [showPinnedPostModal, setShowPinnedPostModal] = useState(false);
  const [pinnedPostUrl, setPinnedPostUrl] = useState("");
  const [pinnedPostDate, setPinnedPostDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [pinnedPostNotes, setPinnedPostNotes] = useState("");
  const [savingPinnedPost, setSavingPinnedPost] = useState(false);

  const activePinnedPosts = useMemo(
    () => fulfillmentLog.filter((e) => e.deliverable_type === "pinned_post" && !e.voided),
    [fulfillmentLog],
  );

  const handleLogPinnedPost = useCallback(async () => {
    setSavingPinnedPost(true);
    const result = await logPinnedPost(sponsor.id, {
      content_url: pinnedPostUrl.trim() || null,
      pinned_at: pinnedPostDate,
      notes: pinnedPostNotes.trim() || null,
    });
    setSavingPinnedPost(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    setShowPinnedPostModal(false);
    setPinnedPostUrl(""); setPinnedPostDate(new Date().toISOString().slice(0, 10)); setPinnedPostNotes("");
    setToast("Pinned post logged successfully.");
    router.refresh();
  }, [sponsor.id, pinnedPostUrl, pinnedPostDate, pinnedPostNotes, router]);

  const handleCreateFlight = useCallback(async () => {
    if (!showFlightModal || !newFlightPlacement || !newFlightStart || !newFlightEnd) return;
    setSavingFlight(true);
    const result = await createAdFlight(showFlightModal, sponsor.id, {
      placement_id: newFlightPlacement,
      creative_id: newFlightCreative || null,
      start_date: newFlightStart,
      end_date: newFlightEnd,
      share_of_voice: parseInt(newFlightSov) || 100,
      priority: parseInt(newFlightPriority) || 0,
    });
    setSavingFlight(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    setShowFlightModal(null);
    setNewFlightPlacement(""); setNewFlightCreative(""); setNewFlightStart(""); setNewFlightEnd(""); setNewFlightSov("100"); setNewFlightPriority("0");
    setToast("Flight scheduled successfully.");
    router.refresh();
  }, [showFlightModal, sponsor.id, newFlightPlacement, newFlightCreative, newFlightStart, newFlightEnd, newFlightSov, newFlightPriority, router]);

  /* ── Void fulfillment entry state ── */
  const [voidModal, setVoidModal] = useState<FulfillmentLogRow | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voiding, setVoiding] = useState(false);

  const handleVoidEntry = useCallback(async () => {
    if (!voidModal) return;
    setVoiding(true);
    const result = await voidFulfillmentEntry(voidModal.id, voidReason.trim() || null);
    setVoiding(false);
    if ("error" in result && result.error) {
      alert("Error: " + result.error);
      return;
    }
    setVoidModal(null);
    setVoidReason("");
    router.refresh();
  }, [voidModal, voidReason, router]);

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-[#1a1a1a] text-white px-5 py-3 rounded-full text-[13px] font-semibold shadow-lg">
            {toast}
          </div>
        </div>
      )}

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
              onClick={handleSaveSponsor}
              disabled={saving}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        }
      />
      <div className="p-8 space-y-6">
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
              <StatCard label="Placements Used" value={`${sponsor.placements_used ?? 0} / ${totalDeliverableOwed || sponsor.placements_total || 0}`} />
              <StatCard label="Content Pieces" value={blogPostCount} />
              <StatCard label="Ad Campaigns" value={adCampaignCount} />
            </StatGrid>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact info */}
              <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
                <h3 className="font-display text-[16px] font-semibold text-black">Contact</h3>
                <FormGroup label="Sponsor Name">
                  <FormInput
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                  />
                </FormGroup>
                <FormRow>
                  <FormGroup label="Contact Name">
                    <div className="relative">
                      <FormInput
                        value={contactName}
                        onChange={(e) => { setContactName(e.target.value); setContactNameAutoFilled(false); }}
                        placeholder={autoName ? "From business listing" : ""}
                      />
                      {contactNameAutoFilled && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#9ca3af] italic">(auto-filled)</span>
                      )}
                    </div>
                  </FormGroup>
                  <FormGroup label="Email">
                    <div className="relative">
                      <FormInput
                        value={contactEmail}
                        onChange={(e) => { setContactEmail(e.target.value); setContactEmailAutoFilled(false); }}
                        placeholder={autoEmail ? "From business listing" : ""}
                      />
                      {contactEmailAutoFilled && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#9ca3af] italic">(auto-filled)</span>
                      )}
                    </div>
                  </FormGroup>
                </FormRow>
                <FormGroup label="Phone">
                  <div className="relative">
                    <FormInput
                      value={contactPhone}
                      onChange={(e) => { setContactPhone(e.target.value); setContactPhoneAutoFilled(false); }}
                      placeholder={autoPhone ? "From business listing" : ""}
                    />
                    {contactPhoneAutoFilled && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#9ca3af] italic">(auto-filled)</span>
                    )}
                  </div>
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
              <FormGroup label="Talking Points (Claude Context)">
                <p className="text-sm text-gray-400 italic -mt-2 mb-2">
                  This text is passed to Claude when generating sponsored blog posts. Keep it current.
                </p>
                <FormTextarea
                  value={talkingPoints}
                  onChange={(e) => setTalkingPoints(e.target.value)}
                  rows={5}
                  placeholder="No talking points yet..."
                />
              </FormGroup>

              {/* Talking Points Log Thread */}
              <div className="border-t border-[#e5e5e5] pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[12px] uppercase tracking-[0.5px] font-semibold text-[#6b7280]">
                    Talking Points Log
                  </h4>
                  {!showTpLogForm && (
                    <button
                      onClick={() => setShowTpLogForm(true)}
                      className="px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
                    >
                      Add Note
                    </button>
                  )}
                </div>

                {showTpLogForm && (
                  <div className="mb-4 space-y-2">
                    <FormTextarea
                      value={tpLogContent}
                      onChange={(e) => setTpLogContent(e.target.value)}
                      rows={3}
                      placeholder="Add a talking points history note..."
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAddTpLog}
                        disabled={tpLogSaving || !tpLogContent.trim()}
                        className="px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {tpLogSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => { setShowTpLogForm(false); setTpLogContent(""); }}
                        className="text-[12px] text-[#6b7280] hover:text-[#374151] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {talkingPointNotes.length === 0 ? (
                  <p className="text-[13px] text-[#9ca3af] italic">
                    No notes yet — add your first talking point history entry.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {talkingPointNotes.map((note) => (
                      <div key={note.id} className="bg-[#fafafa] border border-[#f0f0f0] p-3">
                        <span className="text-[11px] text-[#9ca3af] block mb-1">
                          {formatNoteDate(note.created_at)}
                        </span>
                        <p className="text-[13px] text-[#374151]">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Internal Notes — persistent append-only log (Fix 3) */}
            <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[16px] font-semibold text-black">Internal Notes</h3>
                {!showInternalNoteForm && (
                  <button
                    onClick={() => setShowInternalNoteForm(true)}
                    className="px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
                  >
                    Add Note
                  </button>
                )}
              </div>

              {showInternalNoteForm && (
                <div className="space-y-2">
                  <FormTextarea
                    value={internalNoteContent}
                    onChange={(e) => setInternalNoteContent(e.target.value)}
                    rows={3}
                    placeholder="Add an internal note..."
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddInternalNote}
                      disabled={internalNoteSaving || !internalNoteContent.trim()}
                      className="px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {internalNoteSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => { setShowInternalNoteForm(false); setInternalNoteContent(""); }}
                      className="text-[12px] text-[#6b7280] hover:text-[#374151] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {internalNotes.length === 0 ? (
                <p className="text-[13px] text-[#9ca3af] italic">
                  No internal notes yet — add your first note.
                </p>
              ) : (
                <div className="space-y-2">
                  {internalNotes.map((note) => (
                    <div key={note.id} className="bg-[#fafafa] border border-[#f0f0f0] p-3">
                      <span className="text-[11px] text-[#9ca3af] block mb-1">
                        {formatNoteDate(note.created_at)}
                      </span>
                      <p className="text-[13px] text-[#374151]">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
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
                <FormGroup label="Package">
                  <select
                    defaultValue={sponsor.package_id ?? ""}
                    onChange={(e) => handlePackageChange(e.target.value)}
                    disabled={saving || creatingDeliverables}
                    className="w-full border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] font-body text-[#374151] focus:border-[#e6c46d] focus:outline-none transition-colors disabled:opacity-40"
                  >
                    <option value="">Select package...</option>
                    {packageOptions.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </FormGroup>
                <FormGroup label="Category Focus">
                  <select
                    defaultValue={sponsor.category_focus ?? ""}
                    onChange={(e) => handleSelectChange("category_focus", e.target.value)}
                    disabled={saving}
                    className="w-full border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] font-body text-[#374151] focus:border-[#e6c46d] focus:outline-none transition-colors disabled:opacity-40"
                  >
                    <option value="">Select category...</option>
                    {categoryOptions.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </FormGroup>
                <FormGroup label="Neighborhood Focus">
                  <select
                    defaultValue={sponsor.neighborhood_focus ?? ""}
                    onChange={(e) => handleSelectChange("neighborhood_focus", e.target.value)}
                    disabled={saving}
                    className="w-full border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] font-body text-[#374151] focus:border-[#e6c46d] focus:outline-none transition-colors disabled:opacity-40"
                  >
                    <option value="">Select neighborhood...</option>
                    {neighborhoodOptions.map((n) => (
                      <option key={n.id} value={n.id}>{n.name}</option>
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
                      {d.deliverable_type === "newsletter_mention" && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[11px] text-[#6b7280]">Newsletter:</span>
                          <select
                            value={d.newsletter_type_id ?? ""}
                            onChange={async (e) => {
                              const result = await updateDeliverable(d.id, {
                                newsletter_type_id: e.target.value || null,
                              });
                              if ("error" in result && result.error) {
                                alert("Error: " + result.error);
                                return;
                              }
                              router.refresh();
                            }}
                            className="border border-[#e5e5e5] bg-white px-2 py-1 text-[11px] text-[#374151] focus:outline-none focus:border-[#e6c46d] rounded"
                          >
                            <option value="">Select newsletter...</option>
                            {newsletterTypes.map((n) => (
                              <option key={n.id} value={n.id}>{n.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pacing Calculation Display */}
            <div>
              <h3 className="font-display text-[16px] font-semibold text-black mb-3">Campaign Pacing</h3>
              <div className="bg-white border border-[#e5e5e5] p-5">
                {pacingInfo.state === "no_dates" && (
                  <p className="text-[13px] text-[#6b7280]">No campaign dates set.</p>
                )}
                {pacingInfo.state === "not_started" && (
                  <p className="text-[13px] text-[#6b7280]">
                    Campaign starts {new Date(pacingInfo.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}
                {pacingInfo.state === "completed" && (
                  <p className="text-[13px] text-[#6b7280]">Campaign completed</p>
                )}
                {pacingInfo.state === "active" && (
                  <>
                    {pacingInfo.behindPace.length === 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
                        <span className="text-[13px] font-semibold text-[#16a34a]">Campaign on pace &#10003;</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {pacingInfo.behindPace.map((d) => (
                          <div key={d.id} className="flex items-start gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] mt-1 flex-shrink-0" />
                            <span className="text-[13px] text-[#374151]">
                              {d.label}: {Math.round(pacingInfo.campaignProgressPct)}% through campaign, {Math.round(d.deliveryPct)}% delivered — {d.dueThisWeek} due this week
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* This Week's To-Do (real tasks by due date) */}
            <div>
              <h3 className="font-display text-[16px] font-semibold text-black mb-3">
                This Week&apos;s To-Do
                {(overdueTasks.length + dueThisWeekTasks.length) > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#c1121f] text-white text-[10px] font-bold">
                    {overdueTasks.length + dueThisWeekTasks.length}
                  </span>
                )}
              </h3>
              <div className="bg-white border border-[#e5e5e5] p-5">
                {overdueTasks.length === 0 && dueThisWeekTasks.length === 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
                    <span className="text-[13px] font-semibold text-[#16a34a]">No tasks due this week &#10003;</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {overdueTasks.map((t) => (
                      <div key={t.id} className="flex items-start gap-2">
                        <span className="text-[13px] text-[#c1121f]">&#9888;</span>
                        <span className="text-[13px] text-[#c1121f]">
                          {stripTaskPrefix(t.content)} — was due {t.due_date ? formatShortDate(t.due_date) : ""}
                        </span>
                      </div>
                    ))}
                    {dueThisWeekTasks.map((t) => (
                      <div key={t.id} className="flex items-start gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] mt-1 flex-shrink-0" />
                        <span className="text-[13px] text-[#374151]">
                          {stripTaskPrefix(t.content)} — due {t.due_date ? formatShortDate(t.due_date) : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Task List (Fix 4) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-[16px] font-semibold text-black">Task List</h3>
                {!showAddTaskForm && (
                  <button
                    onClick={() => setShowAddTaskForm(true)}
                    className="px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
                  >
                    Add Task
                  </button>
                )}
              </div>

              {/* Add task form */}
              {showAddTaskForm && (
                <div className="bg-white border border-[#e5e5e5] p-4 mb-3 space-y-3">
                  <FormInput
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Task description..."
                  />
                  <FormInput
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddTaskSubmit}
                      disabled={addingTask || !newTaskDesc.trim() || !newTaskDue}
                      className="px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {addingTask ? "Saving..." : "Save Task"}
                    </button>
                    <button
                      onClick={() => { setShowAddTaskForm(false); setNewTaskDesc(""); setNewTaskDue(""); }}
                      className="text-[12px] text-[#6b7280] hover:text-[#374151] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Active tasks */}
              {activeTasks.length === 0 && completedTasks.length === 0 ? (
                <div className="bg-white border border-[#e5e5e5] p-6 text-center">
                  <p className="text-[13px] text-[#6b7280]">No tasks yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeTasks.map((task) => {
                    const isOverdue = task.due_date ? task.due_date < todayStr : false;

                    if (editingTaskId === task.id) {
                      return (
                        <div key={task.id} className="bg-white border border-[#e5e5e5] p-4 space-y-3">
                          <FormInput
                            value={editTaskDesc}
                            onChange={(e) => setEditTaskDesc(e.target.value)}
                            placeholder="Task description..."
                          />
                          <FormInput
                            type="date"
                            value={editTaskDue}
                            onChange={(e) => setEditTaskDue(e.target.value)}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleEditTaskSubmit}
                              disabled={editingTaskSaving || !editTaskDesc.trim() || !editTaskDue}
                              className="px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {editingTaskSaving ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingTaskId(null)}
                              className="text-[12px] text-[#6b7280] hover:text-[#374151] transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={task.id} className="bg-white border border-[#e5e5e5] p-3 flex items-center gap-3">
                        <button
                          onClick={() => handleToggleComplete(task)}
                          className="w-5 h-5 rounded border border-[#d1d5db] flex items-center justify-center hover:border-[#16a34a] transition-colors flex-shrink-0"
                          aria-label="Mark complete"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] text-[#374151]">{stripTaskPrefix(task.content)}</span>
                        </div>
                        {task.due_date && (
                          <span className={`text-[11px] font-semibold whitespace-nowrap ${isOverdue ? "text-[#c1121f]" : "text-[#6b7280]"}`}>
                            {formatShortDate(task.due_date)}
                          </span>
                        )}
                        <button
                          onClick={() => { setEditingTaskId(task.id); setEditTaskDesc(stripTaskPrefix(task.content)); setEditTaskDue(task.due_date ?? ""); }}
                          className="text-[#9ca3af] hover:text-[#374151] transition-colors flex-shrink-0"
                          aria-label="Edit task"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-[#9ca3af] hover:text-[#c1121f] transition-colors flex-shrink-0"
                          aria-label="Delete task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Completed tasks toggle */}
              {completedTasks.length > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                    className="text-[12px] text-[#6b7280] hover:text-[#374151] transition-colors"
                  >
                    {showCompletedTasks ? "Hide" : "Show"} Completed ({completedTasks.length})
                  </button>
                  {showCompletedTasks && (
                    <div className="space-y-2 mt-2">
                      {completedTasks.map((task) => (
                        <div key={task.id} className="bg-white border border-[#e5e5e5] p-3 flex items-center gap-3 opacity-60">
                          <button
                            onClick={() => handleToggleComplete(task)}
                            className="w-5 h-5 rounded border border-[#16a34a] bg-[#16a34a] flex items-center justify-center hover:bg-[#15803d] transition-colors flex-shrink-0"
                            aria-label="Mark incomplete"
                          >
                            <Check size={12} className="text-white" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className="text-[13px] text-[#9ca3af] line-through">{stripTaskPrefix(task.content)}</span>
                          </div>
                          {task.due_date && (
                            <span className="text-[11px] text-[#9ca3af] whitespace-nowrap">
                              {formatShortDate(task.due_date)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[16px] font-semibold text-black">Fulfillment Timeline</h3>
              <button
                onClick={() => setShowPinnedPostModal(true)}
                disabled={activePinnedPosts.length >= 3}
                className="inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Log Pinned Post ({activePinnedPosts.length}/3)
              </button>
            </div>
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
                  const isVoided = entry.voided;
                  return (
                    <div key={entry.id} className="relative mb-4">
                      {/* Timeline dot */}
                      <div className={`absolute left-[-17px] top-2 w-3 h-3 rounded-full border-2 border-white ${isVoided ? "bg-[#9ca3af]" : "bg-[#c1121f]"}`} />
                      <div className={`bg-white border p-4 ml-2 ${isVoided ? "border-[#e5e5e5] opacity-60" : "border-[#e5e5e5]"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-display text-[13px] font-semibold ${isVoided ? "line-through text-[#9ca3af]" : "text-black"}`}>
                              {entry.title ?? "Untitled"}
                            </span>
                            {isVoided && (
                              <span className="text-[10px] bg-[#fee2e2] text-[#991b1b] px-2 py-0.5 rounded-full font-semibold uppercase">
                                Voided
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] ${isVoided ? "text-[#9ca3af]" : "text-[#6b7280]"}`}>{dateStr}</span>
                            {!isVoided && (
                              <button
                                onClick={() => { setVoidModal(entry); setVoidReason(""); }}
                                className="text-[10px] px-2 py-0.5 rounded-full border border-[#e5e5e5] text-[#9ca3af] hover:text-[#c1121f] hover:border-[#c1121f] transition-colors"
                              >
                                Void
                              </button>
                            )}
                          </div>
                        </div>
                        {entry.description && (
                          <p className={`text-[12px] mt-1 ${isVoided ? "line-through text-[#9ca3af]" : "text-[#374151]"}`}>{entry.description}</p>
                        )}
                        {isVoided && entry.void_reason && (
                          <p className="text-[11px] text-[#9ca3af] mt-1 italic">Reason: {entry.void_reason}</p>
                        )}
                        {(entry.channel || entry.platform) && (
                          <div className="flex items-center gap-2 mt-1.5">
                            {entry.channel && (
                              <span className={`text-[10px] bg-[#f5f5f5] px-2 py-0.5 rounded-full uppercase ${isVoided ? "text-[#9ca3af]" : "text-[#6b7280]"}`}>{entry.channel}</span>
                            )}
                            {entry.platform && (
                              <span className={`text-[10px] bg-[#f5f5f5] px-2 py-0.5 rounded-full uppercase ${isVoided ? "text-[#9ca3af]" : "text-[#6b7280]"}`}>{entry.platform}</span>
                            )}
                          </div>
                        )}
                        {/* View Content link — priority: post_id > newsletter_id > content_url */}
                        {entry.post_id ? (
                          <Link
                            href={`/admin/content/blog-posts/${entry.post_id}/edit`}
                            className={`inline-block mt-2 text-[12px] font-semibold hover:underline ${isVoided ? "text-[#9ca3af]" : "text-[#c1121f]"}`}
                          >
                            View Content →
                          </Link>
                        ) : entry.newsletter_id ? (
                          <Link
                            href={`/admin/newsletters/${entry.newsletter_id}`}
                            className={`inline-block mt-2 text-[12px] font-semibold hover:underline ${isVoided ? "text-[#9ca3af]" : "text-[#c1121f]"}`}
                          >
                            View Content →
                          </Link>
                        ) : entry.content_url ? (
                          <a
                            href={entry.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 mt-2 text-[12px] font-semibold hover:underline ${isVoided ? "text-[#9ca3af]" : "text-[#c1121f]"}`}
                          >
                            View Content <ExternalLink size={11} />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════
            TAB 4 — Ad Creatives & Flights (Phase 3C)
            ═══════════════════════════════════════════ */}
        {activeTab === "creatives" && (
          <div className="space-y-6">
            {/* Section 1: Campaigns */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-[16px] font-semibold text-black">Campaigns</h3>
                <button
                  onClick={() => setShowCampaignModal(true)}
                  className="px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
                >
                  + Add Campaign
                </button>
              </div>

              {campaigns.length === 0 ? (
                <div className="bg-white border border-[#e5e5e5] p-8 text-center">
                  <p className="text-[13px] text-[#6b7280]">No ad campaigns yet. Add a campaign to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((camp) => {
                    const campFlights = campaignFlightsMap[camp.id] ?? [];
                    const campCreatives = campaignCreativesMap[camp.id] ?? [];
                    const isExpanded = expandedCampaigns[camp.id];
                    const campStatusColor: Record<string, "gray" | "green" | "gold" | "blue"> = { draft: "gray", active: "green", paused: "gold", completed: "blue" };
                    return (
                      <div key={camp.id} className="bg-white border border-[#e5e5e5]">
                        {/* Campaign header */}
                        <div
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors"
                          onClick={() => toggleCampaign(camp.id)}
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronUp size={16} className="text-[#9ca3af]" /> : <ChevronDown size={16} className="text-[#9ca3af]" />}
                            <div>
                              <span className="font-display text-[14px] font-semibold text-black">{camp.name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {camp.start_date && camp.end_date && (
                                  <span className="text-[11px] text-[#6b7280]">
                                    {new Date(camp.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {new Date(camp.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </span>
                                )}
                                {camp.budget && (
                                  <span className="text-[11px] text-[#374151] font-semibold">${camp.budget.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-[#6b7280]">{campFlights.length} flight{campFlights.length !== 1 ? "s" : ""}</span>
                            <StatusBadge variant={campStatusColor[camp.status] ?? "gray"}>{camp.status}</StatusBadge>
                          </div>
                        </div>

                        {/* Expanded: flights + actions */}
                        {isExpanded && (
                          <div className="border-t border-[#e5e5e5] p-4 space-y-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setShowCreativeModal(camp.id)}
                                className="px-3 py-1 rounded-full text-[11px] font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#e6c46d] transition-colors"
                              >
                                + Add Creative
                              </button>
                              <button
                                onClick={() => setShowFlightModal(camp.id)}
                                className="px-3 py-1 rounded-full text-[11px] font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#e6c46d] transition-colors"
                              >
                                + Add Flight
                              </button>
                            </div>

                            {/* Flights list */}
                            {campFlights.length === 0 ? (
                              <p className="text-[12px] text-[#9ca3af] italic">No flights for this campaign.</p>
                            ) : (
                              <div className="space-y-2">
                                <h4 className="text-[11px] uppercase tracking-[0.5px] font-semibold text-[#6b7280]">Flights</h4>
                                {campFlights.map((fl) => (
                                  <div key={fl.id} className="bg-[#fafafa] border border-[#f0f0f0] p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span className="text-[12px] font-semibold text-[#374151]">
                                        {placementMap[fl.placement_id]?.name ?? fl.placement_id.slice(0, 8)}
                                      </span>
                                      {fl.creative_id && creativeMap[fl.creative_id] && (
                                        <span className="text-[11px] text-[#6b7280]">
                                          {creativeMap[fl.creative_id].headline ?? "Untitled creative"}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[11px] text-[#6b7280]">
                                        {new Date(fl.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {new Date(fl.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                      </span>
                                      <StatusBadge variant={statusBadgeMap[fl.status] ?? "gray"}>{fl.status}</StatusBadge>
                                      {fl.share_of_voice != null && (
                                        <span className="text-[10px] text-[#9ca3af]">{fl.share_of_voice}% SOV</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Creatives for this campaign */}
                            {campCreatives.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-[11px] uppercase tracking-[0.5px] font-semibold text-[#6b7280]">Creatives</h4>
                                {campCreatives.map((cr) => (
                                  <div key={cr.id} className="bg-[#fafafa] border border-[#f0f0f0] p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {cr.image_url && (
                                        <img src={cr.image_url} alt={cr.headline ?? ""} className="w-[60px] h-[60px] object-cover rounded" />
                                      )}
                                      <div>
                                        <span className="text-[12px] font-semibold text-[#374151]">{cr.headline ?? "Untitled"}</span>
                                        {cr.body && <p className="text-[11px] text-[#6b7280] mt-0.5 line-clamp-1">{cr.body}</p>}
                                        {cr.cta_text && <span className="text-[10px] text-[#9ca3af] mt-0.5 block">CTA: {cr.cta_text}</span>}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] bg-[#f5f5f5] px-2 py-0.5 rounded-full uppercase text-[#6b7280]">{cr.creative_type}</span>
                                      <StatusBadge variant={cr.is_active ? "green" : "gray"}>{cr.is_active ? "Active" : "Inactive"}</StatusBadge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 3: All Creatives (flat list) */}
            <div>
              <h3 className="font-display text-[16px] font-semibold text-black mb-3">All Creatives</h3>
              {creatives.length === 0 ? (
                <div className="bg-white border border-[#e5e5e5] p-6 text-center">
                  <p className="text-[13px] text-[#6b7280]">No creatives for this sponsor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {creatives.map((c) => (
                    <div key={c.id} className="bg-white border border-[#e5e5e5] overflow-hidden">
                      {c.image_url && (
                        <div className="w-full h-[60px] bg-[#f5f5f5] flex items-center justify-center overflow-hidden">
                          <img src={c.image_url} alt={c.headline ?? ""} className="w-[60px] h-[60px] object-cover" />
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] bg-[#f5f5f5] px-2 py-0.5 rounded-full uppercase text-[#6b7280]">{c.creative_type}</span>
                          <StatusBadge variant={c.is_active ? "green" : "gray"}>{c.is_active ? "Active" : "Inactive"}</StatusBadge>
                        </div>
                        <p className="text-[13px] font-semibold text-black truncate">{c.headline ?? "Untitled"}</p>
                        {c.body && <p className="text-[11px] text-[#6b7280] mt-0.5 line-clamp-2">{c.body}</p>}
                        {c.cta_text && <span className="text-[10px] text-[#9ca3af] block mt-1">CTA: {c.cta_text}</span>}
                        <p className="text-[11px] text-[#6b7280] truncate mt-1">{c.target_url}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            TAB 5 — Sponsored Content (Phase 3C)
            ═══════════════════════════════════════════ */}
        {activeTab === "content" && (
          <div className="space-y-6">
            {/* Blog Posts section */}
            <div>
              <h3 className="font-display text-[16px] font-semibold text-black mb-3">
                Blog Posts
                <span className="ml-2 text-[13px] font-normal text-[#6b7280]">({posts.length})</span>
              </h3>
              {posts.length === 0 ? (
                <div className="bg-white border border-[#e5e5e5] p-6 text-center">
                  <p className="text-[13px] text-[#6b7280]">No sponsored blog posts yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-white border border-[#e5e5e5] p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <Link
                          href={`/admin/content/blog-posts/${post.id}/edit`}
                          className="font-display text-[14px] font-semibold text-black hover:text-[#c1121f] transition-colors"
                        >
                          {post.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge variant={statusBadgeMap[post.status] ?? "gray"}>{post.status}</StatusBadge>
                          <span className="text-[11px] text-[#6b7280]">
                            {post.published_at
                              ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                              : "Draft"}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/admin/content/blog-posts/${post.id}/edit`}
                        className="px-3 py-1 rounded-full text-[11px] font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#e6c46d] transition-colors flex-shrink-0"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reels section */}
            <div>
              <h3 className="font-display text-[16px] font-semibold text-black mb-3">
                Reels
                <span className="ml-2 text-[13px] font-normal text-[#6b7280]">({reelEntries.length})</span>
              </h3>
              {reelEntries.length === 0 ? (
                <div className="bg-white border border-[#e5e5e5] p-6 text-center">
                  <p className="text-[13px] text-[#6b7280]">No reels yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reelEntries.map((entry) => (
                    <div key={entry.id} className="bg-white border border-[#e5e5e5] p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <span className="font-display text-[14px] font-semibold text-black">
                          {entry.title ?? "Untitled Reel"}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          {entry.delivered_at && (
                            <span className="text-[11px] text-[#6b7280]">
                              {new Date(entry.delivered_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          )}
                          {entry.channel && (
                            <span className="text-[10px] bg-[#f5f5f5] px-2 py-0.5 rounded-full uppercase text-[#6b7280]">{entry.channel}</span>
                          )}
                          {entry.platform && (
                            <span className="text-[10px] bg-[#f5f5f5] px-2 py-0.5 rounded-full uppercase text-[#6b7280]">{entry.platform}</span>
                          )}
                        </div>
                      </div>
                      {entry.content_url && (
                        <a
                          href={entry.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#e6c46d] transition-colors flex-shrink-0"
                        >
                          View Content <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Podcast section */}
            <div>
              <h3 className="font-display text-[16px] font-semibold text-black mb-3">
                Podcast
                <span className="ml-2 text-[13px] font-normal text-[#6b7280]">({podcastEntries.length})</span>
              </h3>
              {podcastEntries.length === 0 ? (
                <div className="bg-white border border-[#e5e5e5] p-6 text-center">
                  <p className="text-[13px] text-[#6b7280]">No podcast segments yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {podcastEntries.map((entry) => (
                    <div key={entry.id} className="bg-white border border-[#e5e5e5] p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <span className="font-display text-[14px] font-semibold text-black">
                          {entry.title ?? "Untitled Segment"}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          {entry.delivered_at && (
                            <span className="text-[11px] text-[#6b7280]">
                              {new Date(entry.delivered_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          )}
                          {entry.channel && (
                            <span className="text-[10px] bg-[#f5f5f5] px-2 py-0.5 rounded-full uppercase text-[#6b7280]">{entry.channel}</span>
                          )}
                          {entry.platform && (
                            <span className="text-[10px] bg-[#f5f5f5] px-2 py-0.5 rounded-full uppercase text-[#6b7280]">{entry.platform}</span>
                          )}
                        </div>
                      </div>
                      {entry.content_url && (
                        <a
                          href={entry.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#e6c46d] transition-colors flex-shrink-0"
                        >
                          View Content <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Social Posts section */}
            <div>
              <h3 className="font-display text-[16px] font-semibold text-black mb-3">
                Social Posts
                <span className="ml-2 text-[13px] font-normal text-[#6b7280]">({socialEntries.length})</span>
              </h3>
              {socialEntries.length === 0 ? (
                <div className="bg-white border border-[#e5e5e5] p-6 text-center">
                  <p className="text-[13px] text-[#6b7280]">No social posts yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {socialEntries.map((entry) => (
                    <div key={entry.id} className="bg-white border border-[#e5e5e5] p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <span className="font-display text-[14px] font-semibold text-black">
                          {entry.title ?? "Untitled Post"}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          {entry.delivered_at && (
                            <span className="text-[11px] text-[#6b7280]">
                              {new Date(entry.delivered_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          )}
                          {entry.channel && (
                            <span className="text-[10px] bg-[#f5f5f5] px-2 py-0.5 rounded-full uppercase text-[#6b7280]">{entry.channel}</span>
                          )}
                          {entry.platform && (
                            <span className="text-[10px] bg-[#f5f5f5] px-2 py-0.5 rounded-full uppercase text-[#6b7280]">{entry.platform}</span>
                          )}
                        </div>
                      </div>
                      {entry.content_url && (
                        <a
                          href={entry.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#e6c46d] transition-colors flex-shrink-0"
                        >
                          View Content <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Void Fulfillment Entry Modal */}
      <Modal
        isOpen={!!voidModal}
        onClose={() => { setVoidModal(null); setVoidReason(""); }}
        title="Void Fulfillment Entry"
        maxWidth="440px"
        footer={
          <>
            <button
              onClick={() => { setVoidModal(null); setVoidReason(""); }}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVoidEntry}
              disabled={voiding}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold bg-[#c1121f] text-white hover:bg-[#a10e1a] transition-colors disabled:opacity-50"
            >
              {voiding ? "Voiding..." : "Void Entry"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[13px] text-[#374151]">
            Void this fulfillment entry? This will reverse the delivery credit.
          </p>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">
              Reason (optional)
            </label>
            <input
              type="text"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="Enter reason for voiding..."
              className="w-full border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] font-body text-[#374151] focus:border-[#e6c46d] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </Modal>

      {/* Add Campaign Modal (Phase 3C) */}
      <Modal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        title="Add Campaign"
        maxWidth="500px"
        footer={
          <>
            <button
              onClick={() => setShowCampaignModal(false)}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCampaign}
              disabled={savingCampaign || !newCampaignName.trim()}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {savingCampaign ? "Saving..." : "Create Campaign"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormGroup label="Campaign Name" required>
            <FormInput value={newCampaignName} onChange={(e) => setNewCampaignName(e.target.value)} placeholder="e.g. Spring 2026 Banner Campaign" />
          </FormGroup>
          <FormRow>
            <FormGroup label="Start Date">
              <FormInput type="date" value={newCampaignStart} onChange={(e) => setNewCampaignStart(e.target.value)} />
            </FormGroup>
            <FormGroup label="End Date">
              <FormInput type="date" value={newCampaignEnd} onChange={(e) => setNewCampaignEnd(e.target.value)} />
            </FormGroup>
          </FormRow>
          <FormGroup label="Budget">
            <FormInput type="number" value={newCampaignBudget} onChange={(e) => setNewCampaignBudget(e.target.value)} placeholder="0.00" />
          </FormGroup>
          <FormGroup label="Notes">
            <FormTextarea value={newCampaignNotes} onChange={(e) => setNewCampaignNotes(e.target.value)} rows={3} placeholder="Campaign notes..." />
          </FormGroup>
        </div>
      </Modal>

      {/* Add Creative Modal (Phase 3C) */}
      <Modal
        isOpen={!!showCreativeModal}
        onClose={() => setShowCreativeModal(null)}
        title="Add Creative"
        maxWidth="500px"
        footer={
          <>
            <button
              onClick={() => setShowCreativeModal(null)}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCreative}
              disabled={savingCreative || !newCreativeUrl.trim()}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {savingCreative ? "Saving..." : "Create Creative"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormGroup label="Creative Type" required>
            <FormSelect
              value={newCreativeType}
              onChange={(e) => setNewCreativeType(e.target.value)}
              options={[
                { value: "image", label: "Image" },
                { value: "html", label: "HTML" },
                { value: "native", label: "Native" },
              ]}
            />
          </FormGroup>
          <FormGroup label="Headline">
            <FormInput value={newCreativeHeadline} onChange={(e) => setNewCreativeHeadline(e.target.value)} placeholder="Creative headline..." />
          </FormGroup>
          <FormGroup label="Body">
            <FormTextarea value={newCreativeBody} onChange={(e) => setNewCreativeBody(e.target.value)} rows={3} placeholder="Body text..." />
          </FormGroup>
          <FormGroup label="CTA Text">
            <FormInput value={newCreativeCta} onChange={(e) => setNewCreativeCta(e.target.value)} placeholder="e.g. Learn More" />
          </FormGroup>
          <FormGroup label="Target URL" required>
            <FormInput value={newCreativeUrl} onChange={(e) => setNewCreativeUrl(e.target.value)} placeholder="https://..." />
          </FormGroup>
          <FormGroup label="Alt Text">
            <FormInput value={newCreativeAlt} onChange={(e) => setNewCreativeAlt(e.target.value)} placeholder="Image alt text..." />
          </FormGroup>
        </div>
      </Modal>

      {/* Add Flight Modal (Phase 3C) */}
      <Modal
        isOpen={!!showFlightModal}
        onClose={() => setShowFlightModal(null)}
        title="Add Flight"
        maxWidth="500px"
        footer={
          <>
            <button
              onClick={() => setShowFlightModal(null)}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFlight}
              disabled={savingFlight || !newFlightPlacement || !newFlightStart || !newFlightEnd}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {savingFlight ? "Saving..." : "Create Flight"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormGroup label="Placement" required>
            <FormSelect
              value={newFlightPlacement}
              onChange={(e) => setNewFlightPlacement(e.target.value)}
              placeholder="Select placement..."
              options={adPlacements.map((p) => ({ value: p.id, label: `${p.name} (${p.channel})` }))}
            />
          </FormGroup>
          <FormGroup label="Creative">
            <FormSelect
              value={newFlightCreative}
              onChange={(e) => setNewFlightCreative(e.target.value)}
              placeholder="Select creative (optional)..."
              options={(showFlightModal ? (campaignCreativesMap[showFlightModal] ?? []) : []).map((c) => ({ value: c.id, label: c.headline ?? "Untitled" }))}
            />
          </FormGroup>
          <FormRow>
            <FormGroup label="Start Date" required>
              <FormInput type="date" value={newFlightStart} onChange={(e) => setNewFlightStart(e.target.value)} />
            </FormGroup>
            <FormGroup label="End Date" required>
              <FormInput type="date" value={newFlightEnd} onChange={(e) => setNewFlightEnd(e.target.value)} />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Share of Voice (%)" hint="0–100, default 100">
              <FormInput type="number" value={newFlightSov} onChange={(e) => setNewFlightSov(e.target.value)} />
            </FormGroup>
            <FormGroup label="Priority" hint="Higher = more important">
              <FormInput type="number" value={newFlightPriority} onChange={(e) => setNewFlightPriority(e.target.value)} />
            </FormGroup>
          </FormRow>
        </div>
      </Modal>

      {/* Log Pinned Post Modal (Phase 3F) */}
      <Modal
        isOpen={showPinnedPostModal}
        onClose={() => setShowPinnedPostModal(false)}
        title="Log Pinned Post"
        maxWidth="440px"
        footer={
          <>
            <button
              onClick={() => setShowPinnedPostModal(false)}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogPinnedPost}
              disabled={savingPinnedPost || !pinnedPostUrl.trim()}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {savingPinnedPost ? "Saving..." : "Log Pinned Post"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[13px] text-[#6b7280]">
            Active pinned posts: {activePinnedPosts.length}/3
          </p>
          <FormGroup label="Pinned At">
            <FormInput
              type="date"
              value={pinnedPostDate}
              onChange={(e) => setPinnedPostDate(e.target.value)}
            />
          </FormGroup>
          <FormGroup label="Post URL">
            <FormInput
              value={pinnedPostUrl}
              onChange={(e) => setPinnedPostUrl(e.target.value)}
              placeholder="https://instagram.com/p/..."
            />
          </FormGroup>
          <FormGroup label="Notes">
            <FormTextarea
              value={pinnedPostNotes}
              onChange={(e) => setPinnedPostNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes about this pinned post..."
            />
          </FormGroup>
        </div>
      </Modal>
    </>
  );
}
