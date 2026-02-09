"use client";

import { cn, formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  category?: string;
  stock?: number;
}

export function ProductCard({ id, name, price, image, images, category, stock }: ProductCardProps) {
  // Normalize to array for backward compatibility
  const imageList = images ?? (image ? [image] : []);
  const hasMultipleImages = imageList.length > 1;
  const isOutOfStock = stock !== undefined && stock <= 0;

  return (
    <Link
      href={`/product/${id}`}
      className="group flex flex-col h-full overflow-hidden rounded-xl border border-transparent bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/10"
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-muted/30">
        {imageList.length > 0 ? (
          <>
            {/* Primary Image */}
            <Image
              src={imageList[0]}
              alt={name}
              fill
              className={cn(
                "object-cover transition-transform duration-700 ease-out group-hover:scale-110",
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

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <>
            <div className="absolute inset-0 bg-white/60 z-10 backdrop-blur-[1px]" />
            <div className="absolute top-3 left-3 z-20">
              <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 uppercase tracking-wider font-semibold">
                Hết hàng
              </Badge>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 p-5">
        <h3 className="font-heading font-medium text-base leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
          {name}
        </h3>
        <div className="mt-auto flex flex-col gap-2 pt-2 border-t border-dashed border-border/50 lg:flex-row lg:items-center lg:justify-between">
          {category && (
            <p className="w-full text-xs font-medium text-muted-foreground uppercase tracking-wider leading-snug line-clamp-2 bg-muted px-2 py-1 rounded-sm lg:line-clamp-1 lg:max-w-[65%]">
              {category}
            </p>
          )}
          <span className="self-end font-bold text-lg text-primary tracking-tight lg:self-auto shrink-0">
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
