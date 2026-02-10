import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, productFindFirstMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  productFindFirstMock: vi.fn(),
}));

vi.mock("@/lib/actions/admin-auth", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("@/lib/actions/errors", () => ({
  isUnauthorizedError: vi.fn(() => false),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findFirst: productFindFirstMock,
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));

import { getActiveProductById } from "@/lib/actions/product-actions";

describe("getActiveProductById", () => {
  beforeEach(() => {
    requireAdminMock.mockReset();
    productFindFirstMock.mockReset();
  });

  it("returns an active product without requiring admin auth", async () => {
    const activeProduct = {
      id: "prod_1",
      externalId: "ext_1",
      name: "Ghế Sofa",
      description: "Mềm và êm",
      price: 1200000,
      category: "Phòng khách",
      images: ["https://example.com/sofa.jpg"],
      isActive: true,
      stock: 8,
      lowStockThreshold: 2,
      createdAt: new Date("2026-02-09T00:00:00.000Z"),
    };
    productFindFirstMock.mockResolvedValue(activeProduct);

    const result = await getActiveProductById("prod_1");

    expect(requireAdminMock).not.toHaveBeenCalled();
    expect(productFindFirstMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "prod_1",
          isActive: true,
        },
      })
    );
    expect(result).toEqual(activeProduct);
  });
});
