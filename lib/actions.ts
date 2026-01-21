"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Validation schemas
const productSchema = z.object({
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

// Types
type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// Create Product
export async function createProduct(
  formData: z.infer<typeof productSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = productSchema.parse(formData);

    const product = await prisma.product.create({
      data: {
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

    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to toggle product status:", error);
    return { success: false, error: "Failed to update product status" };
  }
}

// Get Products for Admin
export async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      price: true,
      category: true,
      images: true,
      isActive: true,
      createdAt: true,
    },
  });

  return products;
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

// Get Categories
export async function getCategories() {
  const categories = await prisma.product.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ["category"],
  });

  return categories.map((c) => c.category);
}
