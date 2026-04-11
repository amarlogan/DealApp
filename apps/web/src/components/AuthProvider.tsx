"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

type AuthCtx = {
  user: User | null;
  role: string | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  openLogin: () => void;
};

const AuthContext = createContext<AuthCtx>({
  user: null, role: null, session: null, loading: true,
  signOut: async () => {}, openLogin: () => {},
});

export function AuthProvider({
  children,
  onOpenLogin,
}: {
  children: React.ReactNode;
  onOpenLogin: () => void;
}) {
  const sb = createClient();
  const [user, setUser]       = useState<User | null>(null);
  const [role, setRole]       = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async (userId: string) => {
      const { data } = await sb.from('profiles').select('role').eq('id', userId).single();
      setRole(data?.role || 'user');
    };

    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) fetchRole(data.session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) fetchRole(sess.user.id);
      else setRole(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await sb.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, session, loading, signOut, openLogin: onOpenLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
