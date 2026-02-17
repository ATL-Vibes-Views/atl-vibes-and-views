"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownArticleProps {
  content: string;
}

export function MarkdownArticle({ content }: MarkdownArticleProps) {
  return (
    <article className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-black prose-a:text-[#c1121f] prose-a:underline hover:prose-a:text-black prose-strong:text-black prose-img:rounded-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
