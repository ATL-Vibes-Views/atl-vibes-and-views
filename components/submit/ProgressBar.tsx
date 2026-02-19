"use client";

const STEPS = ["Type", "Plan", "Details", "Review", "Submit"];

interface ProgressBarProps {
  currentStep: number;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <nav className="flex items-center justify-center gap-1 sm:gap-2 mb-10">
      {STEPS.map((label, i) => {
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={label} className="flex items-center gap-1 sm:gap-2">
            {i > 0 && (
              <div
                className={`h-px w-4 sm:w-8 ${
                  isComplete ? "bg-[#fee198]" : "bg-gray-200"
                }`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <span
                className={`w-6 h-6 flex items-center justify-center text-xs font-semibold rounded-full ${
                  isComplete
                    ? "bg-[#fee198] text-[#1a1a1a]"
                    : isCurrent
                    ? "border-2 border-[#fee198] text-[#1a1a1a]"
                    : "border border-gray-200 text-gray-mid"
                }`}
              >
                {isComplete ? "✓" : i + 1}
              </span>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  isCurrent
                    ? "text-black"
                    : isComplete
                    ? "text-gray-dark"
                    : "text-gray-mid"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
