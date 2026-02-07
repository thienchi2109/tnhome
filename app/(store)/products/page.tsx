import { Suspense } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { StorePagination } from "@/components/store/store-pagination";
import { SectionHeader } from "@/components/store/section-header";
import { ProductFilters } from "@/components/store/product-filters";
import { MobileFilterSheet } from "@/components/store/mobile-filter-sheet";
import { ActiveFilterTags } from "@/components/store/active-filter-tags";
import { FilterResultsAnnouncer } from "@/components/store/filter-results-announcer";
import {
  getActiveProductsPaginated,
  getCategoriesWithSlugs,
  getPriceRange,
} from "@/lib/actions";
import {
  parseFilterParams,
  countActiveFilters,
} from "@/lib/filter-schema";
import { STORE_PAGE_SIZE } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string | string[];
    q?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const filters = parseFilterParams(params);
  const page = filters.page;

  // Fetch categories to convert slugs to names for display
  const categoriesWithSlugs = await getCategoriesWithSlugs();
  const slugToName = new Map(categoriesWithSlugs.map(c => [c.slug, c.name]));

  // Convert slugs to names for display
  const categoryNames = filters.category
    ?.map(slug => slugToName.get(slug) ?? slug)
    ?? [];

  // Build title based on active filters
  let title = "Sản phẩm";
  if (filters.q) {
    title = `Tìm kiếm: ${filters.q}`;
  } else if (categoryNames.length === 1) {
    title = categoryNames[0];
  } else if (categoryNames.length > 1) {
    title = `${categoryNames.length} danh mục`;
  }

  if (page > 1) {
    title += ` - Trang ${page}`;
  }
  title += " | TN Home";

  // Build description
  let description = "Khám phá toàn bộ bộ sưu tập nội thất hiện đại của TN Home.";
  if (filters.q) {
    description = `Kết quả tìm kiếm cho "${filters.q}" tại TN Home.`;
  } else if (categoryNames.length > 0) {
    description = `Khám phá bộ sưu tập ${categoryNames.join(", ").toLowerCase()} của TN Home.`;
  }

  return { title, description };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  // Parse and validate filter params with Zod schema
  const filters = parseFilterParams(params);

  // Parallel fetch: categories with slugs and price range
  const [categoriesWithSlugs, priceRange] = await Promise.all([
    getCategoriesWithSlugs(),
    getPriceRange(),
  ]);

  // Build slug-to-name mapping for converting URL slugs to database names
  const slugToName = new Map(categoriesWithSlugs.map(c => [c.slug, c.name]));

  // Convert URL slugs to category names for database query
  const categoryNames = filters.category
    ?.map(slug => slugToName.get(slug))
    .filter((name): name is string => name !== undefined)
    ?? undefined;

  // If user requested categories but none matched known slugs,
  // force zero results instead of silently returning all products
  const effectiveCategories =
    filters.category && filters.category.length > 0 && categoryNames?.length === 0
      ? ["__no_match__"]
      : categoryNames;

  // Fetch products with converted category names
  const { products, pagination } = await getActiveProductsPaginated(
    { page: filters.page, pageSize: STORE_PAGE_SIZE },
    {
      search: filters.q,
      categories: effectiveCategories,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    }
  );

  // Count active filters for badge
  const activeFilterCount = countActiveFilters(filters);

  // Build page title based on filters (using display names)
  const displayCategoryNames = filters.category
    ?.map(slug => slugToName.get(slug) ?? slug)
    ?? [];

  let pageTitle = "Tất cả sản phẩm";
  let pageSubtitle = "Khám phá toàn bộ bộ sưu tập nội thất hiện đại.";

  if (filters.q) {
    pageTitle = `Kết quả tìm kiếm`;
    pageSubtitle = `Tìm kiếm: "${filters.q}"`;
  } else if (displayCategoryNames.length === 1) {
    pageTitle = displayCategoryNames[0];
    pageSubtitle = `Khám phá bộ sưu tập ${displayCategoryNames[0].toLowerCase()} của chúng tôi.`;
  } else if (displayCategoryNames.length > 1) {
    pageTitle = "Nhiều danh mục";
    pageSubtitle = `Đang xem: ${displayCategoryNames.join(", ")}`;
  }

  // Extract just names for filter components
  const categories = categoriesWithSlugs.map(c => c.name);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex gap-8">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden lg:block w-[340px] shrink-0">
          <div className="sticky top-24 border rounded-xl p-6 bg-background shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Bộ lọc</h2>
            <ProductFilters
              categories={categories}
              priceRange={priceRange}
              categoriesWithSlugs={categoriesWithSlugs}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <SectionHeader title={pageTitle} subtitle={pageSubtitle} />

          {/* Results bar with count + active tags */}
          <div className="flex flex-wrap items-center gap-4 mt-6 mb-8">
            <p className="text-sm text-muted-foreground">
              {pagination.totalItems} sản phẩm
            </p>
            <Suspense fallback={null}>
              <ActiveFilterTags categoriesWithSlugs={categoriesWithSlugs} />
            </Suspense>
          </div>

          {/* Screen reader announcement for filter results */}
          <Suspense fallback={null}>
            <FilterResultsAnnouncer totalItems={pagination.totalItems} />
          </Suspense>

          {/* Product Grid */}
          <div className="mt-8 md:mt-12">
            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  {filters.q
                    ? `Không tìm thấy kết quả cho "${filters.q}"`
                    : "Không tìm thấy sản phẩm nào phù hợp."}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {filters.q
                    ? "Thử từ khóa khác hoặc xóa bộ lọc để xem thêm sản phẩm."
                    : "Thử điều chỉnh bộ lọc hoặc xóa bộ lọc để xem thêm sản phẩm."}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <StorePagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
            />
          )}
        </div>
      </div>

      {/* Mobile Filter Sheet - visible only on mobile */}
      <div className="lg:hidden">
        <Suspense fallback={null}>
          <MobileFilterSheet
            categories={categories}
            priceRange={priceRange}
            activeFilterCount={activeFilterCount}
            categoriesWithSlugs={categoriesWithSlugs}
          />
        </Suspense>
      </div>
    </div>
  );
}
