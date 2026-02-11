import { z } from "zod";

/**
 * Product filter URL params schema
 * URL format: /products?q=search&category=Cat1,Cat2&minPrice=100000&maxPrice=5000000&page=1
 */
export const productFilterSchema = z
  .object({
    // Pagination (max 1000 pages to prevent abuse)
    page: z.coerce.number().int().min(1).max(1000).optional().default(1),

    // Text search (product name) - empty strings become undefined
    q: z
      .string()
      .trim()
      .max(100)
      .transform((v) => (v === "" ? undefined : v))
      .optional(),

    // Category filter (comma-separated string -> array)
    // Handles both single string and array from Next.js searchParams
    // Limited to 20 categories max to prevent abuse
    category: z.preprocess((val) => {
      if (typeof val === "string") {
        const parsed = val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 20); // Limit to 20 categories
        return parsed.length > 0 ? parsed : undefined;
      }
      if (Array.isArray(val)) {
        // Flatten: each element may be comma-separated
        const parsed = val
          .flatMap((v) => (typeof v === "string" ? v.split(",") : []))
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 20); // Limit to 20 categories
        return parsed.length > 0 ? parsed : undefined;
      }
      return undefined;
    }, z.array(z.string().min(1).max(100)).max(20).optional()),

    // Price range (VND as integers, max 1 billion VND)
    minPrice: z.coerce.number().int().nonnegative().max(1_000_000_000).optional(),
    maxPrice: z.coerce.number().int().positive().max(1_000_000_000).optional(),
  })
  .refine(
    (data) => {
      // Only validate relationship when both prices are defined
      if (data.minPrice === undefined || data.maxPrice === undefined) {
        return true;
      }
      return data.minPrice <= data.maxPrice;
    },
    { message: "minPrice must be <= maxPrice", path: ["minPrice"] }
  );

export type ProductFilterParams = z.infer<typeof productFilterSchema>;

// Individual field schemas for partial parsing
const pageSchema = z.coerce.number().int().min(1).max(1000);
const qSchema = z
  .string()
  .trim()
  .max(100)
  .transform((v) => (v === "" ? undefined : v));
const categorySchema = z.preprocess((val) => {
  if (typeof val === "string") {
    const parsed = val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
    return parsed.length > 0 ? parsed : undefined;
  }
  if (Array.isArray(val)) {
    const parsed = val
      .flatMap((v) => (typeof v === "string" ? v.split(",") : []))
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
    return parsed.length > 0 ? parsed : undefined;
  }
  return undefined;
}, z.array(z.string().min(1).max(100)).max(20));
const minPriceSchema = z.coerce.number().int().nonnegative().max(1_000_000_000);
const maxPriceSchema = z.coerce.number().int().positive().max(1_000_000_000);

/**
 * Parse URL search params into validated filter params
 * Uses partial preservation: invalid fields are ignored, valid ones are kept
 */
export function parseFilterParams(
  searchParams: Record<string, string | string[] | undefined>
): ProductFilterParams {
  const result: ProductFilterParams = { page: 1 };

  // Parse page - fallback to 1 on invalid
  const pageResult = pageSchema.safeParse(searchParams.page);
  if (pageResult.success) {
    result.page = pageResult.data;
  }

  // Parse search query
  const qResult = qSchema.safeParse(searchParams.q);
  if (qResult.success && qResult.data !== undefined) {
    result.q = qResult.data;
  }

  // Parse category
  const categoryResult = categorySchema.safeParse(searchParams.category);
  if (categoryResult.success && categoryResult.data !== undefined) {
    result.category = categoryResult.data;
  }

  // Parse price range with relationship validation
  const minResult = minPriceSchema.safeParse(searchParams.minPrice);
  const maxResult = maxPriceSchema.safeParse(searchParams.maxPrice);
  const minPrice = minResult.success ? minResult.data : undefined;
  const maxPrice = maxResult.success ? maxResult.data : undefined;

  if (minPrice !== undefined && maxPrice !== undefined) {
    // Both defined: only include if min <= max
    if (minPrice <= maxPrice) {
      result.minPrice = minPrice;
      result.maxPrice = maxPrice;
    }
    // If min > max, discard both (invalid range)
  } else {
    // Only one defined: include the valid one
    if (minPrice !== undefined) result.minPrice = minPrice;
    if (maxPrice !== undefined) result.maxPrice = maxPrice;
  }

  return result;
}

/**
 * Build URL search params string from filter params
 * Excludes default/empty values for clean URLs
 */
export function buildFilterQueryString(
  params: Partial<ProductFilterParams>
): string {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.category && params.category.length > 0) {
    searchParams.set("category", params.category.join(","));
  }

  if (params.minPrice !== undefined) {
    searchParams.set("minPrice", params.minPrice.toString());
  }

  if (params.maxPrice !== undefined) {
    searchParams.set("maxPrice", params.maxPrice.toString());
  }

  // Only include page if > 1
  if (params.page && params.page > 1) {
    searchParams.set("page", params.page.toString());
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Count active filters (for badge display)
 */
export function countActiveFilters(params: ProductFilterParams): number {
  let count = 0;
  if (params.q) count++;
  if (params.category && params.category.length > 0) count++;
  if (params.minPrice !== undefined || params.maxPrice !== undefined) count++;
  return count;
}
