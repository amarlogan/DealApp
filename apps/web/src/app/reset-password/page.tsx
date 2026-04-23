"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const sb = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Auth Rescue: Extract tokens from URL (Hash or Query)
  useEffect(() => {
    const rescueSession = async () => {
      setIsVerifying(true);
      try {
        const hash = window.location.hash.substring(1);
        const search = window.location.search.substring(1);
        const params = new URLSearchParams(hash || search);
        
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          console.log("ResetPage: Rescue tokens found! Establishing session...");
          const { error: sessionErr } = await sb.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionErr) throw sessionErr;
          console.log("ResetPage: Session rescued!");
        } else {
          // Check if we already have a session
          const { data } = await sb.auth.getSession();
          if (!data.session) {
            console.warn("ResetPage: No session and no tokens found in URL.");
          }
        }
      } catch (err: any) {
        console.error("ResetPage: Rescue failed", err);
        setError("Security check failed. Please try requesting a new reset link.");
      } finally {
        setIsVerifying(false);
      }
    };

    rescueSession();
  }, [sb.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Final check/refresh of session right before update
      const { data: { session } } = await sb.auth.getSession();
      if (!session) {
        throw new Error("Your security session has expired. Please click the link in your email again.");
      }

      const { error: err } = await sb.auth.updateUser({ password });
      if (err) throw err;

      setSuccess("Password updated successfully! You can now sign in with your new password.");
      setTimeout(() => router.push("/"), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#53A318] via-[#7cc93c] to-[#53A318]" />
        
        <div className="p-8">
          <div className="mb-6 text-center">
            <div className="text-3xl mb-1">🔐</div>
            <h2 className="text-2xl font-black text-gray-900">Set New Password</h2>
            <p className="text-gray-500 text-sm mt-2">
              Please enter your new password below.
            </p>
          </div>

          {isVerifying ? (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 text-blue-700 text-sm">
              <Loader2 className="animate-spin" size={16} />
              <span>Verifying security session...</span>
            </div>
          ) : !error && !success ? (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700 text-sm font-medium">
              <ShieldCheck size={16} />
              <span>Security session active. You can now update your password.</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#53A318] transition-colors text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#53A318] transition-colors text-sm font-medium"
              />
            </div>

            {error   && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full bg-[#53A318] hover:bg-[#3d7c10] text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
