"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

/* ============================================================
   MediaKitModal — Full-screen flipbook embed modal
   Used across all /partner/* pages via context.
   ============================================================ */

interface MediaKitContextValue {
  open: () => void;
}

const MediaKitContext = createContext<MediaKitContextValue>({
  open: () => {},
});

export function useMediaKit() {
  return useContext(MediaKitContext);
}

/* ── Trigger button (client component for server page embedding) ── */
export function MediaKitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useMediaKit();
  return (
    <button onClick={open} className={className}>
      {children}
    </button>
  );
}

/* ── Provider + Modal ── */
export function MediaKitProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
    requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      document.body.style.overflow = "";
    }, 200);
  }, []);

  /* Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeModal]);

  return (
    <MediaKitContext.Provider value={{ open: openModal }}>
      {children}

      {isOpen && (
        <div
          className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-200 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80"
            onClick={closeModal}
          />

          {/* Content */}
          <div className="relative z-[210] w-[95vw] lg:w-[90vw] h-[90vh] bg-[#1a1a1a] flex flex-col">
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
              <span className="text-white text-[11px] font-semibold uppercase tracking-[2px]">
                ATL Vibes &amp; Views &mdash; Media Kit
              </span>
              <div className="flex items-center gap-6">
                {/* TODO: Add PDF download link when file is available */}
                <a
                  href="#"
                  className="text-[#fee198] text-[11px] font-semibold uppercase tracking-[1px] hover:text-white transition-colors"
                >
                  Download PDF
                </a>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center bg-[#fee198] text-[#1a1a1a] rounded-full hover:bg-white transition-colors text-sm font-bold"
                  aria-label="Close media kit"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Flipbook iframe */}
            <div className="flex-1 min-h-0">
              <iframe
                src="https://atlvibesandviews.hflip.co/36036a0e90.html"
                allowFullScreen
                allow="clipboard-write"
                className="w-full h-full border-0"
                title="ATL Vibes & Views Media Kit"
              />
            </div>
          </div>
        </div>
      )}
    </MediaKitContext.Provider>
  );
}
