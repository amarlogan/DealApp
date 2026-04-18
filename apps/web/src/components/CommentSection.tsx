"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { MessageSquare, Send, User as UserIcon } from "lucide-react";

interface Profile {
  display_name: string;
  avatar_url: string;
}

interface Comment {
  id: string;
  deal_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  profiles: Profile;
}

export default function CommentSection({ dealId }: { dealId: string }) {
  const { user, openLogin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [dealId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?dealId=${dealId}`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!user) {
      openLogin();
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, content: newComment, parentId }),
      });

      if (res.ok) {
        const { comment } = await res.json();
        setComments((prev) => [...prev, comment]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const rootComments = comments.filter((c) => !c.parent_id);

  return (
    <div id="comments" className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden scroll-mt-32">
      <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <MessageSquare className="text-[var(--primary)]" /> Community Discussion
        </h3>
        <span className="text-sm font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
          {comments.length} Comments
        </span>
      </div>

      <div className="p-6">
        {/* Post Comment Input */}
        <form onSubmit={(e) => handleSubmit(e)} className="mb-8">
          <div className="relative group">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Share your thoughts on this deal..." : "Sign in to post a comment"}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 min-h-[120px] transition-all focus:border-[var(--primary)] focus:bg-white outline-none text-gray-700 font-medium"
              disabled={submitting}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-[var(--primary)] hover:bg-[#3d7c10] text-white font-black px-6 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? "Posting..." : <>Post <Send size={16} /></>}
              </button>
            </div>
          </div>
        </form>

        {/* Comment List */}
        {loading ? (
          <div className="flex flex-col gap-4 py-8">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : rootComments.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-bold text-lg">No comments yet. Be the first to start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {rootComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} allComments={comments} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, allComments }: { comment: Comment; allComments: Comment[] }) {
  const replies = allComments.filter((c) => c.parent_id === comment.id);
  const date = new Date(comment.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="group/comment relative">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.profiles?.avatar_url ? (
            <img
              src={comment.profiles.avatar_url}
              alt={comment.profiles.display_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-100 shadow-sm">
              <UserIcon size={18} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-gray-900">{comment.profiles?.display_name || "NexusUser"}</span>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">• {date}</span>
          </div>
          <div className="bg-gray-50 group-hover/comment:bg-gray-100/50 transition-colors p-4 rounded-2xl rounded-tl-none inline-block max-w-full">
            <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          </div>
          
          {/* Action (simulated reply for now) */}
          <div className="mt-2 flex items-center gap-4 opacity-0 group-hover/comment:opacity-100 transition-opacity">
             <button className="text-xs font-black text-gray-400 hover:text-[var(--primary)] transition-colors uppercase tracking-wider">Reply</button>
             <button className="text-xs font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider">Report</button>
          </div>

          {/* Nested Replies */}
          {replies.length > 0 && (
            <div className="mt-4 ml-2 pl-6 border-l-2 border-gray-100 space-y-6">
              {replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} allComments={allComments} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
