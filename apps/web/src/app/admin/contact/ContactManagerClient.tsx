"use client";

import { useState } from "react";
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Search,
  Filter,
  MoreVertical,
  User,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

type Submission = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved" | "closed";
};

const STATUS_CONFIG = {
  new: { label: "New", color: "bg-blue-50 text-blue-600 border-blue-100", icon: Mail },
  in_progress: { label: "In Progress", color: "bg-orange-50 text-orange-600 border-orange-100", icon: Clock },
  resolved: { label: "Resolved", color: "bg-green-50 text-[var(--primary)] border-green-100", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-gray-50 text-gray-400 border-gray-100", icon: XCircle },
};

export default function ContactManagerClient({ initialSubmissions }: { initialSubmissions: Submission[] }) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setSubmissions(prev => 
        prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s)
      );
    } catch (err) {
      console.error(err);
      alert("Error updating status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = submissions.filter(s => {
    const matchesFilter = filter === "all" || s.status === filter;
    const matchesSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search responses..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium text-sm transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <button 
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            All Submissions
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <button 
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === key ? config.color : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Submissions Grid ── */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 text-gray-300 rounded-2xl mb-4">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No inquiries found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2">Adjust your filters or search terms to find what you're looking for.</p>
          </div>
        ) : (
          filtered.map((s) => {
            const config = STATUS_CONFIG[s.status];
            const StatusIcon = config.icon;

            return (
              <div 
                key={s.id} 
                className="group bg-white rounded-[2rem] border border-gray-100 p-6 sm:p-8 hover:shadow-xl hover:shadow-gray-200/40 transition-all animate-in fade-in slide-in-from-bottom-4"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left: Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
                        <StatusIcon size={12} />
                        {config.label}
                      </div>
                      <span className="text-xs font-black uppercase text-gray-300 tracking-widest">
                        {s.subject}
                      </span>
                      <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                        <Calendar size={12} />
                        {format(new Date(s.created_at), "MMM d, yyyy • h:mm a")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 group/name">
                        <User size={16} className="text-gray-400" />
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">{s.name}</h2>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline cursor-pointer">
                        <Mail size={14} />
                        {s.email}
                      </div>
                    </div>

                    <div className="p-5 bg-gray-50 rounded-2xl text-gray-600 font-medium leading-relaxed italic border-l-4 border-gray-200">
                      "{s.message}"
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:w-64 shrink-0 flex lg:flex-col gap-3 justify-end lg:justify-start">
                    <div className="flex flex-col gap-2 w-full">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Update Status</label>
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                        {s.status !== 'new' && (
                          <button 
                            onClick={() => handleStatusUpdate(s.id, 'new')}
                            disabled={updating === s.id}
                            className="text-xs font-bold px-4 py-2.5 rounded-xl border border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            Mark New
                          </button>
                        )}
                        {s.status !== 'in_progress' && (
                          <button 
                            onClick={() => handleStatusUpdate(s.id, 'in_progress')}
                            disabled={updating === s.id}
                            className="text-xs font-bold px-4 py-2.5 rounded-xl border border-orange-100 text-orange-600 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            Start Work
                          </button>
                        )}
                        {s.status !== 'resolved' && (
                          <button 
                            onClick={() => handleStatusUpdate(s.id, 'resolved')}
                            disabled={updating === s.id}
                            className="text-xs font-bold px-4 py-2.5 rounded-xl border border-green-100 text-[var(--primary)] hover:bg-green-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            Resolve
                          </button>
                        )}
                        {s.status !== 'closed' && (
                          <button 
                            onClick={() => handleStatusUpdate(s.id, 'closed')}
                            disabled={updating === s.id}
                            className="text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>

                    <a 
                      href={`mailto:${s.email}?subject=Re: [HuntMyDeal] ${s.subject}`}
                      className="mt-auto flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-all"
                    >
                      Reply to Customer <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
