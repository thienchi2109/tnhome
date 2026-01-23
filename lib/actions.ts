"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

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

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

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
      description: true,
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
  input: CreateOrderInput
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
