interface StatGridProps {
  columns?: 3 | 4;
  children: React.ReactNode;
}

export function StatGrid({ columns = 3, children }: StatGridProps) {
  const colClass =
    columns === 4
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

  return <div className={colClass}>{children}</div>;
}
