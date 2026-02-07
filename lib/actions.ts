"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import type { PaginationParams } from "@/lib/constants";
import { unstable_cache } from "next/cache";
import { toSlug } from "@/lib/utils";
import { parseProductImportSheet } from "@/lib/import-products";

// Admin email configuration
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

// Import limits
const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // 5MB

// Validation schemas
const productSchema = z.object({
  externalId: z.preprocess((value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    }
    return value;
  }, z.string().min(1).max(64).optional()),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  price: z.number().int().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  isActive: z.boolean().default(true),
});

const updateProductSchema = productSchema.partial().extend({
  id: z.string().cuid(),
});

// Order validation schema
const orderItemSchema = z.object({
  productId: z.string().cuid("ID sản phẩm không hợp lệ"),
  quantity: z.number().int().min(1, "Số lượng phải ít nhất 1").max(99),
});

const createOrderSchema = z.object({
  customerName: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được quá 100 ký tự"),
  customerPhone: z
    .string()
    .regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
  customerEmail: z
    .string()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("")),
  customerAddress: z
    .string()
    .min(10, "Địa chỉ phải có ít nhất 10 ký tự")
    .max(500, "Địa chỉ không được quá 500 ký tự"),
  notes: z.string().max(500).optional(),
  items: z.array(orderItemSchema).min(1, "Giỏ hàng không được trống"),
});

