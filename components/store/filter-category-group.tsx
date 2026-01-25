"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FilterCategoryGroupProps {
  categories: string[];
}

export function FilterCategoryGroup({ categories }: FilterCategoryGroupProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedCategories =
    searchParams.get("category")?.split(",").filter(Boolean) || [];

  const handleCategoryChange = (category: string, checked: boolean) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      let newCategories = [...selectedCategories];

      if (checked) {
        newCategories.push(category);
      } else {
        newCategories = newCategories.filter((c) => c !== category);
      }

      if (newCategories.length > 0) {
        params.set("category", newCategories.join(","));
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
