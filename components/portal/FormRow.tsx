interface FormRowProps {
  columns?: 2 | 3;
  children: React.ReactNode;
}

export function FormRow({ columns = 2, children }: FormRowProps) {
  const colClass =
    columns === 3
      ? "grid grid-cols-1 sm:grid-cols-3 gap-4"
      : "grid grid-cols-1 sm:grid-cols-2 gap-4";

  return <div className={colClass}>{children}</div>;
}
