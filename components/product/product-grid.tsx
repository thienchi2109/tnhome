import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
}

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  mobileLimit?: number;
}

export function ProductGrid({ products, isLoading, mobileLimit }: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton count={12} />;
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <p className="text-muted-foreground text-body">
          Không tìm thấy sản phẩm nào.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
      {products.map((product, index) => (
        <div
          key={product.id}
          className={mobileLimit && index >= mobileLimit ? "hidden lg:block" : undefined}
        >
          <ProductCard
            id={product.id}
            name={product.name}
            price={product.price}
            images={product.images}
            category={product.category}
          />
        </div>
      ))}
    </div>
  );
}

// Skeleton component for loading states
interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 24 }: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 animate-pulse">
          {/* Image skeleton */}
          <div
            className={cn(
              "aspect-square rounded-xl bg-muted/60",
              "relative overflow-hidden"
            )}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          {/* Text skeleton */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start gap-2">
              <div className="h-4 bg-muted/60 rounded w-3/4" />
              <div className="h-4 bg-muted/60 rounded w-16 flex-shrink-0" />
            </div>
            <div className="h-3 bg-muted/40 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
