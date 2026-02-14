interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

export function AdminDataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  actions,
  emptyMessage = "No items found.",
}: AdminDataTableProps<T>) {
  return (
    <div className="bg-white border border-[#e5e5e5] overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[#f5f5f5] border-b-2 border-[#e5e5e5]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] px-3.5 py-2.5"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
            {actions && (
              <th className="text-right text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] px-3.5 py-2.5">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-3.5 py-10 text-center text-[13px] text-[#6b7280]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr
                key={i}
                className={[
                  "border-b border-[#f0f0f0] transition-colors",
                  onRowClick ? "cursor-pointer" : "",
                  "hover:bg-[#fafafa]",
                ].join(" ")}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-3.5 py-2.5 text-[13px] font-body text-[#374151]"
                  >
                    {col.render
                      ? col.render(item)
                      : (item[col.key] as React.ReactNode)}
                  </td>
                ))}
                {actions && (
                  <td className="px-3.5 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {actions(item)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
