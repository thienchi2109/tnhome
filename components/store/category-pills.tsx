"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CategoryPill {
  name: string;
  slug: string;
}

interface CategoryPillsProps {
  categories: CategoryPill[];
}

export function CategoryPills({ categories }: CategoryPillsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_COUNT = 12;

  const visibleCategories = isExpanded ? categories : categories.slice(0, INITIAL_COUNT);
  const hasMore = categories.length > INITIAL_COUNT;

  return (
    <div className="px-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/products"
            className={cn(
              "shrink-0 rounded-full border border-primary bg-primary px-5 py-2",
              "text-sm font-medium text-primary-foreground shadow-sm",
              "transition-all duration-300 hover:opacity-90 hover:shadow-md active:scale-95"
            )}
          >
            Tất cả
          </Link>
          {visibleCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className={cn(
                "shrink-0 rounded-full border border-border bg-background/50 backdrop-blur-sm px-5 py-2",
                "text-sm font-medium text-muted-foreground hover:text-foreground",
                "transition-all duration-300 hover:border-foreground/20 hover:bg-muted/50 hover:shadow-sm active:scale-95"
              )}
            >
              {category.name}
            </Link>
          ))}

          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-full px-4 h-9 gap-1 text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <>
                  Thu gọn <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Xem thêm <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
