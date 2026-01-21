"use client";

import { useState } from "react";
import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export function ImageUpload({
  value = [],
  onChange,
  disabled,
  maxImages = 5,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = (result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info !== "string" && result.info.secure_url) {
      onChange([...value, result.info.secure_url]);
    }
    setIsUploading(false);
  };

  const onRemove = (url: string) => {
    onChange(value.filter((current) => current !== url));
  };

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {value.map((url) => (
          <div
            key={url}
            className="relative aspect-square rounded-xl overflow-hidden border bg-muted group"
          >
            <Image
              src={url}
              alt="Hình ảnh sản phẩm"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <button
              type="button"
              onClick={() => onRemove(url)}
              disabled={disabled}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Upload Button */}
        {value.length < maxImages && (
          <CldUploadWidget
            uploadPreset="tnhome_products"
            onSuccess={onUpload}
            onOpen={() => setIsUploading(true)}
            onClose={() => setIsUploading(false)}
            options={{
              maxFiles: maxImages - value.length,
              resourceType: "image",
              sources: ["local", "url", "camera"],
              styles: {
                palette: {
                  window: "#FFFFFF",
                  windowBorder: "#D2D2D7",
                  tabIcon: "#007AFF",
                  menuIcons: "#1D1D1F",
                  textDark: "#1D1D1F",
                  textLight: "#FFFFFF",
                  link: "#007AFF",
                  action: "#007AFF",
                  inactiveTabIcon: "#8E8E93",
                  error: "#FF3B30",
                  inProgress: "#007AFF",
                  complete: "#34C759",
                  sourceBg: "#F5F5F7",
                },
              },
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                disabled={disabled || isUploading}
                className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-muted/30 hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">
                      Thêm ảnh
                    </span>
                  </>
                )}
              </button>
            )}
          </CldUploadWidget>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        {value.length}/{maxImages} hình ảnh. Nhấn để tải lên hoặc kéo thả.
      </p>
    </div>
  );
}
