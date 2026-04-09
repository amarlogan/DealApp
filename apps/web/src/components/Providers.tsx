"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthProvider";
import LoginModal from "./LoginModal";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider onOpenLogin={() => setShowLogin(true)}>
        {children}
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </AuthProvider>
    </QueryClientProvider>
  );
}
