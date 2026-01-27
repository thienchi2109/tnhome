"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, toSlug } from "@/lib/utils";

interface CategoryWithSlug {
  name: string;
  slug: string;
}

interface FilterCategoryGroupProps {
  categories: string[];
  categoriesWithSlugs?: CategoryWithSlug[];
}

export function FilterCategoryGroup({
  categories,
  categoriesWithSlugs,
}: FilterCategoryGroupProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Build mappings for slug <-> name conversion
  const { nameToSlug, slugToName } = useMemo(() => {
    if (categoriesWithSlugs) {
      return {
        nameToSlug: new Map(categoriesWithSlugs.map(c => [c.name, c.slug])),
        slugToName: new Map(categoriesWithSlugs.map(c => [c.slug, c.name])),
      };
    }
    // Fallback: generate slugs from category names
    return {
      nameToSlug: new Map(categories.map(c => [c, toSlug(c)])),
      slugToName: new Map(categories.map(c => [toSlug(c), c])),
    };
  }, [categories, categoriesWithSlugs]);

  // Parse URL slugs into selected category names
  // Handle both comma-separated (?category=a,b) and repeated params (?category=a&category=b)
  const selectedSlugs = useMemo(() => {
    const allValues = searchParams.getAll("category");
    const slugs = new Set<string>();
    for (const value of allValues) {
      for (const slug of value.split(",")) {
        if (slug) slugs.add(slug);
      }
    }
    return Array.from(slugs);
  }, [searchParams]);

  const selectedCategories = selectedSlugs
    .map(slug => slugToName.get(slug) ?? slug)
    .filter(Boolean);

  const handleCategoryChange = (category: string, checked: boolean) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      const slug = nameToSlug.get(category) ?? toSlug(category);
      let newSlugs = [...selectedSlugs];

      if (checked) {
        if (!newSlugs.includes(slug)) {
          newSlugs.push(slug);
        }
      } else {
        newSlugs = newSlugs.filter((s) => s !== slug);
      }

      if (newSlugs.length > 0) {
        params.set("category", newSlugs.join(","));
      } else {
        params.delete("category");
      }

      // Reset page when filtering
      params.delete("page");

      router.push(`/products?${params.toString()}`, { scroll: false });
    });
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Danh mục
      </div>
      <ScrollArea className="h-[200px] pr-3">
        <fieldset
          className={cn(
            "space-y-3",
            "transition-opacity duration-200 motion-reduce:transition-none",
            isPending && "opacity-60 pointer-events-none"
          )}
        >
          <legend className="sr-only">Lọc theo danh mục</legend>
          {categories.map((category) => {
            const id = `category-${category.replace(/\s+/g, "-").toLowerCase()}`;
            const isSelected = selectedCategories.includes(category);

            return (
              <div
                key={category}
                className="flex items-center gap-3 min-h-[44px] group"
              >
                <Checkbox
                  id={id}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category, checked === true)
                  }
                  className="h-5 w-5 data-[state=checked]:border-accent data-[state=checked]:bg-accent"
                />
                <Label
                  htmlFor={id}
                  className={cn(
                    "text-sm font-medium cursor-pointer flex-1 py-2",
                    "transition-colors duration-200 motion-reduce:transition-none",
                    "group-hover:text-accent",
                    isSelected && "text-accent"
                  )}
                >
                  {category}
                </Label>
              </div>
            );
          })}
        </fieldset>
      </ScrollArea>
    </div>
  );
}
