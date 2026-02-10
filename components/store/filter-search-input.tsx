"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FilterSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current value from URL
  const urlValue = searchParams.get("q") ?? "";

  // Local state for immediate feedback before debounce
  const [value, setValue] = useState(urlValue);

  // Track previous URL value to sync state when URL changes externally
  const [prevUrlValue, setPrevUrlValue] = useState(urlValue);

  // Sync local state when URL changes (e.g., "Xóa Tất Cả" clicked)
  if (urlValue !== prevUrlValue) {
    setValue(urlValue);
    setPrevUrlValue(urlValue);
  }

  const handleSearch = useDebouncedCallback((term: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (term.trim()) {
        params.set("q", term.trim());
      } else {
        params.delete("q");
      }

      // Reset page when searching
      params.delete("page");

      router.push(`/products?${params.toString()}`, { scroll: false });
    });
  }, 400);

  const clearSearch = () => {
    setValue("");
    handleSearch("");
    inputRef.current?.focus();
  };

  return (
    <div role="search" className="relative">
      <label htmlFor="product-search" className="sr-only">
        Tìm kiếm sản phẩm
      </label>
      <div className={cn(
        "relative",
        "transition-opacity duration-200 motion-reduce:transition-none",
        isPending && "opacity-60"
      )}>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          id="product-search"
          ref={inputRef}
          type="search"
          placeholder="Tìm sản phẩm..."
          className="pl-9 pr-9"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            handleSearch(e.target.value);
          }}
          aria-label="Tìm kiếm sản phẩm"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full w-9 text-muted-foreground hover:text-foreground"
            onClick={clearSearch}
            aria-label="Xóa tìm kiếm"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
