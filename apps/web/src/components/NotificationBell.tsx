"use client";

import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "./AuthProvider";
import NotificationDropdown, { Notification } from "./NotificationDropdown";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markAsRead = async (id: string) => {
    const markAll = id === 'all';
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: markAll ? undefined : id, markAll }),
      });
      
      if (markAll) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } else {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 2 minutes for updates
      const interval = setInterval(fetchNotifications, 120000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button 
        id="notifications-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications" 
        className={`relative p-2.5 rounded-full transition-all group ${
          isOpen ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-100 text-gray-600 hover:text-[#53A318]'
        }`}
      >
        <Bell size={20} className={`${isOpen ? 'animate-none' : 'group-hover:animate-bounce-short'}`} />
        
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-in zoom-in duration-300 shadow-[0_0_8px_rgba(239,68,68,0.5)] border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown 
          notifications={notifications} 
          onClose={() => setIsOpen(false)}
          onMarkRead={markAsRead}
        />
      )}
    </div>
  );
}
