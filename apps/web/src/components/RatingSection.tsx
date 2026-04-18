"use client";

import { useState } from "react";
import { Star, Users } from "lucide-react";
import InteractiveStarRating from "./InteractiveStarRating";

interface RatingSectionProps {
  dealId: string;
  initialRating: number;
  initialReviewCount: number;
  initialUserRating: number | null;
  initialDistribution: number[]; // [1s, 2s, 3s, 4s, 5s]
}

export default function RatingSection({
  dealId,
  initialRating,
  initialReviewCount,
  initialUserRating,
  initialDistribution,
}: RatingSectionProps) {
  const [stats, setStats] = useState({
    rating: initialRating,
    reviewCount: initialReviewCount,
    userRating: initialUserRating,
    distribution: initialDistribution,
  });

  const handleRateUpdate = (newRating: number, updatedAggregate?: { rating: number; review_count: number }) => {
    setStats(prev => {
      const newDistribution = [...prev.distribution];
      
      // If user changed their rating, decrement the old one
      if (prev.userRating) {
        newDistribution[prev.userRating - 1] = Math.max(0, newDistribution[prev.userRating - 1] - 1);
      }
      
      // Increment the new rating
      newDistribution[newRating - 1]++;

      return {
        ...prev,
        userRating: newRating,
        distribution: newDistribution,
        rating: updatedAggregate?.rating ?? prev.rating,
        reviewCount: updatedAggregate?.review_count ?? prev.reviewCount,
      };
    });
  };

  const totalVotes = stats.reviewCount || 1;
  const labels = ["5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"];
  const reversedDistribution = [...stats.distribution].reverse();

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left: Interactive Stars and Average */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-xl font-black text-gray-900 mb-2">Community Rating</h3>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl font-black text-gray-900 tracking-tighter">
              {stats.rating.toFixed(1)}
            </span>
            <div className="flex flex-col">
              <InteractiveStarRating 
                dealId={dealId} 
                initialRating={stats.rating} 
                initialUserRating={stats.userRating}
                onRate={handleRateUpdate}
              />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                {stats.reviewCount} total reviews
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            {stats.userRating 
              ? `You rated this deal ${stats.userRating} stars. Thanks for contributing!` 
              : "Help the community by sharing your experience with this deal."}
          </p>
        </div>

        {/* Right: Distribution Bars */}
        <div className="space-y-3">
          {labels.map((label, i) => {
            const count = reversedDistribution[i];
            const percentage = (count / totalVotes) * 100;
            const starCount = 5 - i;

            return (
              <div key={label} className="flex items-center gap-4 group">
                <span className="text-[10px] font-black text-gray-400 uppercase w-16 tracking-tighter group-hover:text-gray-900 transition-colors">
                  {label}
                </span>
                <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                  <div 
                    className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 w-8 text-right">
                  {Math.round(percentage)}%
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
