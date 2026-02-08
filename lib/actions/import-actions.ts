"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin, isUnauthorizedError } from "./admin-auth";
import { parseProductImportSheet } from "@/lib/import-products";
import type { ActionResult } from "./types";

// Import limits
const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // 5MB

// Bulk Upsert Products from Excel File
export async function bulkUpsertProducts(
  formData: FormData
): Promise<ActionResult<{ created: number; updated: number; errors: Array<{ row: number; messages: string[] }> }>> {
  try {
    // 1. Check admin authorization
    await requireAdmin();

    // 2. Validate file exists and is a File instance
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { success: false, error: "File is required" };
    }

    // 3. Check file size
    if (file.size > MAX_IMPORT_BYTES) {
      return { success: false, error: "File too large (max 5MB)" };
    }

    // 4. Check file extension
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return { success: false, error: "Only .xlsx files are supported" };
    }

    // 5. Parse the Excel file
    const buffer = await file.arrayBuffer();
    const { rows, errors } = await parseProductImportSheet(buffer);

    // 6. If no valid rows, return first error message
    if (rows.length === 0) {
      return {
        success: false,
        error: errors[0]?.messages[0] || "No valid rows to import",
      };
    }

    // 7. Query existing products by externalId to determine creates vs updates
    const externalIds = rows.map((row) => row.externalId);
    const existing = await prisma.product.findMany({
      where: { externalId: { in: externalIds } },
      select: { externalId: true },
    });
    const existingSet = new Set(existing.map((row) => row.externalId));

    // 8. Execute upserts in a transaction
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
            stock: row.stock,
            lowStockThreshold: row.lowStockThreshold,
          },
          update: {
            name: row.name,
            description: row.description ?? null,
            price: row.price,
            category: row.category,
            images: row.images,
            isActive: row.isActive,
            stock: row.stock,
            lowStockThreshold: row.lowStockThreshold,
          },
        })
      )
    );

    // 9. Calculate created vs updated counts
    const created = rows.filter((row) => !existingSet.has(row.externalId)).length;
    const updated = rows.length - created;

    // 10. Revalidate paths and tags
    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidateTag("categories", "default");
    revalidateTag("products", "default");

    return { success: true, data: { created, updated, errors } };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return { success: false, error: "Unauthorized" };
    }
    console.error("Bulk import failed:", error);
    return { success: false, error: "Bulk import failed" };
  }
}
