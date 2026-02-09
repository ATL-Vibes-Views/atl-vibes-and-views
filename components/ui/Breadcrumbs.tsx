import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
  className?: string;
}

export function Breadcrumbs({
  items,
  baseUrl = "https://atlvibesandviews.com",
  className = "",
}: BreadcrumbsProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav
        className={`flex items-center gap-2 text-xs text-gray-mid ${className}`}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={item.label}>
              {i > 0 && <ChevronRight size={12} />}
              {isLast ? (
                <span className="text-black font-medium">{item.label}</span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-black transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="hover:text-black transition-colors">
                  {item.label}
                </span>
              )}
            </Fragment>
          );
        })}
      </nav>
    </>
  );
}
