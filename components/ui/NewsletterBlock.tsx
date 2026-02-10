"use client";

interface NewsletterBlockProps {
  heading?: string;
  description: string;
  className?: string;
}

export function NewsletterBlock({
  heading = "Atlanta in Your Inbox",
  description,
  className = "",
}: NewsletterBlockProps) {
  return (
    <section
      className={`bg-[#f8f5f0] py-16 ${className}`}
    >
      <div className="site-container text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-red-brand">
          Stay in the Loop
        </span>
        <h2 className="font-display text-4xl mt-2 mb-3 text-[#1a1a1a]">
          {heading}
        </h2>
        <p className="text-sm max-w-[420px] mx-auto mb-8 leading-relaxed text-gray-600">
          {description}
        </p>
        <div className="max-w-lg mx-auto">
          <form
            className="flex items-center bg-white rounded-full overflow-hidden shadow-sm border border-gray-200"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter Your Email"
              className="flex-1 px-6 py-4 text-sm outline-none bg-transparent placeholder:text-gray-mid"
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.08em] rounded-full mr-1 transition-colors bg-[#c1121f] text-white hover:bg-[#a00e1a]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
