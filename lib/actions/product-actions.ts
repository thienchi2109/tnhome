"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import type { PaginationParams } from "@/lib/constants";
import { toSlug } from "@/lib/utils";
import type { ActionResult, AdminProductFilterOptions, PaginatedProducts, ProductFilterOptions } from "./types";
import { requireAdmin } from "./admin-auth";
import { isUnauthorizedError } from "./errors";

// Pagination constants
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

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
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
});

const updateProductSchema = productSchema.partial().extend({
  id: z.string().cuid(),
});

// Create Product
export async function createProduct(
  formData: z.infer<typeof productSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
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
        stock: validated.stock,
        lowStockThreshold: validated.lowStockThreshold,
      },
      select: { id: true },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidateTag("categories", "default");
    revalidateTag("products", "default");

    return { success: true, data: { id: product.id } };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return { success: false, error: "Unauthorized" };
    }
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
    await requireAdmin();
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
        stock: data.stock,
        lowStockThreshold: data.lowStockThreshold,
      },
      select: { id: true },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/product/${id}`);
    revalidatePath("/");
    revalidateTag("categories", "default");
    revalidateTag("products", "default");

    return { success: true, data: { id: product.id } };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return { success: false, error: "Unauthorized" };
    }
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// Delete Product
export async function deleteProduct(id: string): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidateTag("categories", "default");
    revalidateTag("products", "default");

    return { success: true, data: null };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return { success: false, error: "Unauthorized" };
    }
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
    await requireAdmin();
    await prisma.product.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidateTag("categories", "default");
    revalidateTag("products", "default");

    return { success: true, data: null };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return { success: false, error: "Unauthorized" };
    }
    console.error("Failed to toggle product status:", error);
    return { success: false, error: "Failed to update product status" };
  }
}

// Get Products for Admin (with pagination)
export async function getProducts(
  params?: PaginationParams,
  filters?: AdminProductFilterOptions
): Promise<PaginatedProducts> {
  await requireAdmin();

  const { page: rawPage, pageSize } = params ?? {
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  const whereClause: Prisma.ProductWhereInput = {
    ...(filters?.status === "active" && { isActive: true }),
    ...(filters?.status === "inactive" && { isActive: false }),
    ...(filters?.search && {
      OR: [
        { name: { contains: filters.search, mode: "insensitive" as const } },
        { description: { contains: filters.search, mode: "insensitive" as const } },
      ],
    }),
    ...(filters?.categories && filters.categories.length > 0 && {
      category: { in: filters.categories },
    }),
  };

  const totalItems = await prisma.product.count({ where: whereClause });
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.max(1, Math.min(rawPage, totalPages));
  const skip = (page - 1) * pageSize;

  const products = await prisma.product.findMany({
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
      stock: true,
      lowStockThreshold: true,
      createdAt: true,
    },
  });

  return {
    products,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}

// Get Single Product (admin)
export async function getProduct(id: string) {
  await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      externalId: true,
      name: true,
      description: true,
      price: true,
      category: true,
      images: true,
      isActive: true,
      stock: true,
      lowStockThreshold: true,
      createdAt: true,
    },
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
      stock: true,
    },
  });

  return products;
}

// Get Active Products for Storefront (with pagination)
export async function getActiveProductsPaginated(
  params?: PaginationParams,
  filters?: string | ProductFilterOptions
): Promise<PaginatedProducts> {
  const { page: rawPage, pageSize } = params ?? {
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  const filterOptions: ProductFilterOptions =
    typeof filters === "string" ? { categories: [filters] } : filters ?? {};

  const whereClause: Prisma.ProductWhereInput = {
    isActive: true,
    ...(filterOptions.search && {
      OR: [
        { name: { contains: filterOptions.search, mode: "insensitive" as const } },
        { description: { contains: filterOptions.search, mode: "insensitive" as const } },
      ],
    }),
    ...(filterOptions.categories &&
      filterOptions.categories.length > 0 && {
        category: { in: filterOptions.categories },
      }),
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

  const totalItems = await prisma.product.count({ where: whereClause });
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.max(1, Math.min(rawPage, totalPages));
  const skip = (page - 1) * pageSize;

  const products = await prisma.product.findMany({
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
      stock: true,
      lowStockThreshold: true,
      createdAt: true,
    },
  });

  return {
    products,
    pagination: {
      page,
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
    revalidate: 3600,
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
