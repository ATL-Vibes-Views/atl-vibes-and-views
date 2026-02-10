import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: title },
          ]}
          className="mb-8"
        />

        <h1 className="font-display text-3xl md:text-4xl font-bold text-black mb-2">
          {title}
        </h1>
        <p className="text-sm text-gray-mid mb-10">
          Last updated: {lastUpdated}
        </p>

        <div className="article-body">{children}</div>
      </div>
    </div>
  );
}
