"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

interface VotingSectionProps {
  dealId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserRating: number | null; // 1 (Down), 5 (Up)
  viewCount: number;
  compact?: boolean;
}

export default function VotingSection({
  dealId,
  initialUpvotes,
  initialDownvotes,
  initialUserRating,
  viewCount,
  compact = false,
}: VotingSectionProps) {
  const { user, openLogin } = useAuth();
  const router = useRouter();
  const [votes, setVotes] = useState({
    upvotes: initialUpvotes,
    downvotes: initialDownvotes,
    userRating: initialUserRating, // 1 or 5
  });
  const [submitting, setSubmitting] = useState(false);

  const handleVote = async (value: number) => {
    if (!user) {
      openLogin();
      return;
    }

    if (submitting || votes.userRating === value) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, rating: value }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit vote");
      }

      const data = await res.json();
      
      setVotes({
        upvotes: data.upvotes,
        downvotes: data.downvotes,
        userRating: value,
      });

      // Refresh the page data to update the top stats bar
      router.refresh();
    } catch (err) {
      console.error("Failed to submit vote:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const score = votes.upvotes - votes.downvotes;
  const isHot = score >= 10;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleVote(5)}
          disabled={submitting}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${
            votes.userRating === 5 
              ? "bg-green-600 text-white" 
              : "bg-white text-gray-500 hover:bg-green-50 hover:text-green-600 border border-gray-100 shadow-sm"
          }`}
        >
          {submitting && votes.userRating === 5 ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
          Like
        </button>
        
        <button
          onClick={() => handleVote(1)}
          disabled={submitting}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${
            votes.userRating === 1 
              ? "bg-red-600 text-white" 
              : "bg-white text-gray-500 hover:bg-red-50 hover:text-red-600 border border-gray-100 shadow-sm"
          }`}
        >
          {submitting && votes.userRating === 1 ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />}
          No
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left: Score & Views */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className={`text-5xl font-black tracking-tighter ${score >= 10 ? "text-red-500" : score > 0 ? "text-green-600" : "text-gray-900"}`}>
              {score > 0 ? `+${score}` : score}
            </span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Deal Score</span>
          </div>
          
          <div className="h-12 w-px bg-gray-100 hidden md:block" />
          
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-gray-900 tracking-tight">
              {viewCount.toLocaleString()}
            </span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Views</span>
          </div>
        </div>

        {/* Right: Vote Buttons */}
        <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Cast Your Vote</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleVote(5)}
              disabled={submitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all active:scale-95 ${
                votes.userRating === 5 
                  ? "bg-green-600 text-white shadow-lg shadow-green-200" 
                  : "bg-gray-50 text-gray-500 hover:bg-green-50 hover:text-green-600 border border-gray-100"
              }`}
            >
              {submitting && votes.userRating !== 5 ? <Loader2 size={18} className="animate-spin" /> : <ThumbsUp size={20} />}
              I like it
            </button>
            
            <button
              onClick={() => handleVote(1)}
              disabled={submitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all active:scale-95 ${
                votes.userRating === 1 
                  ? "bg-red-600 text-white shadow-lg shadow-red-200" 
                  : "bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 border border-gray-100"
              }`}
            >
              {submitting && votes.userRating !== 1 ? <Loader2 size={18} className="animate-spin" /> : <ThumbsDown size={20} />}
              Not for me
            </button>
          </div>
          <p className="text-[11px] font-medium text-gray-400 text-center md:text-right">
            {votes.userRating 
              ? "Thanks for voting! Your feedback helps the community." 
              : "Is this a good deal? Help others by voting."}
          </p>
        </div>

      </div>
      
      {/* Hot Indicator */}
      {isHot && (
        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-red-100 flex items-center justify-center text-xs font-black text-red-600">
                🔥
              </div>
            ))}
          </div>
          <p className="text-sm font-bold text-gray-700">
            This deal is <span className="text-red-500 font-black">HOT!</span> Many users are viewing and voting right now.
          </p>
        </div>
      )}
    </div>
  );
}
