"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import type { ActionResult } from "./types";
import type { OrderStatus } from "@/types";
import { requireAdmin } from "./admin-auth";
import { isUnauthorizedError } from "./errors";

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

// Valid order status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const ORDER_LIST_ORDER_BY: Prisma.OrderOrderByWithRelationInput[] = [
  { createdAt: "desc" },
  { id: "desc" },
];

function normalizePagination(params?: { page?: number; pageSize?: number }) {
  const rawPage = params?.page ?? DEFAULT_PAGE;
  const rawPageSize = params?.pageSize ?? DEFAULT_PAGE_SIZE;

  return {
    page: Math.max(1, Math.floor(rawPage)),
    pageSize: Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(rawPageSize))),
  };
}

// Find or create customer with deduplication
async function findOrCreateCustomer(
  tx: Prisma.TransactionClient,
  input: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  },
  clerkUserId: string | null
) {
  // Priority 1: Match by phone (primary identifier)
  let customer = await tx.customer.findUnique({
    where: { phone: input.phone },
  });

  if (customer) {
    return tx.customer.update({
      where: { id: customer.id },
      data: {
        name: input.name,
        email: input.email || null,
        address: input.address,
        ...(clerkUserId && !customer.userId ? { userId: clerkUserId } : {}),
      },
    });
  }

  // Priority 2: Match by userId (logged-in user with new phone)
  if (clerkUserId) {
    customer = await tx.customer.findUnique({
      where: { userId: clerkUserId },
    });

    if (customer) {
      // Check if new phone is already taken by another customer
      const phoneOwner = await tx.customer.findUnique({
        where: { phone: input.phone },
        select: { id: true },
      });
      if (phoneOwner && phoneOwner.id !== customer.id) {
        throw new Error("PHONE_CONFLICT");
      }

      return tx.customer.update({
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
  return tx.customer.create({
    data: {
      userId: clerkUserId,
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      address: input.address,
    },
  });
}

// Create Order (with stock validation)
export async function createOrder(
  input: z.infer<typeof createOrderSchema>
): Promise<ActionResult<{ orderId: string }>> {
  try {
    // 1. Validate input
    const validated = createOrderSchema.parse(input);

    // 2. Get Clerk userId (null if guest)
    const { userId: clerkUserId } = await auth();

    // 3. Run everything in an interactive transaction
    const result = await prisma.$transaction(async (tx) => {
      // Fetch products WITH stock
      const productIds = validated.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true,
        },
        select: { id: true, price: true, name: true, stock: true },
      });

      // Validate all products exist and are active
      if (products.length !== productIds.length) {
        return {
          success: false as const,
          error: "Một số sản phẩm không còn khả dụng",
        };
      }

      // Validate stock for each item
      const productMap = new Map(products.map((p) => [p.id, p]));
      for (const item of validated.items) {
        const product = productMap.get(item.productId)!;
        if (product.stock < item.quantity) {
          if (product.stock === 0) {
            return {
              success: false as const,
              error: `Sản phẩm "${product.name}" đã hết hàng`,
            };
          }
          return {
            success: false as const,
            error: `Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm`,
          };
        }
      }

      // Decrement stock atomically
      for (const item of validated.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Build order items with SERVER prices
      const orderItems = validated.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: productMap.get(item.productId)!.price,
      }));

      // Calculate total on server
      const total = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Find or create customer
      const customer = await findOrCreateCustomer(
        tx,
        {
          name: validated.customerName,
          phone: validated.customerPhone,
          email: validated.customerEmail,
          address: validated.customerAddress,
        },
        clerkUserId
      );

      // Create order with nested writes
      const order = await tx.order.create({
        data: {
          total,
          status: "PENDING",
          userId: clerkUserId,
          customerId: customer.id,
          shippingName: validated.customerName,
          shippingPhone: validated.customerPhone,
          shippingAddress: validated.customerAddress,
          notes: validated.notes || null,
          items: { create: orderItems },
        },
        select: { id: true },
      });

      return { success: true as const, data: { orderId: order.id } };
    });

    if (result.success) {
      revalidatePath("/admin/orders");
      revalidatePath("/admin");
    }

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    if (error instanceof Error && error.message === "PHONE_CONFLICT") {
      return {
        success: false,
        error: "Số điện thoại này đã được sử dụng bởi tài khoản khác",
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Foreign key constraint (product deleted during checkout)
      if (error.code === "P2003") {
        return {
          success: false,
          error: "Một sản phẩm trong giỏ hàng không còn khả dụng",
        };
      }
      // Check constraint violation (stock went negative)
      if (error.code === "P2010" || error.message.includes("23514")) {
        return {
          success: false,
          error: "Sản phẩm đã hết hàng, vui lòng thử lại",
        };
      }
    }

    // Check constraint violation at raw level
    if (error instanceof Error && error.message.includes("Product_stock_non_negative")) {
      return {
        success: false,
        error: "Sản phẩm đã hết hàng, vui lòng thử lại",
      };
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

// Get Orders for Admin (paginated)
export async function getOrders(
  params?: { page?: number; pageSize?: number },
  filters?: { status?: string; search?: string }
) {
  await requireAdmin();

  const { page: rawPage, pageSize } = normalizePagination(params);

  const where: Prisma.OrderWhereInput = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  const searchTerm = filters?.search?.trim().slice(0, 200);
  if (searchTerm) {
    where.OR = [
      { id: { contains: searchTerm, mode: "insensitive" } },
      { shippingName: { contains: searchTerm, mode: "insensitive" } },
      { shippingPhone: { contains: searchTerm } },
    ];
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const totalItems = await tx.order.count({ where });
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const page = Math.max(1, Math.min(rawPage, totalPages));
      const skip = (page - 1) * pageSize;

      const orders = await tx.order.findMany({
        where,
        orderBy: ORDER_LIST_ORDER_BY,
        skip,
        take: pageSize,
        select: {
          id: true,
          total: true,
          status: true,
          shippingName: true,
          shippingPhone: true,
          createdAt: true,
          _count: { select: { items: true } },
        },
      });

      return { orders, page, totalItems, totalPages };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead }
  );

  return {
    orders: result.orders,
    pagination: {
      page: result.page,
      pageSize,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
    },
  };
}

// Update Order Status
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();

    await prisma.$transaction(async (tx) => {
      // Lock the order row to prevent concurrent status changes
      const rows = await tx.$queryRaw<
        Array<{ id: string; status: string }>
      >`SELECT id, status FROM "Order" WHERE id = ${orderId} FOR UPDATE`;

      const order = rows[0];
      if (!order) {
        throw new Error("NOT_FOUND");
      }

      // Validate transition
      const allowedTransitions = VALID_TRANSITIONS[order.status] || [];
      if (!allowedTransitions.includes(newStatus)) {
        throw new Error(`INVALID_TRANSITION:${order.status}:${newStatus}`);
      }

      // If cancelling, restore stock
      if (newStatus === "CANCELLED") {
        const items = await tx.orderItem.findMany({
          where: { orderId },
          select: { productId: true, quantity: true },
        });
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return { success: true, data: null };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return { success: false, error: "Unauthorized" };
    }
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return { success: false, error: "Đơn hàng không tồn tại" };
      }
      if (error.message.startsWith("INVALID_TRANSITION:")) {
        const [, from, to] = error.message.split(":");
        return {
          success: false,
          error: `Không thể chuyển trạng thái từ ${from} sang ${to}`,
        };
      }
    }
    console.error("Failed to update order status:", error);
    return { success: false, error: "Không thể cập nhật trạng thái đơn hàng" };
  }
}
