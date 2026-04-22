"use client";

import { useState, useRef } from "react";
import { Upload, X, Check, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  bucket?: string;
  label?: string;
}

export default function ImageUpload({ 
  onUploadComplete, 
  bucket = "hero-banners",
  label = "Upload Image" 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError("Please select an image file.");
      return;
    }

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File is too large (max 5MB).");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const sb = supabase();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { data, error } = await sb.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = sb.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border ${
          isUploading 
          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
          : "bg-white text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={14} />
            {label}
          </>
        )}
      </button>

      {uploadError && (
        <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">
          {uploadError}
        </p>
      )}
    </div>
  );
}
