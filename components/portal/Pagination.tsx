"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="bg-white border border-[#e5e5e5] border-t-0 px-3.5 py-2.5 flex items-center justify-between">
      <span className="text-[12px] text-[#6b7280]">
        Showing {start}&ndash;{end} of {totalItems}
      </span>
      <div className="flex items-center gap-1">
        {pages.map((page, i) =>
          page === "..." ? (
            <span key={`dots-${i}`} className="px-1 text-[12px] text-[#6b7280]">
              &hellip;
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={[
                "min-w-[28px] h-7 px-1.5 text-[12px] border transition-colors",
                page === currentPage
                  ? "bg-black text-white border-black"
                  : "bg-white text-[#374151] border-[#e5e5e5] hover:border-[#d1d5db]",
              ].join(" ")}
            >
              {page}
            </button>
          )
        )}
      </div>
    </div>
  );
}
