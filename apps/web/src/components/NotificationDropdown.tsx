"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Bell, Check, ExternalLink, Info, Megaphone, Tag, X } from "lucide-react";
import Link from "next/link";

export type Notification = {
  id: string;
  title: string;
  content: string;
  type: 'price_drop' | 'news' | 'promotion' | 'info';
  link?: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationDropdown({ 
  notifications, 
  onClose,
  onMarkRead
}: { 
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
}) {
  const ICON_MAP = {
    price_drop: <Tag size={16} className="text-amber-500" />,
    news:       <Megaphone size={16} className="text-blue-500" />,
    promotion:  <ExternalLink size={16} className="text-purple-500" />,
    info:       <Info size={16} className="text-gray-400" />,
  };

  return (
    <div className="absolute right-0 mt-3 w-[360px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-black text-gray-900 tracking-tight">Recent Alerts</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto hide-scrollbar">
        {notifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-4 grayscale opacity-30">🔔</div>
            <p className="text-gray-500 font-bold text-sm">All caught up!</p>
            <p className="text-xs text-gray-400 mt-1">We'll notify you here when prices drop.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`group relative px-6 py-5 hover:bg-gray-50 transition-all flex gap-4 ${n.is_read ? 'opacity-60' : ''}`}
              >
                {/* Icon wrapper */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${n.is_read ? 'bg-gray-100 text-gray-400' : 'bg-amber-50 text-amber-600 shadow-sm'}`}>
                  {ICON_MAP[n.type] || <Bell size={16} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={`text-sm tracking-tight leading-tight ${n.is_read ? 'font-bold text-gray-500' : 'font-black text-gray-900'}`}>
                      {n.title}
                    </h4>
                    {!n.is_read && <span className="w-2 h-2 bg-[#53A318] rounded-full animate-pulse shadow-[0_0_8px_rgba(83,163,24,0.6)]" />}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2 font-medium">
                    {n.content}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    {n.link && (
                      <Link 
                        href={n.link} 
                        onClick={onClose}
                        className="text-[10px] font-black text-[#53A318] uppercase tracking-widest hover:underline"
                      >
                        Details →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Mark as read button */}
                {!n.is_read && (
                  <button 
                    onClick={() => onMarkRead(n.id)}
                    className="absolute top-4 right-4 p-1.5 bg-white shadow-sm border border-gray-100 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:text-green-600 transition-all transform hover:scale-110"
                    title="Mark as read"
                  >
                    <Check size={12} strokeWidth={3} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <Link href="/profile/alerts" onClick={onClose} className="text-xs font-black text-gray-500 hover:text-[#53A318] transition-colors">
            Manage Alerts
          </Link>
          <button 
            onClick={() => onMarkRead('all')}
            className="text-xs font-black text-[#53A318] hover:text-[#3d7c10] transition-colors"
          >
            Mark all read
          </button>
        </div>
      )}
    </div>
  );
}
