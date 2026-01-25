"use client";

import { Search, Loader2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition, useRef, KeyboardEvent, FormEvent } from "react";
import { cn } from "@/lib/utils";

interface HeaderSearchInputProps {
  variant: "desktop" | "mobile";
  autoFocus?: boolean;
  onSearchSubmit?: () => void;
  placeholder?: string;
}

export function HeaderSearchInput({
  variant,
  autoFocus = false,
  onSearchSubmit,
  placeholder = "Nhập từ khóa...",
}: HeaderSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const inputId = variant === "desktop" ? "desktop-search" : "mobile-search";
  const isOnProductsPage = pathname === "/products";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    performSearch();
  };

  const performSearch = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      const trimmedValue = value.trim();
      if (trimmedValue) {
        params.set("q", trimmedValue);
      } else {
        params.delete("q");
      }

      // Reset page when searching
      params.delete("page");

      const queryString = params.toString();
      const url = queryString ? `/products?${queryString}` : "/products";

      // Use scroll: false when already on /products page
      router.push(url, { scroll: !isOnProductsPage });

      // Clear input after navigation
      setValue("");

      // Call callback for mobile to close panel
      onSearchSubmit?.();
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setValue("");
      inputRef.current?.blur();
    }
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        "relative w-full",
        variant === "desktop" && "max-w-2xl"
      )}
    >
      <label htmlFor={inputId} className="sr-only">
        Tìm kiếm sản phẩm
      </label>
      <div
        className={cn(
          "relative",
          "transition-opacity duration-200 motion-reduce:transition-none",
          isPending && "opacity-60"
        )}
      >
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <input
          id={inputId}
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full pl-10 pr-12 py-2",
            "bg-muted rounded-full",
            "text-sm text-foreground placeholder:text-muted-foreground",
            "border-0 outline-none",
            "focus:ring-2 focus:ring-primary/20",
            "transition-all duration-200"
          )}
          aria-label="Tìm kiếm sản phẩm"
        />
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2",
            "h-8 w-8 rounded-full",
            "flex items-center justify-center",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label="Tìm kiếm"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  );
}
