"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/constants";

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  variant?: "store" | "admin";
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: { value: string; label: string }[];
  ariaLabel?: string;
}

export function PaginationNav({
  currentPage,
  totalPages,
  variant = "store",
  totalItems,
  pageSize,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  ariaLabel = "Phân trang",
}: PaginationNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number, newPageSize?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    if (newPageSize !== undefined) {
      params.set("pageSize", newPageSize.toString());
    }
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // ── Store Variant ──
  if (variant === "store") {
    const navigateToPage = (page: number) => {
      startTransition(() => {
        router.push(createPageUrl(page), { scroll: false });
      });
    };

    return (
      <nav
        aria-label={ariaLabel}
        className="relative flex flex-col items-center gap-4 py-12 md:py-16"
      >
        {/* Screen reader live region */}
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isPending
            ? "Đang tải sản phẩm..."
            : `Trang ${currentPage} trên ${totalPages}${totalItems !== undefined ? `, ${totalItems.toLocaleString("vi-VN")} sản phẩm` : ""}`}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Previous */}
          <button
            type="button"
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

          {/* Next */}
          <button
            type="button"
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
        {totalItems !== undefined && (
          <p className="text-caption text-center">
            {totalItems.toLocaleString("vi-VN")} sản phẩm
          </p>
        )}

        {/* Loading Bar */}
        {isPending && (
          <div className="absolute inset-x-0 top-0 pointer-events-none">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-pulse" />
          </div>
        )}
      </nav>
    );
  }

  // ── Admin Variant ──
  const handlePageSizeChange = (newSize: string) => {
    router.push(createPageUrl(1, parseInt(newSize, 10)));
  };

  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap items-center justify-between gap-4 py-4">
      {/* Page Size Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Hiển thị</span>
        <Select
          value={pageSize?.toString() ?? DEFAULT_PAGE_SIZE.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-[100px] h-9" aria-label="Số dòng mỗi trang">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Page Info */}
      <div className="text-sm text-muted-foreground">
        Trang {currentPage} / {totalPages}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        {canGoPrev ? (
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href={createPageUrl(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Trang trước</span>
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Trang trước</span>
          </Button>
        )}

        {canGoNext ? (
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href={createPageUrl(currentPage + 1)}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Trang sau</span>
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Trang sau</span>
          </Button>
        )}
      </div>
    </nav>
  );
}
