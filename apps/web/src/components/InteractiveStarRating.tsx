"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface InteractiveStarRatingProps {
  dealId: string;
  initialRating: number;
  initialUserRating?: number | null;
  onRate?: (newRating: number, updatedStats?: { rating: number; review_count: number }) => void;
  readOnly?: boolean;
}

export default function InteractiveStarRating({
  dealId,
  initialRating,
  initialUserRating = null,
  onRate,
  readOnly = false,
}: InteractiveStarRatingProps) {
  const { user, openLogin } = useAuth();
  
  // We track the display rating (average or user vote depending on state)
  const [rating, setRating] = useState(initialUserRating || initialRating);
  const [hasRated, setHasRated] = useState(!!initialUserRating);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Keep in sync if props change
  useEffect(() => {
    if (initialUserRating) {
      setRating(initialUserRating);
      setHasRated(true);
    }
  }, [initialUserRating]);

  const handleRate = async (value: number) => {
    if (readOnly) return;
    if (!user || user.is_anonymous) {
      openLogin();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, rating: value }),
      });

      const data = await res.json();

      if (res.ok) {
        setRating(value);
        setHasRated(true);
        if (onRate) {
          onRate(value, { 
            rating: data.updatedRating, 
            review_count: data.updatedReviewCount 
          });
        }
      }
    } catch (err) {
      console.error("Failed to submit rating:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${readOnly ? "" : "group/stars"}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readOnly || submitting}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRate(i);
          }}
          onMouseEnter={() => !readOnly && setHover(i)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`transition-all duration-200 ${
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"
          }`}
          title={readOnly ? `${initialRating.toFixed(1)} Stars` : `Rate ${i} Stars`}
        >
          <Star
            size={readOnly ? 14 : 20}
            fill={(hover || rating) >= i ? (hasRated && !hover ? "#10b981" : "#f59e0b") : "transparent"}
            color={(hover || rating) >= i ? (hasRated && !hover ? "#10b981" : "#f59e0b") : "#d1d5db"}
            strokeWidth={(hover || rating) >= i ? 0 : 2}
            className={`${submitting ? "animate-pulse" : ""} ${hasRated && !hover && !readOnly ? "shadow-emerald-500/20" : ""}`}
          />
        </button>
      ))}
    </div>
  );
}
