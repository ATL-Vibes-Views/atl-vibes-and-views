import { forwardRef } from "react";

export const FormInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function FormInput(props, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={[
        "w-full px-3.5 py-2.5 text-[14px] font-body",
        "border border-[#e5e5e5]",
        "placeholder:text-[#9ca3af]",
        "focus:border-[#e6c46d] focus:ring-2 focus:ring-[#fee198]/30 focus:outline-none",
        "transition-colors",
        props.className ?? "",
      ].join(" ")}
    />
  );
});
