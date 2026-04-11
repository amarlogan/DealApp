"use client";

import { useState, useRef, useEffect } from "react";
import { Tag } from "lucide-react";

export default function DealImage({ 
  src, 
  alt, 
  className,
  fallbackClassName = "w-full h-full flex items-center justify-center bg-gray-100",
  fallbackIconSize = 64
}: { 
  src?: string | null; 
  alt: string; 
  className?: string;
  fallbackClassName?: string;
  fallbackIconSize?: number;
}) {
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Catch images that failed to load before React hydration could attach onError
  useEffect(() => {
    if (imgRef.current) {
      if (imgRef.current.complete && imgRef.current.naturalWidth === 0) {
        setError(true);
      }
    }
  }, [src]);

  if (error || !src) {
    return (
      <div className={fallbackClassName}>
        <Tag size={fallbackIconSize} className="text-gray-300" />
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}
