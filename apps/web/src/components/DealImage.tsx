"use client";

import Image from "next/image";
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

  if (error || !src) {
    return (
      <div className={fallbackClassName}>
        <Tag size={fallbackIconSize} className="text-gray-300" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
}
