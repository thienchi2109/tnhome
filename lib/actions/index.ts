// Barrel re-export for backward compatibility
// All existing imports from "@/lib/actions" continue to work
// NOTE: No "use server" here — each sub-module already has its own directive

export {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProducts,
  getProduct,
  getActiveProductById,
  getActiveProducts,
  getActiveProductsPaginated,
  getCategories,
  getAllCategories,
  getCategoriesWithSlugs,
  getPriceRange,
} from "./product-actions";

export {
  createOrder,
  getOrder,
  getCustomerByAuth,
  getOrders,
  updateOrderStatus,
} from "./order-actions";

export { bulkUpsertProducts } from "./import-actions";

export type { PaginatedProducts, ProductFilterOptions, ActionResult } from "./types";
