"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";

interface FilterTag {
  key: string;
  label: string;
  value: string;
}

export function ActiveFilterTags() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse active filters from URL
  const activeTags = useMemo<FilterTag[]>(() => {
    const tags: FilterTag[] = [];

    // Search query
    const q = searchParams.get("q");
    if (q) {
      tags.push({
        key: "q",
        label: `Tìm: "${q}"`,
        value: q,
      });
    }

    // Categories (comma-separated)
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      const categories = categoryParam.split(",").filter(Boolean);
      categories.forEach((cat) => {
        tags.push({
          key: `category:${cat}`,
          label: cat,
          value: cat,
        });
      });
    }

    // Price range
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      let priceLabel: string;
      if (minPrice && maxPrice) {
        priceLabel = `${formatPrice(Number(minPrice))} - ${formatPrice(Number(maxPrice))}`;
      } else if (minPrice) {
        priceLabel = `Từ ${formatPrice(Number(minPrice))}`;
      } else {
        priceLabel = `Đến ${formatPrice(Number(maxPrice))}`;
      }
      tags.push({
        key: "price",
        label: priceLabel,
        value: "price",
      });
    }

    return tags;
  }, [searchParams]);

  // Remove a single filter
  const removeFilter = useCallback(
    (tag: FilterTag) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (tag.key === "q") {
          params.delete("q");
        } else if (tag.key.startsWith("category:")) {
          // Remove single category from comma-separated list
          const categoryParam = params.get("category");
          if (categoryParam) {
            const categories = categoryParam.split(",").filter(Boolean);
            const updated = categories.filter((c) => c !== tag.value);
            if (updated.length > 0) {
              params.set("category", updated.join(","));
            } else {
              params.delete("category");
            }
          }
        } else if (tag.key === "price") {
          params.delete("minPrice");
          params.delete("maxPrice");
        }

        // Reset page when filters change
        params.delete("page");

        const queryString = params.toString();
        router.push(queryString ? `/products?${queryString}` : "/products", {
          scroll: false,
        });
      });
    },
    [router, searchParams]
  );

  // Clear all filters
  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push("/products", { scroll: false });
    });
  }, [router]);

  // Don't render if no active filters
  if (activeTags.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        "transition-opacity duration-200 motion-reduce:transition-none",
        isPending && "opacity-60 pointer-events-none"
      )}
      role="region"
      aria-label="Bộ lọc đang hoạt động"
    >
      {activeTags.map((tag) => (
        <span
          key={tag.key}
          className={cn(
            "inline-flex items-center gap-1",
            "bg-accent text-accent-foreground",
            "rounded-full px-3 py-1 text-sm",
            "transition-colors duration-200 motion-reduce:transition-none"
          )}
        >
          <span>{tag.label}</span>
          <button
            type="button"
            onClick={() => removeFilter(tag)}
            className={cn(
              "ml-0.5 rounded-full p-1.5",
              "hover:bg-foreground/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "touch-action-manipulation"
            )}
            aria-label={`Xóa bộ lọc: ${tag.label}`}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </span>
      ))}

      {/* Show "Clear All" when 2+ filters are active */}
      {activeTags.length >= 2 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="text-muted-foreground hover:text-foreground h-7 px-2"
        >
          Xóa Tất Cả
        </Button>
      )}
    </div>
  );
}
