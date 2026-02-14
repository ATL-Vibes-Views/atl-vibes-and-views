"use client";

import { Star, Check, Minus } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";

interface Subscription {
  id: string;
  plan: string;
  price_monthly: number | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
}

interface BillingClientProps {
  tier: string;
  tierStartDate: string | null;
  subscription: Subscription | null;
}

/* Tier comparison data */
const FEATURES = [
  { name: "Business listing", free: true, standard: true, premium: true },
  { name: "Basic hours & contact", free: true, standard: true, premium: true },
  { name: "Photo gallery (up to 5)", free: true, standard: true, premium: true },
  { name: "Priority in search", free: false, standard: true, premium: true },
  { name: "Featured in newsletter", free: false, standard: true, premium: true },
  { name: "Analytics dashboard", free: false, standard: "Basic", premium: "Advanced" },
  { name: "Photo gallery (unlimited)", free: false, standard: false, premium: true },
  { name: "Homepage featured", free: false, standard: false, premium: true },
  { name: "Dedicated story feature", free: false, standard: false, premium: true },
  { name: "Ad-free listing", free: false, standard: false, premium: true },
];

const BILLING_PLACEHOLDER = [
  { date: "Feb 1, 2026", description: "Premium Plan — Monthly", amount: "$49.00", status: "Paid" },
  { date: "Jan 1, 2026", description: "Premium Plan — Monthly", amount: "$49.00", status: "Paid" },
  { date: "Dec 1, 2025", description: "Standard Plan — Monthly", amount: "$29.00", status: "Paid" },
];

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BillingClient({ tier, tierStartDate, subscription }: BillingClientProps) {
  const normalizedTier = tier.toLowerCase();

  return (
    <>
      <PortalTopbar title="Plan & Billing" />
      <div className="p-8 max-[899px]:pt-16">
        {/* Current Plan Card */}
        <div className="bg-white border-2 border-[#fee198] p-6 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fee198] rounded-full flex items-center justify-center">
                <Star size={18} className="text-[#1a1a1a]" />
              </div>
              <div>
                <h2 className="font-display text-[24px] font-bold text-black">{capitalize(tier)} Plan</h2>
                {subscription?.price_monthly && (
                  <p className="text-[14px] font-body text-[#6b7280]">
                    ${Number(subscription.price_monthly).toFixed(2)}/month
                  </p>
                )}
                {tierStartDate && (
                  <p className="text-[12px] text-[#6b7280] mt-0.5">Since {formatDate(tierStartDate)}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => console.log("Manage subscription clicked")}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Manage Subscription
            </button>
          </div>
        </div>

        {/* Tier comparison table */}
        <h3 className="font-display text-[22px] font-semibold text-black mb-4">Compare Plans</h3>
        <div className="bg-white border border-[#e5e5e5] overflow-x-auto mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#e5e5e5]">
                <th className="text-left px-4 py-3 text-[12px] uppercase tracking-[0.05em] font-semibold text-[#6b7280]">
                  Feature
                </th>
                {["free", "standard", "premium"].map((t) => (
                  <th
                    key={t}
                    className={[
                      "text-center px-4 py-3 text-[12px] uppercase tracking-[0.05em] font-semibold",
                      normalizedTier === t ? "bg-[#fee198]/30 text-[#1a1a1a]" : "text-[#6b7280]",
                    ].join(" ")}
                  >
                    {capitalize(t)}
                    {normalizedTier === t && (
                      <span className="block text-[10px] text-[#6b7280] font-normal mt-0.5">Current</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f, i) => (
                <tr key={i} className="border-b border-[#f0f0f0]">
                  <td className="px-4 py-3 text-[13px] font-body text-[#374151]">{f.name}</td>
                  {(["free", "standard", "premium"] as const).map((t) => {
                    const val = f[t];
                    const isCurrentTier = normalizedTier === t;
                    return (
                      <td
                        key={t}
                        className={[
                          "text-center px-4 py-3",
                          isCurrentTier ? "bg-[#fee198]/10" : "",
                        ].join(" ")}
                      >
                        {val === true ? (
                          <Check size={16} className="mx-auto text-[#16a34a]" />
                        ) : val === false ? (
                          <Minus size={16} className="mx-auto text-[#d1d5db]" />
                        ) : (
                          <span className="text-[12px] font-semibold text-[#374151]">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Billing History */}
        <h3 className="font-display text-[22px] font-semibold text-black mb-4">Billing History</h3>
        <AdminDataTable
          columns={[
            { key: "date", header: "Date" },
            { key: "description", header: "Description" },
            { key: "amount", header: "Amount" },
            {
              key: "status",
              header: "Status",
              render: (item: Record<string, unknown>) => (
                <StatusBadge variant={item.status === "Paid" ? "green" : "gray"}>
                  {item.status as string}
                </StatusBadge>
              ),
            },
          ]}
          data={BILLING_PLACEHOLDER}
          emptyMessage="No billing history yet."
        />
      </div>
    </>
  );
}
