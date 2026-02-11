// Shared types for server actions
// NOTE: This file should NOT have "use server" — it only exports types/interfaces

import type { PaginationParams } from "@/lib/constants";

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

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
    stock: number;
    lowStockThreshold: number;
    createdAt: Date;
  }>;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ProductFilterOptions {
  search?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface AdminProductFilterOptions {
  search?: string;
  categories?: string[];
  status?: "active" | "inactive";
}

export type { PaginationParams };
