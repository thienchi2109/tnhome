"use client";

import { cn, formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  category?: string;
}

export function ProductCard({ id, name, price, image, images, category }: ProductCardProps) {
  // Normalize to array for backward compatibility
  const imageList = images ?? (image ? [image] : []);
  const hasMultipleImages = imageList.length > 1;

  return (
    <Link href={`/product/${id}`} className="group flex flex-col gap-4">
      <div className="aspect-[3/4] relative overflow-hidden bg-muted/30">
        {imageList.length > 0 ? (
          <>
            {/* Primary Image */}
            <Image
              src={imageList[0]}
              alt={name}
              fill
              className={cn(
                "object-cover transition-transform duration-500 ease-out group-hover:scale-105",
                "motion-reduce:transition-none"
              )}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />

            {/* Secondary Image (Hover) */}
            {hasMultipleImages && (
              <Image
                src={imageList[1]}
                alt={name}
                fill
                loading="lazy"
                aria-hidden="true"
                className={cn(
                  "object-cover absolute inset-0 opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-500 ease-out motion-reduce:transition-none"
                )}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-secondary flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="heading-product text-foreground group-hover:underline decoration-1 underline-offset-4 transition-all">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          {category && (
            <p className="text-caption">
              {category}
            </p>
          )}
          <span className="text-sm font-medium text-foreground">{formatPrice(price)}</span>
        </div>
      </div>
    </Link>
  );
}
