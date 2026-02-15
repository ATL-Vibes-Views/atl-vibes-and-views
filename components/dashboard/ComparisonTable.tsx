"use client";

import { Check, Minus } from "lucide-react";
import type { BusinessState } from "./TierBadge";

interface ComparisonTableProps {
  state: BusinessState;
}

type CellValue = boolean | string;

interface FeatureRow {
  label: string;
  free: CellValue;
  standard: CellValue;
  premium: CellValue;
}

const FEATURES: FeatureRow[] = [
  { label: "Business listing", free: true, standard: true, premium: true },
  { label: "Basic hours & contact", free: true, standard: true, premium: true },
  { label: "Photo gallery", free: "5 photos", standard: "15 photos", premium: "Unlimited" },
  { label: "Priority in search", free: false, standard: true, premium: true },
  { label: "Featured in newsletter", free: false, standard: true, premium: true },
  { label: "Analytics dashboard", free: false, standard: "Basic", premium: "Advanced" },
  { label: "Review responses", free: false, standard: true, premium: true },
  { label: "Events per month", free: "1", standard: "5", premium: "Unlimited" },
  { label: "Featured badge", free: false, standard: false, premium: true },
  { label: "Dedicated story feature", free: false, standard: false, premium: true },
  { label: "Featured on map", free: false, standard: true, premium: true },
];

const COLUMNS = [
  { key: "free" as const, name: "Free", price: "Free" },
  { key: "standard" as const, name: "Standard", price: "$49/mo" },
  { key: "premium" as const, name: "Premium", price: "$99/mo" },
];

function getHighlightedColumn(state: BusinessState): "free" | "standard" | "premium" {
  if (state === "free") return "free";
  if (state === "standard") return "standard";
  return "premium"; // founding or sponsor
}

export function ComparisonTable({ state }: ComparisonTableProps) {
  const highlighted = getHighlightedColumn(state);

  return (
    <div className="bg-white border border-[#e5e5e5] overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#e5e5e5]">
            <th className="text-left px-5 py-3 text-[13px] font-semibold text-[#6b7280]">
              Feature
            </th>
            {COLUMNS.map((col) => {
              const isHighlighted = col.key === highlighted;
              return (
                <th
                  key={col.key}
                  className={`text-center px-5 py-3 ${
                    isHighlighted ? "bg-[#fee198]" : ""
                  }`}
                >
                  <div className="text-[16px] font-bold text-[#1a1a1a]">
                    {col.name}
                  </div>
                  <div className="text-[11px] text-[#6b7280] font-normal mt-0.5">
                    {isHighlighted ? "Current plan" : col.price}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {FEATURES.map((feature, i) => (
            <tr
              key={feature.label}
              className={i % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}
            >
              <td className="text-left px-5 py-3 text-[13px] text-[#1a1a1a]">
                {feature.label}
              </td>
              {COLUMNS.map((col) => {
                const val = feature[col.key];
                const isHighlighted = col.key === highlighted;
                return (
                  <td
                    key={col.key}
                    className={`text-center px-5 py-3 text-[13px] ${
                      isHighlighted ? "bg-[#fef9e7]" : ""
                    }`}
                  >
                    {val === true ? (
                      <Check size={16} className="mx-auto text-[#16a34a]" />
                    ) : val === false ? (
                      <Minus size={16} className="mx-auto text-[#d1d5db]" />
                    ) : (
                      <span
                        className={`text-[13px] ${
                          isHighlighted
                            ? "font-bold text-[#1a1a1a]"
                            : "text-[#374151]"
                        }`}
                      >
                        {val}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          {/* Price row */}
          <tr className="border-t border-[#e5e5e5]">
            <td className="text-left px-5 py-3 text-[13px] font-bold text-[#1a1a1a]">
              Price
            </td>
            {COLUMNS.map((col) => {
              const isHighlighted = col.key === highlighted;
              return (
                <td
                  key={col.key}
                  className={`text-center px-5 py-3 text-[13px] font-bold text-[#1a1a1a] ${
                    isHighlighted ? "bg-[#fef9e7]" : ""
                  }`}
                >
                  {col.price}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
