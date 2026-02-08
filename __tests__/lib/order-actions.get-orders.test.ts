import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, orderCountMock, orderFindManyMock } = vi.hoisted(
  () => ({
    requireAdminMock: vi.fn(),
    orderCountMock: vi.fn(),
    orderFindManyMock: vi.fn(),
  })
);

vi.mock("@/lib/actions/admin-auth", () => ({
  requireAdmin: requireAdminMock,
  isUnauthorizedError: vi.fn(() => false),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      count: orderCountMock,
      findMany: orderFindManyMock,
    },
  },
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({ userId: null })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { getOrders } from "@/lib/actions/order-actions";

describe("getOrders pagination", () => {
  beforeEach(() => {
    requireAdminMock.mockResolvedValue(undefined);
    orderCountMock.mockReset();
    orderFindManyMock.mockReset();
  });

  it("clamps requested page before calculating skip", async () => {
    const lastPageOrders = [
      {
        id: "ord-last",
        total: 123000,
        status: "PAID",
        shippingName: "Alice",
        shippingPhone: "0123456789",
        createdAt: new Date("2026-02-01T00:00:00.000Z"),
        _count: { items: 2 },
      },
    ];

    orderCountMock.mockResolvedValue(50); // 3 pages with pageSize=20
    orderFindManyMock.mockImplementation(async ({ skip }: { skip: number }) =>
      skip === 40 ? lastPageOrders : []
    );

    const result = await getOrders({ page: 100, pageSize: 20 });

    expect(orderFindManyMock).toHaveBeenCalledTimes(1);
    expect(orderFindManyMock.mock.calls[0][0]).toMatchObject({
      skip: 40,
      take: 20,
    });
    expect(result.pagination).toMatchObject({
      page: 3,
      pageSize: 20,
      totalItems: 50,
      totalPages: 3,
    });
    expect(result.orders).toEqual(lastPageOrders);
  });
});
