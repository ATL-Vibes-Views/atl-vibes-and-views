"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  visit_date: string | null;
  created_at: string;
  reviewer_name: string;
}

interface ReviewsClientProps {
  reviews: Review[];
}

function Stars({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= count ? "fill-[#fee198] text-[#e6c46d]" : "text-[#e5e5e5]"}
        />
      ))}
    </div>
  );
}

export default function ReviewsClient({ reviews }: ReviewsClientProps) {
  const [responseText, setResponseText] = useState<Record<string, string>>({});

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "0.0";

  // Rating distribution
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of reviews) {
    distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
  }

  const handleSubmitResponse = (reviewId: string) => {
    console.log("Response submitted", { reviewId, text: responseText[reviewId] });
  };

  // Placeholder reviews if none exist
  const displayReviews =
    reviews.length > 0
      ? reviews
      : [
          {
            id: "placeholder-1",
            rating: 5,
            title: "Best gym in the Westside!",
            body: "Amazing trainers, top-notch equipment, and the most welcoming community. I've been a member for 6 months and it's changed my life.",
            visit_date: "2026-01-15",
            created_at: "2026-01-20T10:00:00Z",
            reviewer_name: "Sarah M.",
          },
          {
            id: "placeholder-2",
            rating: 4,
            title: "Great experience overall",
            body: "Love the variety of classes. The boxing fundamentals class is perfect for beginners. Only wish they had more evening time slots.",
            visit_date: "2026-01-10",
            created_at: "2026-01-12T14:30:00Z",
            reviewer_name: "Marcus T.",
          },
          {
            id: "placeholder-3",
            rating: 5,
            title: "A hidden gem in Blandtown",
            body: "This place is incredible. The coaches really take time to work with you one-on-one. Clean facility, great vibes.",
            visit_date: "2025-12-28",
            created_at: "2026-01-02T09:15:00Z",
            reviewer_name: "Devon R.",
          },
        ];

  const displayTotal = reviews.length > 0 ? totalReviews : 3;
  const displayAvg = reviews.length > 0 ? avgRating : "4.7";
  const displayDist =
    reviews.length > 0 ? distribution : { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 };

  return (
    <>
      <PortalTopbar title="Reviews" />
      <div className="p-8 max-[899px]:pt-16">
        {/* Review Summary */}
        <div className="bg-white border border-[#e5e5e5] p-6 mb-8">
          <div className="flex items-start gap-8 flex-wrap">
            {/* Big average */}
            <div className="text-center">
              <div className="font-display text-[48px] font-bold text-black leading-none">
                {displayAvg}
              </div>
              <Stars count={Math.round(Number(displayAvg))} size={18} />
              <p className="text-[12px] text-[#6b7280] mt-1">{displayTotal} reviews</p>
            </div>

            {/* Distribution bars */}
            <div className="flex-1 min-w-[200px] space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = displayDist[star] ?? 0;
                const pct = displayTotal > 0 ? (count / displayTotal) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[12px] font-body text-[#6b7280] w-12">{star} star</span>
                    <div className="flex-1 h-2 bg-[#f5f5f5]">
                      <div
                        className="h-full bg-[#fee198]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[12px] font-body text-[#6b7280] w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Review list */}
        <div className="space-y-4">
          {displayReviews.map((review) => (
            <div key={review.id} className="bg-white border border-[#e5e5e5] p-6">
              <div className="flex items-center justify-between mb-2">
                <Stars count={review.rating} />
                <span className="text-[12px] text-[#6b7280]">
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              {review.title && (
                <h4 className="text-[15px] font-semibold font-body text-black mb-1">
                  {review.title}
                </h4>
              )}
              {review.body && (
                <p className="text-[13px] font-body text-[#374151] mb-2">{review.body}</p>
              )}
              <p className="text-[12px] text-[#6b7280]">— {review.reviewer_name}</p>

              {/* Owner response form */}
              <div className="mt-4 bg-[#f5f5f5] border-l-4 border-[#fee198] p-4">
                <p className="text-[11px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] mb-2">
                  Owner Response
                </p>
                <textarea
                  value={responseText[review.id] ?? ""}
                  onChange={(e) =>
                    setResponseText((prev) => ({ ...prev, [review.id]: e.target.value }))
                  }
                  placeholder="Write a response to this review..."
                  className="w-full px-3.5 py-2.5 text-[13px] font-body border border-[#e5e5e5] bg-white min-h-[80px] resize-y placeholder:text-[#9ca3af] focus:border-[#e6c46d] focus:ring-2 focus:ring-[#fee198]/30 focus:outline-none transition-colors"
                />
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleSubmitResponse(review.id)}
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
                  >
                    Submit Response
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
