import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminMock,
  orderCountMock,
  orderFindManyMock,
  transactionMock,
  getUserMock,
  createClientMock,
} = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  orderCountMock: vi.fn(),
  orderFindManyMock: vi.fn(),
  transactionMock: vi.fn(),
  getUserMock: vi.fn(async () => ({ data: { user: null } })),
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/actions/admin-auth", () => ({
  requireAdmin: requireAdminMock,
  isUnauthorizedError: vi.fn(() => false),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transactionMock,
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
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
    transactionMock.mockReset();
    getUserMock.mockReset();
    createClientMock.mockReset();
    getUserMock.mockResolvedValue({ data: { user: null } });
    createClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
    });
    transactionMock.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        order: {
          count: orderCountMock,
          findMany: orderFindManyMock,
        },
      })
    );
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

    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(transactionMock.mock.calls[0][1]).toMatchObject({
      isolationLevel: "RepeatableRead",
    });
    expect(orderFindManyMock).toHaveBeenCalledTimes(1);
    expect(orderFindManyMock.mock.calls[0][0]).toMatchObject({
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
    expect(result.orders).toEqual(lastPageOrders);
  });

  it("applies a normalized status filter when status is valid", async () => {
    orderCountMock.mockResolvedValue(0);
    orderFindManyMock.mockResolvedValue([]);

    await getOrders({ page: 1, pageSize: 20 }, { status: "paid" });

    expect(orderCountMock).toHaveBeenCalledTimes(1);
    expect(orderCountMock.mock.calls[0][0]).toMatchObject({
      where: { status: "PAID" },
    });
    expect(orderFindManyMock).toHaveBeenCalledTimes(1);
    expect(orderFindManyMock.mock.calls[0][0]).toMatchObject({
      where: { status: "PAID" },
    });
  });

  it("ignores invalid status filters", async () => {
    orderCountMock.mockResolvedValue(0);
    orderFindManyMock.mockResolvedValue([]);

    await getOrders({ page: 1, pageSize: 20 }, { status: "INVALID" });

    expect(orderCountMock).toHaveBeenCalledTimes(1);
    expect(orderCountMock.mock.calls[0][0].where).not.toHaveProperty("status");
    expect(orderFindManyMock).toHaveBeenCalledTimes(1);
    expect(orderFindManyMock.mock.calls[0][0].where).not.toHaveProperty(
      "status"
    );
  });
});
