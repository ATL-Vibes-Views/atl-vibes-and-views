"use client";

import { Send } from "lucide-react";
import { useState } from "react";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch(
        "https://api.hsforms.com/submissions/v3/integration/submit/244168309/941b343b-f6b8-4614-8c14-01e60e3da35d",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: [{ name: "email", value: email }],
          }),
        }
      );
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center max-w-lg mx-auto bg-white rounded-full px-6 py-4 shadow-sm border border-gray-200">
        <p className="text-sm font-medium text-gray-700">You&rsquo;re in! Check your inbox.</p>
      </div>
    );
  }

  return (
    <form
      className="flex items-center max-w-lg mx-auto bg-white rounded-full overflow-hidden shadow-sm border border-gray-200"
      onSubmit={handleSubmit}
    >
      <input
        type="email"
        placeholder="Enter Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-6 py-4 text-sm outline-none bg-transparent placeholder:text-gray-mid"
        required
        aria-label="Email address"
      />
      {compact ? (
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex items-center justify-center w-11 h-11 bg-black text-white rounded-full mr-1 hover:text-[#fee198] transition-colors disabled:opacity-50"
          aria-label="Subscribe"
        >
          <Send size={14} />
        </button>
      ) : (
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex items-center gap-2 px-6 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full mr-1 hover:text-[#fee198] transition-colors disabled:opacity-50"
        >
          <Send size={14} />
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      )}
    </form>
  );
}
