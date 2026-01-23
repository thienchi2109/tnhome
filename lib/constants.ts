// Pagination constants for the storefront
export const STORE_PAGE_SIZE = 24; // For public storefront grid (4 rows on desktop)

// Pagination constants (internal)
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const ALLOWED_PAGE_SIZES = [10, 12, 20, 24, 50, 100] as const;

// Pagination types
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Helper to validate and normalize pagination params
export function normalizePaginationParams(
  page?: string | number | null,
  pageSize?: string | number | null
): PaginationParams {
  // Parse and validate page
  let parsedPage =
    typeof page === "string" ? parseInt(page, 10) : (page ?? DEFAULT_PAGE);
  if (isNaN(parsedPage) || parsedPage < 1) {
    parsedPage = DEFAULT_PAGE;
  }

  // Parse and validate pageSize
  let parsedPageSize =
    typeof pageSize === "string"
      ? parseInt(pageSize, 10)
      : (pageSize ?? DEFAULT_PAGE_SIZE);
  if (
    !ALLOWED_PAGE_SIZES.includes(
      parsedPageSize as (typeof ALLOWED_PAGE_SIZES)[number]
    )
  ) {
    parsedPageSize = DEFAULT_PAGE_SIZE;
  }

  return { page: parsedPage, pageSize: parsedPageSize };
}
