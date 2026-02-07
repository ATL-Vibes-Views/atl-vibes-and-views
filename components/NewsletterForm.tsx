"use client";

import { Send } from "lucide-react";

export function NewsletterForm() {
  return (
    <form
      className="flex items-center max-w-lg mx-auto bg-white rounded-full overflow-hidden shadow-sm border border-gray-200"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Enter Your Email"
        className="flex-1 px-6 py-4 text-sm outline-none bg-transparent placeholder:text-gray-mid"
      />
      <button
        type="submit"
        className="flex items-center gap-2 px-6 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full mr-1 hover:bg-gray-dark transition-colors"
      >
        <Send size={14} />Subscribe
      </button>
    </form>
  );
}
