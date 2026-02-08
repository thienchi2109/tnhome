"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";
import { ArrowLeft, Minus, Plus, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cart";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const maxQuantity = Math.max(1, product.stock);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const newIndex = Math.round(container.scrollLeft / container.offsetWidth);
    if (newIndex !== selectedImageIndex && newIndex >= 0 && newIndex < product.images.length) {
      setSelectedImageIndex(newIndex);
    }
  }, [selectedImageIndex, product.images.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    let timeoutId: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 50);
    };
    container.addEventListener('scroll', debouncedScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || "",
        stock: product.stock,
      },
      quantity
    );
    setQuantity(1);
  };

  const scrollToImage = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({
      left: container.offsetWidth * index,
      behavior: 'smooth',
    });
    setSelectedImageIndex(index);
  };

  return (
    <div className="min-h-screen pb-16 md:pb-24">
      {/* Breadcrumb / Back Navigation */}
      <div className="container mx-auto px-4 pt-6 pb-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
        </Link>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Mobile: Swipeable Gallery */}
            <div className="md:hidden">
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
              >
                {product.images.map((img, idx) => (
                  <div key={idx} className="snap-center shrink-0 w-full">
                    <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
                      <Image
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                        priority={idx === 0}
                        loading={idx === 0 ? undefined : 'lazy'}
                        sizes="100vw"
                      />
                      {isOutOfStock && idx === 0 && (
                        <>
                          <div className="absolute inset-0 bg-white/60 z-10" />
                          <div className="absolute top-3 left-3 z-20">
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0">
                              Hết hàng
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination dots */}
              <div className="flex justify-center gap-2 py-4">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToImage(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      selectedImageIndex === idx ? "bg-foreground" : "bg-border"
                    )}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop: Main Image + Thumbnails */}
            <div className="hidden md:block space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
                {product.images[selectedImageIndex] ? (
                  <Image
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-200">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                {isOutOfStock && (
                  <>
                    <div className="absolute inset-0 bg-white/60 z-10" />
                    <div className="absolute top-3 left-3 z-20">
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0 text-sm">
                        Hết hàng
                      </Badge>
                    </div>
                  </>
                )}
              </div>
              {/* Thumbnails (Grid) */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={cn(
                        "relative aspect-square bg-muted rounded-xl overflow-hidden ring-2 transition-all",
                        selectedImageIndex === idx
                          ? "ring-primary"
                          : "ring-transparent hover:ring-primary/50"
                      )}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details - Sticky on Desktop */}
          <div className="md:sticky md:top-24 space-y-8">
            <div className="space-y-2">
              <span className="text-sm text-primary font-medium">
                {product.category}
              </span>
              <h1 className="heading-section leading-tight">{product.name}</h1>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold tracking-tight">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            {product.description && (
              <p className="text-body text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Stock Indicator */}
            {isLowStock && (
              <p className="text-sm text-amber-600 font-medium">
                Còn {product.stock} sản phẩm
              </p>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-6 border-t border-border">
              <div className="flex gap-4">
                <div className="flex items-center border border-border rounded-full px-3 h-12">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 hover:bg-muted rounded-full transition-colors"
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(quantity + 1, maxQuantity))}
                    className="p-1 hover:bg-muted rounded-full transition-colors"
                    disabled={quantity >= maxQuantity || isOutOfStock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  size="lg"
                  className="flex-1 rounded-full h-12 text-base"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Free shipping on orders over 1.000.000₫
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
