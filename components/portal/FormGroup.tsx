interface FormGroupProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function FormGroup({
  label,
  htmlFor,
  required,
  hint,
  children,
}: FormGroupProps) {
  return (
    <div className="mb-[18px]">
      <label
        htmlFor={htmlFor}
        className="block mb-1.5 text-[12px] uppercase tracking-[0.5px] font-semibold text-[#374151]"
      >
        {label}
        {required && <span className="text-[#c1121f] ml-0.5">*</span>}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-[11px] text-[#6b7280]">{hint}</p>
      )}
    </div>
  );
}
