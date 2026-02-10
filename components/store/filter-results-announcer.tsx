"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

interface FilterResultsAnnouncerProps {
  totalItems: number;
}

export function FilterResultsAnnouncer({
  totalItems,
}: FilterResultsAnnouncerProps) {
  const searchParams = useSearchParams();
  const announcerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const prevParamsRef = useRef<string>("");

  useEffect(() => {
    const currentParams = searchParams.toString();

    // Skip if params haven't changed
    if (currentParams === prevParamsRef.current) {
      return;
    }
    prevParamsRef.current = currentParams;

    // Skip announcement on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Check if any filters are active
    const hasFilters =
      searchParams.has("q") ||
      searchParams.has("category") ||
      searchParams.has("minPrice") ||
      searchParams.has("maxPrice");

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!hasFilters) {
      if (announcerRef.current) {
        announcerRef.current.textContent = "";
      }
      return;
    }

    // Debounce announcement to avoid spam
    timeoutRef.current = setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = `${totalItems} sản phẩm được tìm thấy`;
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchParams, totalItems]);

  return (
    <div
      ref={announcerRef}
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
      role="status"
    />
  );
}
