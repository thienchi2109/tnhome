"use client";

import { Search, X, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminProductFiltersProps {
  categories: string[];
}

export function AdminProductFilters({ categories }: AdminProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current values from URL
  const urlValue = searchParams.get("q") ?? "";
  const currentCategories = searchParams.get("category")?.split(",").filter(Boolean) ?? [];
  const currentStatus = searchParams.get("status") ?? "all";

  // Local state for immediate search feedback
  const [searchValue, setSearchValue] = useState(urlValue);

  // Sync local state when URL changes externally (e.g., clear filters)
  const [prevUrlValue, setPrevUrlValue] = useState(urlValue);
  if (urlValue !== prevUrlValue) {
    setSearchValue(urlValue);
    setPrevUrlValue(urlValue);
  }

  const hasActiveFilters = searchParams.has("q") || searchParams.has("category") || searchParams.has("status");

  function updateParams(updates: Record<string, string | null>) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, val] of Object.entries(updates)) {
        if (val === null || val === "all" || val === "") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      }

      // Reset page on any filter change
      params.delete("page");

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  }

  const handleSearch = useDebouncedCallback((term: string) => {
    updateParams({ q: term.trim() || null });
  }, 400);

  const clearSearch = () => {
    setSearchValue("");
    handleSearch("");
    inputRef.current?.focus();
  };

  const clearAllFilters = () => {
    setSearchValue("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const toggleCategory = (cat: string) => {
    const next = currentCategories.includes(cat)
      ? currentCategories.filter((c) => c !== cat)
      : [...currentCategories, cat];
    updateParams({ category: next.length > 0 ? next.join(",") : null });
  };

  // Build display label for category trigger
  const categoryLabel = currentCategories.length === 0
    ? "Tất cả danh mục"
    : currentCategories.length === 1
      ? currentCategories[0]
      : `${currentCategories.length} danh mục`;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center gap-3",
        "transition-opacity duration-200 motion-reduce:transition-none",
        isPending && "opacity-60"
      )}
    >
      {/* Search Input */}
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Tìm sản phẩm..."
          className="pl-9 pr-9"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            handleSearch(e.target.value);
          }}
        />
        {searchValue && (
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

      {/* Category Multi-Select */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto gap-2 font-normal">
            {categoryLabel}
            {currentCategories.length > 1 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {currentCategories.length}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto">
          {categories.map((cat) => (
            <DropdownMenuItem
              key={cat}
              onSelect={(e) => e.preventDefault()}
              onClick={() => toggleCategory(cat)}
              className="gap-2 cursor-pointer"
            >
              <Checkbox
                checked={currentCategories.includes(cat)}
                className="pointer-events-none"
              />
              {cat}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Select */}
      <Select value={currentStatus} onValueChange={(val) => updateParams({ status: val })}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="active">Đang bán</SelectItem>
          <SelectItem value="inactive">Ngừng bán</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          <X className="h-4 w-4 mr-1" />
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
}