// Types (internal - not exported from "use server" file)
type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// Pagination types
export interface PaginatedProducts {
  products: Array<{
    id: string;
    externalId: string;
    name: string;
    description: string | null;
    price: number;
    category: string;
    images: string[];
    isActive: boolean;
    createdAt: Date;
  }>;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Filter options for product queries
export interface ProductFilterOptions {
  search?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
}

// Pagination constants (internal - not exported)
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

// Create Product
export async function createProduct(
  formData: z.infer<typeof productSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = productSchema.parse(formData);
    const externalId = validated.externalId ?? crypto.randomUUID();

    const product = await prisma.product.create({
      data: {
        externalId,
        name: validated.name,
        description: validated.description || null,
        price: validated.price,
        category: validated.category,
        images: validated.images,
        isActive: validated.isActive,
      },
      select: { id: true },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    // Invalidate cached data: new category may appear, price range may change
    revalidateTag("categories", "default");
    revalidateTag("products", "default");

    return { success: true, data: { id: product.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

// Update Product
export async function updateProduct(
  formData: z.infer<typeof updateProductSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = updateProductSchema.parse(formData);
    const { id, ...data } = validated;

    const product = await prisma.product.update({
      where: { id },
      data: {
        externalId: data.externalId,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        images: data.images,
        isActive: data.isActive,
      },
      select: { id: true },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/product/${id}`);
    revalidatePath("/");
    // Invalidate cached data: category or price may have changed
    revalidateTag("categories", "default");
    revalidateTag("products", "default");

    return { success: true, data: { id: product.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// Delete Product (soft delete by setting isActive to false)
export async function deleteProduct(id: string): Promise<ActionResult<null>> {
  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    // Invalidate cached data: category may become empty, price range may change
    revalidateTag("categories", "default");
    revalidateTag("products", "default");

    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

// Toggle Product Active Status
export async function toggleProductStatus(
  id: string,
  isActive: boolean
): Promise<ActionResult<null>> {
  try {
    await prisma.product.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    // Invalidate cached data: active category list and price range may change
    revalidateTag("categories", "default");
    revalidateTag("products", "default");

    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to toggle product status:", error);
    return { success: false, error: "Failed to update product status" };
  }
}

// Get Products for Admin (with pagination)
export async function getProducts(
  params?: PaginationParams
): Promise<PaginatedProducts> {
  const { page, pageSize } = params ?? {
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  // Calculate offset (skip)
  const skip = (page - 1) * pageSize;

  // Execute count and findMany in parallel (async-parallel best practice)
  const [totalItems, products] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        externalId: true,
        name: true,
        description: true,
        price: true,
        category: true,
        images: true,
        isActive: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Clamp page to valid range
  const validPage = Math.min(page, totalPages);

  return {
    products,
    pagination: {
      page: validPage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}

// Get Single Product
export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  return product;
}

// Get Active Products for Storefront
export async function getActiveProducts(category?: string) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category && { category }),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      price: true,
      category: true,
      images: true,
    },
  });

  return products;
}

// Get Active Products for Storefront (with pagination)
export async function getActiveProductsPaginated(
  params?: PaginationParams,
  filters?: string | ProductFilterOptions
): Promise<PaginatedProducts> {
  const { page, pageSize } = params ?? {
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  const skip = (page - 1) * pageSize;

  // Handle backwards compatibility: string = single category
  const filterOptions: ProductFilterOptions =
    typeof filters === "string" ? { categories: [filters] } : filters ?? {};

  const whereClause: Prisma.ProductWhereInput = {
    isActive: true,
    // Text search on name and description using contains (case-insensitive)
    ...(filterOptions.search && {
      OR: [
        { name: { contains: filterOptions.search, mode: "insensitive" as const } },
        { description: { contains: filterOptions.search, mode: "insensitive" as const } },
      ],
    }),
    // Category filter (multiple via IN)
    ...(filterOptions.categories &&
      filterOptions.categories.length > 0 && {
        category: { in: filterOptions.categories },
      }),
    // Price range
    ...((filterOptions.minPrice !== undefined ||
      filterOptions.maxPrice !== undefined) && {
      price: {
        ...(filterOptions.minPrice !== undefined && {
          gte: filterOptions.minPrice,
        }),
        ...(filterOptions.maxPrice !== undefined && {
          lte: filterOptions.maxPrice,
        }),
      },
    }),
  };

  // Execute count and findMany in parallel (async-parallel best practice)
  const [totalItems, products] = await Promise.all([
    prisma.product.count({ where: whereClause }),
    prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        externalId: true,
        name: true,
        description: true,
        price: true,
        category: true,
        images: true,
        isActive: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(page, totalPages);

  return {
    products,
    pagination: {
      page: validPage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}

// Get Categories
export const getCategories = unstable_cache(
  async () => {
    const categories = await prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
    });

    return categories.map((c) => c.category);
  },
  ["categories"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["categories"],
  }
);

// Get All Categories (for admin - includes categories from inactive products)
export async function getAllCategories(): Promise<string[]> {
  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return categories.map((c) => c.category);
}

// Get Categories with Slugs (for dynamic navigation)
export const getCategoriesWithSlugs = unstable_cache(
  async () => {
    const names = await prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
    });

    return names.map((c) => ({
      name: c.category,
      slug: toSlug(c.category),
    }));
  },
  ["categories-with-slugs"],
  {
    revalidate: 3600,
    tags: ["categories"],
  }
);

// Get Price Range for Filter Slider (cached)
export const getPriceRange = unstable_cache(
  async () => {
    const result = await prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true },
      where: { isActive: true },
    });

    return {
      min: result._min.price ?? 0,
      max: result._max.price ?? 10_000_000,
    };
  },
  ["product-price-range"],
  { revalidate: 300, tags: ["products"] }
);

// ============================================
// Order Actions
// ============================================

// Find or create customer with deduplication
async function findOrCreateCustomer(
  input: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  },
  clerkUserId: string | null
) {
  // Priority 1: Match by phone (primary identifier)
  let customer = await prisma.customer.findUnique({
    where: { phone: input.phone },
  });

  if (customer) {
    // Found by phone - update info and link userId if logged in
    return prisma.customer.update({
      where: { id: customer.id },
      data: {
        name: input.name,
        email: input.email || null,
        address: input.address,
        // Link Clerk account if logged in and not already linked
        ...(clerkUserId && !customer.userId ? { userId: clerkUserId } : {}),
      },
    });
  }

  // Priority 2: Match by userId (logged-in user with new phone)
  if (clerkUserId) {
    customer = await prisma.customer.findUnique({
      where: { userId: clerkUserId },
    });

    if (customer) {
      // User changed phone - update their record
      return prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: input.name,
          phone: input.phone,
          email: input.email || null,
          address: input.address,
        },
      });
    }
  }

  // No match - create new customer
  return prisma.customer.create({
    data: {
      userId: clerkUserId,
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      address: input.address,
    },
  });
}

// Create Order
export async function createOrder(
  input: z.infer<typeof createOrderSchema>
): Promise<ActionResult<{ orderId: string }>> {
  try {
    // 1. Validate input
    const validated = createOrderSchema.parse(input);

    // 2. Get Clerk userId (null if guest)
    const { userId: clerkUserId } = await auth();

    // 3. Fetch products with server-side prices (security)
    const productIds = validated.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      select: { id: true, price: true, name: true },
    });

    // 4. Validate all products exist and are active
    if (products.length !== productIds.length) {
      return {
        success: false,
        error: `Một số sản phẩm không còn khả dụng`,
      };
    }

    // 5. Build order items with SERVER prices (prevent tampering)
    const productMap = new Map(products.map((p) => [p.id, p.price]));
    const orderItems = validated.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: productMap.get(item.productId)!,
    }));

    // 6. Calculate total on server
    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 7. Find or create customer with deduplication
    const customer = await findOrCreateCustomer(
      {
        name: validated.customerName,
        phone: validated.customerPhone,
        email: validated.customerEmail,
        address: validated.customerAddress,
      },
      clerkUserId
    );

    // 8. Create order with nested writes (atomic)
    const order = await prisma.order.create({
      data: {
        total,
        status: "PENDING",
        userId: clerkUserId,
        customerId: customer.id,
        // Snapshot fields for historical accuracy
        shippingName: validated.customerName,
        shippingPhone: validated.customerPhone,
        shippingAddress: validated.customerAddress,
        notes: validated.notes || null,
        items: { create: orderItems },
      },
      select: { id: true },
    });

    revalidatePath("/admin/orders");

    return { success: true, data: { orderId: order.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Foreign key constraint (product deleted during checkout)
      if (error.code === "P2003") {
        return {
          success: false,
          error: "Một sản phẩm trong giỏ hàng không còn khả dụng",
        };
      }
    }

    console.error("Order creation failed:", error);
    return { success: false, error: "Không thể tạo đơn hàng. Vui lòng thử lại." };
  }
}

// Get Order by ID
export async function getOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      total: true,
      status: true,
      shippingName: true,
      shippingPhone: true,
      shippingAddress: true,
      notes: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
      },
    },
  });

  return order;
}

// Get Customer by Phone (for pre-filling checkout form)
export async function getCustomerByAuth() {
  const { userId } = await auth();
  
  if (!userId) return null;

  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      address: true,
    },
  });

  return customer;
}

// Bulk Upsert Products from Excel File
export async function bulkUpsertProducts(
  formData: FormData
): Promise<ActionResult<{ created: number; updated: number; errors: Array<{ row: number; messages: string[] }> }>> {
  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Verify admin authorization
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userEmail =
      user.emailAddresses
        .find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress?.toLowerCase() || "";
    if (!ADMIN_EMAILS.includes(userEmail)) {
      return { success: false, error: "Unauthorized" };
    }

    // 3. Validate file exists and is a File instance
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { success: false, error: "File is required" };
    }

    // 4. Check file size
    if (file.size > MAX_IMPORT_BYTES) {
      return { success: false, error: "File too large (max 5MB)" };
    }

    // 5. Check file extension
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return { success: false, error: "Only .xlsx files are supported" };
    }

    // 6. Parse the Excel file
    const buffer = await file.arrayBuffer();
    const { rows, errors } = await parseProductImportSheet(buffer);

    // 7. If no valid rows, return first error message
    if (rows.length === 0) {
      return {
        success: false,
        error: errors[0]?.messages[0] || "No valid rows to import",
      };
    }

    // 8. Query existing products by externalId to determine creates vs updates
    const externalIds = rows.map((row) => row.externalId);
    const existing = await prisma.product.findMany({
      where: { externalId: { in: externalIds } },
      select: { externalId: true },
    });
    const existingSet = new Set(existing.map((row) => row.externalId));

    // 9. Execute upserts in a transaction
    await prisma.$transaction(
      rows.map((row) =>
        prisma.product.upsert({
          where: { externalId: row.externalId },
          create: {
            externalId: row.externalId,
            name: row.name,
            description: row.description ?? null,
            price: row.price,
            category: row.category,
            images: row.images,
            isActive: row.isActive,
          },
          update: {
            name: row.name,
            description: row.description ?? null,
            price: row.price,
            category: row.category,
            images: row.images,
            isActive: row.isActive,
          },
        })
      )
    );

    // 10. Calculate created vs updated counts
    const created = rows.filter((row) => !existingSet.has(row.externalId)).length;
    const updated = rows.length - created;

    // 11. Revalidate paths and tags
    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidateTag("categories", "default");
    revalidateTag("products", "default");

    return { success: true, data: { created, updated, errors } };
  } catch (error) {
    console.error("Bulk import failed:", error);
    return { success: false, error: "Bulk import failed" };
  }
}
