import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase";
import { MarkdownArticle } from "@/components/ui/MarkdownArticle";

export const metadata: Metadata = {
  title: "Draft Preview | Admin CMS | ATL Vibes & Views",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PH_HERO = "https://placehold.co/1920x600/1a1a1a/e6c46d?text=Draft+Preview";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: rawPost, error } = await supabase
    .from("blog_posts")
    .select("*, authors(*), categories(*), neighborhoods(*, areas(*))")
    .eq("id", id)
    .single();

  if (error || !rawPost) return notFound();

  const post = rawPost as Record<string, unknown>;
  const category = post.categories as { name: string } | null;
  const author = post.authors as { name: string } | null;

  // Prefer content_md (render as markdown), fallback to content_html
  const contentMd = post.content_md as string | null;
  const contentHtml = post.content_html as string | null;
  const useMarkdown = !!contentMd;
  const articleContent = contentMd || contentHtml || "";

  const wordCount = (post.word_count as number) ?? articleContent.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <>
      {/* DRAFT BANNER */}
      <div className="bg-[#fef3c7] border-b border-[#f59e0b] px-4 py-3 text-center">
        <p className="text-[13px] font-semibold text-[#92400e]">
          DRAFT PREVIEW — Not Published
        </p>
      </div>

      {/* Back link */}
      <div className="px-8 pt-6">
        <Link
          href="/admin/publishing"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors"
        >
          <ArrowLeft size={14} /> Back to Publishing Queue
        </Link>
      </div>

      {/* Hero */}
      <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden mt-4">
        <Image
          src={String(post.featured_image_url || "") || PH_HERO}
          alt={String(post.title || "Preview")}
          fill
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Article */}
      <div className="max-w-[720px] mx-auto px-6 py-8">
        {category && (
          <span className="inline-block text-[#c1121f] text-[10px] font-semibold uppercase tracking-[0.1em] mb-3">
            {category.name}
          </span>
        )}

        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight text-black mb-5">
          {String(post.title)}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#999] mb-6">
          {author && <span>By {author.name}</span>}
          {post.created_at ? <span>{formatDate(String(post.created_at))}</span> : null}
          <span>{readTime} min read</span>
        </div>

        {useMarkdown ? (
          <MarkdownArticle content={articleContent} />
        ) : (
          <div
            className="article-body max-w-none"
            dangerouslySetInnerHTML={{ __html: articleContent }}
          />
        )}
      </div>
    </>
  );
}
