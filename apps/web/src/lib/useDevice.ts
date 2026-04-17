"use client";

import { useState, useEffect } from "react";

export default function useDevice() {
  const [device, setDevice] = useState<"mobile" | "desktop" | "loading">("loading");

  useEffect(() => {
    const checkDevice = () => {
      // Typically mobile is < 1024px (lg in Tailwind) or < 768px (md)
      // For Immersive Mobile, we target phones specifically (< 768px)
      setDevice(window.innerWidth < 768 ? "mobile" : "desktop");
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return device;
}
