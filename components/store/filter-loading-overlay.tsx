"use client";

import { cn } from "@/lib/utils";

interface FilterLoadingOverlayProps {
  isPending: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * A wrapper component that shows subtle loading feedback during filter transitions.
 * Applies opacity reduction and disables pointer events while loading.
 * Respects prefers-reduced-motion by disabling the pulse animation.
 */
export function FilterLoadingOverlay({
  isPending,
  children,
  className,
}: FilterLoadingOverlayProps) {
  return (
    <div
      className={cn(
        "relative transition-opacity duration-200",
        "motion-reduce:transition-none",
        isPending && "opacity-60 pointer-events-none",
        className
      )}
      aria-busy={isPending}
    >
      {children}
      {isPending && (
        <div
          className={cn(
            "absolute inset-0 bg-background/20",
            "animate-pulse motion-reduce:animate-none"
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
