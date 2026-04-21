"use client";

import { useState } from "react";
import { Mail, Send, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "support",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit form");
      }

      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  if (status === "success") {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center animate-in fade-in zoom-in duration-500">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 text-[var(--primary)] rounded-3xl mb-8">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Message Sent!</h1>
        <p className="text-gray-500 font-medium leading-relaxed mb-10">
          Thank you for reaching out. We've received your request and our team will get back to you at <span className="text-gray-900 font-bold">{form.email}</span> shortly.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
        >
          Return Home <ChevronRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-12 text-center lg:text-left lg:flex lg:items-end lg:justify-between gap-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--primary-light)] text-[var(--primary)] rounded-2xl mb-6">
            <Mail size={28} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4">Get in Touch</h1>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            Have a question about a deal or want to discuss a partnership? Send us a message and we'll reply within 24 hours.
          </p>
        </div>
        
        <div className="hidden lg:block pb-2">
          <div className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Email us directly</div>
          <a href="mailto:support@huntmydeal.com" className="text-xl font-black text-[var(--primary)] hover:underline decoration-2 underline-offset-4">
            support@huntmydeal.com
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all font-medium text-gray-900"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Email Address</label>
                <input 
                  required
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all font-medium text-gray-900"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Inquiry Type</label>
              <select 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all font-bold text-gray-900 appearance-none pointer-events-auto"
                value={form.subject}
                onChange={e => setForm({...form, subject: e.target.value})}
              >
                <option value="support">Customer Support</option>
                <option value="business">Business Collaboration</option>
                <option value="feedback">Product Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Message</label>
              <textarea 
                required
                rows={5}
                placeholder="How can we help you today?"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all font-medium text-gray-900 resize-none"
                value={form.message}
                onChange={e => setForm({...form, message: e.target.value})}
              />
            </div>

            {status === "error" && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold">
                <AlertCircle size={18} />
                {errorMsg}
              </div>
            )}

            <button 
              type="submit"
              disabled={status === "loading"}
              className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[var(--primary)] text-white rounded-2xl font-black text-lg hover:bg-[var(--primary-dark)] transition-all shadow-xl shadow-[var(--primary-light)]/40 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {status === "loading" ? "Sending..." : (
                <>
                  Send Message <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 rounded-[2.5rem] bg-gray-900 text-white space-y-6">
            <h3 className="text-2xl font-black tracking-tight">Standard Response Times</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                </div>
                <div>
                  <div className="font-bold">Active Support</div>
                  <div className="text-sm text-gray-400">9:00 AM - 6:00 PM EST</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} className="text-[var(--primary)]" />
                </div>
                <div>
                  <div className="font-bold">Response Guarantee</div>
                  <div className="text-sm text-gray-400">Under 24 hours for all messages</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] border border-gray-100 bg-white space-y-4">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Partnerships</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Are you a brand looking to feature your verified deals on HuntMyDeal? Select <span className="text-gray-900 font-bold">"Business Collaboration"</span> above and our account team will contact you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
