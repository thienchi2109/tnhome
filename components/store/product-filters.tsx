"use client";

import { Separator } from "@/components/ui/separator";
import { FilterSearchInput } from "./filter-search-input";
import { FilterPriceRange } from "./filter-price-range";
import { FilterCategoryGroup } from "./filter-category-group";

interface CategoryWithSlug {
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: string[];
  priceRange: { min: number; max: number };
  categoriesWithSlugs?: CategoryWithSlug[];
}

export function ProductFilters({
  categories,
  priceRange,
  categoriesWithSlugs,
}: ProductFiltersProps) {
  return (
    <nav aria-label="Bộ lọc sản phẩm" className="space-y-6">
      {/* Search Section */}
      <FilterSearchInput />

      <Separator />

      {/* Price Range Section */}
      <FilterPriceRange min={priceRange.min} max={priceRange.max} />

      <Separator />

      {/* Category Section */}
      <FilterCategoryGroup
        categories={categories}
        categoriesWithSlugs={categoriesWithSlugs}
      />
    </nav>
  );
}
