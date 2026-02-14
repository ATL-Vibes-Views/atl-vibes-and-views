import { Check, ChevronRight } from "lucide-react";

interface WorkflowStep {
  label: string;
  status: "done" | "current" | "future";
}

interface WorkflowBannerProps {
  steps: WorkflowStep[];
}

export function WorkflowBanner({ steps }: WorkflowBannerProps) {
  return (
    <div className="bg-[#f5f5f5] border border-[#e5e5e5] px-5 py-3.5 flex flex-wrap items-center gap-3">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className={[
              "flex items-center gap-1.5 text-[13px] font-body",
              step.status === "done"
                ? "text-[#16a34a]"
                : step.status === "current"
                  ? "text-black font-bold"
                  : "text-[#d1d5db]",
            ].join(" ")}
          >
            {step.status === "done" && <Check size={14} />}
            <span>{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight size={14} className="text-[#d1d5db]" />
          )}
        </div>
      ))}
    </div>
  );
}
