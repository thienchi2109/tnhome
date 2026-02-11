import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  transactionMock,
  createClientMock,
  getUserMock,
  revalidatePathMock,
  productFindManyMock,
  productUpdateMock,
  customerFindUniqueMock,
  customerUpdateMock,
  customerCreateMock,
  orderCreateMock,
} = vi.hoisted(() => ({
  transactionMock: vi.fn(),
  createClientMock: vi.fn(),
  getUserMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  productFindManyMock: vi.fn(),
  productUpdateMock: vi.fn(),
  customerFindUniqueMock: vi.fn(),
  customerUpdateMock: vi.fn(),
  customerCreateMock: vi.fn(),
  orderCreateMock: vi.fn(),
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
  revalidatePath: revalidatePathMock,
}));

import { createOrder } from "@/lib/actions/order-actions";

const validInput = {
  customerName: "Nguyen Van A",
  customerPhone: "0912345678",
  customerEmail: "a@example.com",
  customerAddress: "123 Nguyen Trai, Quan 1, Ho Chi Minh",
  notes: "",
  items: [{ productId: "ckh4h6x9p0000qzrmn831i7rn", quantity: 1 }],
};

function buildCustomer(userId: string | null) {
  return {
    id: "cust_1",
    userId,
    name: "Existing Customer",
    phone: validInput.customerPhone,
    email: "old@example.com",
    address: "Old Address",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function setupPhoneMatchedCustomer(existingUserId: string | null, authUserId: string) {
  getUserMock.mockResolvedValue({
    data: {
      user: {
        id: authUserId,
      },
    },
  });

  customerFindUniqueMock.mockImplementation(async ({ where }: { where: { phone?: string; userId?: string } }) => {
    if (where.phone) {
      return buildCustomer(existingUserId);
    }
    return null;
  });
}

describe("createOrder customer relinking", () => {
  beforeEach(() => {
    transactionMock.mockReset();
    createClientMock.mockReset();
    getUserMock.mockReset();
    revalidatePathMock.mockReset();
    productFindManyMock.mockReset();
    productUpdateMock.mockReset();
    customerFindUniqueMock.mockReset();
    customerUpdateMock.mockReset();
    customerCreateMock.mockReset();
    orderCreateMock.mockReset();

    createClientMock.mockResolvedValue({
      auth: {
        getUser: getUserMock,
      },
    });

    productFindManyMock.mockResolvedValue([
      {
        id: "ckh4h6x9p0000qzrmn831i7rn",
        price: 1200000,
        name: "Sofa",
        stock: 10,
      },
    ]);
    productUpdateMock.mockResolvedValue({});
    customerUpdateMock.mockResolvedValue({ id: "cust_1" });
    customerCreateMock.mockResolvedValue({ id: "cust_1" });
    orderCreateMock.mockResolvedValue({ id: "ord_1" });

    transactionMock.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        product: {
          findMany: productFindManyMock,
          update: productUpdateMock,
        },
        customer: {
          findUnique: customerFindUniqueMock,
          update: customerUpdateMock,
          create: customerCreateMock,
        },
        order: {
          create: orderCreateMock,
        },
      })
    );
  });

  it("links customer when existing userId is null", async () => {
    setupPhoneMatchedCustomer(null, "00000000-0000-4000-8000-000000000001");

    const result = await createOrder(validInput);

    expect(result.success).toBe(true);
    expect(customerUpdateMock.mock.calls[0][0].data.userId).toBe(
      "00000000-0000-4000-8000-000000000001"
    );
  });

  it("relinks customer when existing userId is a legacy Clerk id", async () => {
    setupPhoneMatchedCustomer("user_legacy123", "00000000-0000-4000-8000-000000000002");

    const result = await createOrder(validInput);

    expect(result.success).toBe(true);
    expect(customerUpdateMock.mock.calls[0][0].data.userId).toBe(
      "00000000-0000-4000-8000-000000000002"
    );
  });

  it("does not overwrite when customer is already linked to the same Supabase id", async () => {
    setupPhoneMatchedCustomer(
      "00000000-0000-4000-8000-000000000003",
      "00000000-0000-4000-8000-000000000003"
    );

    const result = await createOrder(validInput);

    expect(result.success).toBe(true);
    expect(customerUpdateMock.mock.calls[0][0].data).not.toHaveProperty("userId");
  });

  it("does not overwrite when customer is linked to a different Supabase id", async () => {
    setupPhoneMatchedCustomer(
      "00000000-0000-4000-8000-000000000004",
      "00000000-0000-4000-8000-000000000005"
    );

    const result = await createOrder(validInput);

    expect(result.success).toBe(true);
    expect(customerUpdateMock.mock.calls[0][0].data).not.toHaveProperty("userId");
  });
});
