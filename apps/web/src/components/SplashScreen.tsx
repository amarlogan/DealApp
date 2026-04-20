"use client";

import { Percent } from "lucide-react";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // 2 seconds splash
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-[var(--primary)] flex flex-col items-center justify-center animate-out fade-out duration-500 fill-mode-forwards ease-out">
      <div className="relative group">
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl animate-pulse scale-150" />
        
        {/* Logo Container */}
        <div className="relative w-48 h-48 flex items-center justify-center animate-in zoom-in-50 duration-700">
          <img src="/logo.svg" alt="HuntMyDeal" className="w-full h-full animate-in fade-in duration-1000" />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <h1 className="text-3xl font-black tracking-tight text-white animate-in slide-in-from-bottom-4 duration-700 delay-300">
          HuntMy<span className="text-white/80">Deal</span>
        </h1>
        <p className="text-white/60 text-sm font-semibold tracking-widest uppercase animate-in fade-in duration-1000 delay-500">
          Best Deals • Daily
        </p>
      </div>

      {/* Loading bar */}
      <div className="mt-12 w-32 h-1 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-white w-full origin-left animate-loading-bar" />
      </div>
    </div>
  );
}
