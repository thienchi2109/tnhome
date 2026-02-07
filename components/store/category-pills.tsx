import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryPill {
  name: string;
  slug: string;
}

interface CategoryPillsProps {
  categories: CategoryPill[];
}

export function CategoryPills({ categories }: CategoryPillsProps) {
  return (
    <div className="px-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-visible md:pb-0">
          <Link
            href="/products"
            className={cn(
              "shrink-0 rounded-full border border-foreground bg-foreground px-4 py-2",
              "text-sm font-medium text-background",
              "transition-colors hover:bg-foreground/90"
            )}
          >
            Tất cả
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className={cn(
                "shrink-0 rounded-full border border-border px-4 py-2",
                "text-sm font-medium text-foreground",
                "transition-colors hover:bg-muted"
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
