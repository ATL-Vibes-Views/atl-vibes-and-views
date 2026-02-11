"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { RotateCcw, ArrowLeft, ArrowRight, Play } from "lucide-react";

/* ============================================================
   YouTubeEmbed — Custom wrapper preventing competitor content
   Uses youtube-nocookie.com + rel=0 + custom end-screen overlay
   ============================================================ */

interface NextItem {
  title: string;
  slug: string;
  thumbnailUrl?: string;
}

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  aspectRatio?: "16/9" | "9/16";
  nextItem?: NextItem;
  relatedItems?: NextItem[];
  className?: string;
}

/* Extract YouTube video ID from various URL formats */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
    /youtube-nocookie\.com\/embed\/([^?&]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        el: string | HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: Record<string, (e: { data: number }) => void>;
        }
      ) => { seekTo: (s: number) => void; playVideo: () => void; destroy: () => void };
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function YouTubeEmbed({
  videoId,
  title = "Video",
  aspectRatio = "16/9",
  nextItem,
  relatedItems = [],
  className = "",
}: YouTubeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<{ seekTo: (s: number) => void; playVideo: () => void; destroy: () => void } | null>(null);
  const [ended, setEnded] = useState(false);
  const playerId = `yt-player-${videoId}`;

  const initPlayer = useCallback(() => {
    if (!window.YT?.Player) return;
    try {
      playerRef.current = new window.YT.Player(playerId, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          showinfo: 0,
          enablejsapi: 1,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        },
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === 0) setEnded(true);
          },
        },
      });
    } catch {
      // Player init failed — iframe fallback is fine
    }
  }, [videoId, playerId]);

  useEffect(() => {
    // Load YouTube IFrame API script if not already loaded
    if (window.YT?.Player) {
      initPlayer();
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      initPlayer();
    };

    return () => {
      try {
        playerRef.current?.destroy();
      } catch {
        // ignore
      }
    };
  }, [initPlayer]);

  const replay = () => {
    setEnded(false);
    playerRef.current?.seekTo(0);
    playerRef.current?.playVideo();
  };

  const aspectClass = aspectRatio === "9/16" ? "aspect-[9/16]" : "aspect-video";

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-black ${aspectClass} ${className}`}
    >
      {/* YouTube player target div — API replaces this with iframe */}
      <div id={playerId} className="absolute inset-0 w-full h-full" />

      {/* Fallback iframe for when JS API doesn't load */}
      {!playerRef.current && (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&enablejsapi=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      )}

      {/* End-screen overlay */}
      {ended && (
        <div className="absolute inset-0 bg-black/90 z-10 flex flex-col items-center justify-center px-6 transition-opacity duration-500">
          {/* Replay button */}
          <button
            onClick={replay}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition-colors"
          >
            <RotateCcw size={14} />
            Replay
          </button>

          {nextItem ? (
            <>
              <span className="text-[#e6c46d] text-[10px] font-semibold uppercase tracking-[0.15em] mb-4">
                Up Next on ATL Vibes & Views
              </span>

              <Link
                href={`/media/${nextItem.slug}`}
                className="group block text-center max-w-md"
              >
                {nextItem.thumbnailUrl && (
                  <div className="relative w-48 mx-auto aspect-video overflow-hidden mb-4">
                    <Image
                      src={nextItem.thumbnailUrl}
                      alt={nextItem.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play size={18} className="text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                  </div>
                )}
                <h3 className="font-display text-lg font-semibold text-white group-hover:text-[#fee198] transition-colors line-clamp-2">
                  {nextItem.title}
                </h3>
                <span className="inline-flex items-center gap-1 mt-3 px-5 py-2 bg-[#fee198] text-[#1a1a1a] text-xs font-semibold uppercase tracking-[0.1em]">
                  Watch Now <ArrowRight size={12} />
                </span>
              </Link>

              {/* Related items */}
              {relatedItems.length > 0 && (
                <div className="flex gap-4 mt-8">
                  {relatedItems.slice(0, 3).map((item) => (
                    <Link
                      key={item.slug}
                      href={`/media/${item.slug}`}
                      className="group block w-32 text-center"
                    >
                      {item.thumbnailUrl && (
                        <div className="relative aspect-video overflow-hidden mb-2">
                          <Image
                            src={item.thumbnailUrl}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      )}
                      <p className="text-white/70 text-xs font-medium line-clamp-2 group-hover:text-white transition-colors">
                        {item.title}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <span className="text-white/60 text-sm mb-4">Video ended</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={replay}
                  className="inline-flex items-center gap-2 px-5 py-2 border border-white/30 text-white text-xs font-semibold uppercase tracking-[0.1em] hover:bg-white/10 transition-colors"
                >
                  <RotateCcw size={12} /> Replay
                </button>
                <Link
                  href="/media"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#fee198] text-[#1a1a1a] text-xs font-semibold uppercase tracking-[0.1em]"
                >
                  <ArrowLeft size={12} /> Back to Media
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
