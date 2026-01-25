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

/**
 * Parse URL search params into validated filter params
 */
export function parseFilterParams(
  searchParams: Record<string, string | string[] | undefined>
): ProductFilterParams {
  const result = productFilterSchema.safeParse(searchParams);
  if (result.success) {
    return result.data;
  }
  // Return defaults on validation error
  return { page: 1 };
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
