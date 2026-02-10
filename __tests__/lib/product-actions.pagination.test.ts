import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminMock,
  productCountMock,
  productFindManyMock,
  transactionMock,
} = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  productCountMock: vi.fn(),
  productFindManyMock: vi.fn(),
  transactionMock: vi.fn(),
}));

vi.mock("@/lib/actions/admin-auth", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("@/lib/actions/errors", () => ({
  isUnauthorizedError: vi.fn(() => false),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transactionMock,
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));

import { getActiveProductsPaginated, getProducts } from "@/lib/actions/product-actions";

describe("product pagination query consistency", () => {
  beforeEach(() => {
    requireAdminMock.mockResolvedValue(undefined);
    productCountMock.mockReset();
    productFindManyMock.mockReset();
    transactionMock.mockReset();
    transactionMock.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        product: {
          count: productCountMock,
          findMany: productFindManyMock,
        },
      })
    );
  });

  it("uses a transaction and stable ordering for admin filtered products", async () => {
    const lastPageProducts = [
      {
        id: "prod-last",
        externalId: "ext-last",
        name: "Last Product",
        description: null,
        price: 100000,
        category: "Decor",
        images: ["https://example.com/p.jpg"],
        isActive: true,
        stock: 5,
        lowStockThreshold: 2,
        createdAt: new Date("2026-02-01T00:00:00.000Z"),
      },
    ];

    productCountMock.mockResolvedValue(50);
    productFindManyMock.mockResolvedValue(lastPageProducts);

    const result = await getProducts(
      { page: 100, pageSize: 20 },
      {
        status: "active",
        search: "last",
        categories: ["Decor"],
      }
    );

    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(transactionMock.mock.calls[0][1]).toMatchObject({
      isolationLevel: "RepeatableRead",
    });
    expect(productFindManyMock.mock.calls[0][0]).toMatchObject({
      skip: 40,
      take: 20,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    expect(result.pagination).toMatchObject({
      page: 3,
      pageSize: 20,
      totalItems: 50,
      totalPages: 3,
    });
    expect(result.products).toEqual(lastPageProducts);
  });

  it("uses a transaction for storefront filtering with price and category constraints", async () => {
    productCountMock.mockResolvedValue(21);
    productFindManyMock.mockResolvedValue([]);

    await getActiveProductsPaginated(
      { page: 2, pageSize: 20 },
      {
        search: "chair",
        categories: ["Living Room"],
        minPrice: 100000,
        maxPrice: 500000,
      }
    );

    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(transactionMock.mock.calls[0][1]).toMatchObject({
      isolationLevel: "RepeatableRead",
    });
    expect(productCountMock.mock.calls[0][0]).toMatchObject({
      where: {
        isActive: true,
        OR: [
          { name: { contains: "chair", mode: "insensitive" } },
          { description: { contains: "chair", mode: "insensitive" } },
        ],
        category: { in: ["Living Room"] },
        price: { gte: 100000, lte: 500000 },
      },
    });
    expect(productFindManyMock.mock.calls[0][0]).toMatchObject({
      skip: 20,
      take: 20,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  });
});
