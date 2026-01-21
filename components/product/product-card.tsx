"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export function ProductCard({ id, name, price, image, category }: ProductCardProps) {
  return (
    <Link href={`/product/${id}`} className="group flex flex-col gap-3">
      <div className="aspect-square relative overflow-hidden rounded-xl bg-muted/50">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Không có hình ảnh</span>
          </div>
        )}

        {/* Interaction Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick Add Button - Desktop */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
          <Button
            className="w-full rounded-full shadow-lg"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              // Add to cart logic
            }}
          >
            Thêm nhanh
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <h3 className="text-base font-medium leading-tight group-hover:text-primary transition-colors">
            {name}
          </h3>
          <span className="text-sm font-semibold">{formatPrice(price)}</span>
        </div>
        {category && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {category}
          </p>
        )}
      </div>
    </Link>
  );
}
