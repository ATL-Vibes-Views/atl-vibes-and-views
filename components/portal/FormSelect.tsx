import { forwardRef } from "react";

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  function FormSelect({ options, placeholder, ...props }, ref) {
    return (
      <select
        ref={ref}
        {...props}
        className={[
          "w-full px-3.5 py-2.5 text-[14px] font-body",
          "border border-[#e5e5e5]",
          "focus:border-[#e6c46d] focus:ring-2 focus:ring-[#fee198]/30 focus:outline-none",
          "transition-colors",
          props.className ?? "",
        ].join(" ")}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);
