"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StorePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export function StorePagination({
  currentPage,
  totalPages,
  totalItems,
}: StorePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Don't render if only one page
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  };

  const navigateToPage = (page: number) => {
    startTransition(() => {
      router.push(createPageUrl(page), { scroll: false });
    });
  };

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Phân trang sản phẩm"
      className="relative flex flex-col items-center gap-4 py-12 md:py-16"
    >
      {/* Screen reader live region for page changes */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {isPending
          ? "Đang tải sản phẩm..."
          : `Trang ${currentPage} trên ${totalPages}, ${totalItems.toLocaleString("vi-VN")} sản phẩm`}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Previous Button */}
        <button
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={!canGoPrev || isPending}
          aria-label="Trang trước"
          className={cn(
            "group relative flex items-center gap-1.5 px-4 py-2.5 rounded-full",
            "text-sm font-medium transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            canGoPrev
              ? "text-foreground hover:bg-muted active:scale-[0.98]"
              : "text-muted-foreground/40 cursor-not-allowed",
            isPending && "opacity-60"
          )}
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              canGoPrev && "group-hover:-translate-x-0.5"
            )}
          />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Page Indicator */}
        <div
          aria-current="page"
          className={cn(
            "flex items-center justify-center min-w-[140px] sm:min-w-[120px] px-4 py-2",
            "text-sm tracking-wide transition-opacity duration-200",
            isPending && "opacity-50"
          )}
        >
          <span className="text-muted-foreground">Trang</span>
          <span className="mx-2 font-semibold text-foreground tabular-nums">
            {currentPage}
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="ml-2 text-muted-foreground tabular-nums">
            {totalPages}
          </span>
        </div>

        {/* Next Button */}
        <button
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={!canGoNext || isPending}
          aria-label="Trang sau"
          className={cn(
            "group relative flex items-center gap-1.5 px-4 py-2.5 rounded-full",
            "text-sm font-medium transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            canGoNext
              ? "text-foreground hover:bg-muted active:scale-[0.98]"
              : "text-muted-foreground/40 cursor-not-allowed",
            isPending && "opacity-60"
          )}
        >
          <span className="hidden sm:inline">Tiếp</span>
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              canGoNext && "group-hover:translate-x-0.5"
            )}
          />
        </button>
      </div>

      {/* Total Items Caption */}
      <p className="text-caption text-center">
        {totalItems.toLocaleString("vi-VN")} sản phẩm
      </p>

      {/* Loading Indicator */}
      {isPending && (
        <div className="absolute inset-x-0 top-0 pointer-events-none">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-pulse" />
        </div>
      )}
    </nav>
  );
}
