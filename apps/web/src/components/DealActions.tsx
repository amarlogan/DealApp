"use client";

import { useState } from "react";
import { Share2, Bookmark, Check } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface DealActionsProps {
  dealId: string;
  initialIsSaved: boolean;
  title: string;
}

export default function DealActions({ dealId, initialIsSaved, title }: DealActionsProps) {
  const { user, openLogin } = useAuth();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const toggleSave = async () => {
    if (!user || user.is_anonymous) {
      openLogin();
      return;
    }

    const nextState = !isSaved;
    setIsSaved(nextState);

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dealId, 
          action: nextState ? "add" : "remove" 
        }),
      });

      if (!res.ok) {
        // Rollback state on error
        setIsSaved(!nextState);
        const data = await res.json();
        console.error("Failed to sync favorite:", data.error);
      }
    } catch (err) {
      setIsSaved(!nextState);
      console.error("Save error:", err);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title,
          text: `Check out this deal: ${title}`,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Share error:", err);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Clipboard error:", err);
      }
    }
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleShare}
        disabled={isSharing}
        className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all shadow-sm ${
          isCopied 
            ? "border-emerald-500 bg-emerald-50 text-emerald-600" 
            : "border-gray-100 bg-white text-gray-400 hover:text-[var(--primary)] hover:border-[var(--primary)]"
        }`}
        title="Share Deal"
      >
        {isCopied ? <Check size={18} /> : <Share2 size={18} />}
        {isCopied && (
          <span className="absolute -top-10 bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded-lg animate-in fade-in slide-in-from-bottom-2">
            Link Copied!
          </span>
        )}
      </button>

      <button 
        onClick={toggleSave}
        className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all shadow-sm ${
          isSaved 
            ? "border-[var(--primary)] bg-emerald-50 text-[var(--primary)]" 
            : "border-gray-100 bg-white text-gray-400 hover:text-[var(--primary)] hover:border-[var(--primary)]"
        }`}
        title={isSaved ? "Saved to Profile" : "Save for Later"}
      >
        <Bookmark 
          size={18} 
          fill={isSaved ? "currentColor" : "none"} 
          className={isSaved ? "scale-110" : ""}
        />
      </button>
    </div>
  );
}
