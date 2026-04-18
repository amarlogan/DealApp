"use client";

import { useState, useEffect } from "react";

export default function useDevice() {
  const [device, setDevice] = useState<"mobile" | "desktop" | "loading">("loading");

  useEffect(() => {
    // Immediate check on mount
    const width = window.innerWidth;
    setDevice(width < 768 ? "mobile" : "desktop");

    const checkDevice = () => {
      setDevice(window.innerWidth < 768 ? "mobile" : "desktop");
    };

    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return device;
}
