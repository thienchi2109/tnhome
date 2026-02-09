// Pagination constants for the storefront
export const STORE_PAGE_SIZE = 24; // For public storefront grid (4 rows on desktop)

// Page size options for admin pagination
export const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 dòng" },
  { value: "20", label: "20 dòng" },
  { value: "50", label: "50 dòng" },
  { value: "100", label: "100 dòng" },
];

// Pagination constants
const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100; // Maximum allowed page size to prevent abuse
const ALLOWED_PAGE_SIZES = [10, 12, 20, 24, 50, 100] as const;

// Pagination types
export interface PaginationParams {
  page: number;
  pageSize: number;
}

interface NormalizePaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  minPage?: number;
  minPageSize?: number;
  maxPageSize?: number;
  allowedPageSizes?: readonly number[] | null;
}

// Helper to validate and normalize pagination params
export function normalizePaginationParams(
  page?: string | number | null,
  pageSize?: string | number | null,
  options: NormalizePaginationOptions = {}
): PaginationParams {
  const defaultPage = options.defaultPage ?? DEFAULT_PAGE;
  const defaultPageSize = options.defaultPageSize ?? DEFAULT_PAGE_SIZE;
  const minPage = options.minPage ?? 1;
  const minPageSize = options.minPageSize ?? 1;
  const maxPageSize = options.maxPageSize ?? MAX_PAGE_SIZE;
  const allowedPageSizes =
    options.allowedPageSizes === undefined
      ? (ALLOWED_PAGE_SIZES as readonly number[])
      : options.allowedPageSizes;

  // Parse and validate page
  let parsedPage =
    typeof page === "string" ? parseInt(page, 10) : (page ?? defaultPage);
  if (!Number.isFinite(parsedPage) || parsedPage < minPage) {
    parsedPage = defaultPage;
  }
  parsedPage = Math.floor(parsedPage);

  // Parse and validate pageSize
  let parsedPageSize =
    typeof pageSize === "string"
      ? parseInt(pageSize, 10)
      : (pageSize ?? defaultPageSize);
  if (!Number.isFinite(parsedPageSize)) {
    parsedPageSize = defaultPageSize;
  }
  parsedPageSize = Math.floor(parsedPageSize);

  if (parsedPageSize < minPageSize) {
    parsedPageSize = minPageSize;
  }

  // Enforce maximum page size
  if (parsedPageSize > maxPageSize) {
    parsedPageSize = maxPageSize;
  }

  if (allowedPageSizes && !allowedPageSizes.includes(parsedPageSize)) {
    parsedPageSize = defaultPageSize;
  }

  return { page: parsedPage, pageSize: parsedPageSize };
}
