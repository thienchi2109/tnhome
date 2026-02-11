"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";
import Image from "next/image";
import { ImagePlus, X, Loader2, GripVertical } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Badge } from "@/components/ui/badge";

// Utility function to reorder array items
function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = [...array];
  const [movedItem] = newArray.splice(from, 1);
  newArray.splice(to, 0, movedItem);
  return newArray;
}

// Sortable image item component
interface SortableImageItemProps {
  url: string;
  index: number;
  disabled?: boolean;
  onRemove: (url: string) => void;
  isFirst: boolean;
}

function SortableImageItem({ url, index, disabled, onRemove, isFirst }: SortableImageItemProps) {
  const { ref, isDragging } = useSortable({
    id: url,
    index,
    disabled,
  });

  return (
    <div
      ref={ref}
      className={`relative aspect-square rounded-xl overflow-hidden border bg-muted group cursor-grab active:cursor-grabbing ${
        isDragging ? "scale-105 shadow-lg opacity-50" : ""
      }`}
    >
      <Image
        src={url}
        alt="Hình ảnh sản phẩm"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 25vw"
      />

      {/* Drag Handle */}
      <div className="absolute top-2 left-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={() => onRemove(url)}
        disabled={disabled}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Primary Image Badge */}
      {isFirst && (
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="bg-black/50 text-white border-0">
            Ảnh chính
          </Badge>
        </div>
      )}
    </div>
  );
}

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

  // Use ref to avoid stale closure bug in Cloudinary widget callback
  const valueRef = useRef(value);
  
  // Update ref in useEffect, not during render
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const onUpload = useCallback((result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info !== "string" && result.info.secure_url) {
      onChange([...valueRef.current, result.info.secure_url]);
    }
    setIsUploading(false);
  }, [onChange]);

  const onRemove = useCallback((url: string) => {
    onChange(valueRef.current.filter((current) => current !== url));
  }, [onChange]);

  const handleDragEnd = useCallback((event: { 
    operation: { 
      source: { id: string | number } | null; 
      target: { id: string | number } | null; 
    } 
  }) => {
    const { source, target } = event.operation;
    if (!source || !target) return;

    const oldIndex = valueRef.current.findIndex(url => url === source.id);
    const newIndex = valueRef.current.findIndex(url => url === target.id);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      onChange(arrayMove(valueRef.current, oldIndex, newIndex));
    }
  }, [onChange]);

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <SortableImageItem
              key={url}
              url={url}
              index={index}
              disabled={disabled}
              onRemove={onRemove}
              isFirst={index === 0}
            />
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
      </DragDropProvider>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        Kéo thả để sắp xếp, ảnh đầu tiên là ảnh chính.
      </p>
    </div>
  );
}
