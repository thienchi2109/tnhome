import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cart";

const { useAuthMock, toastInfoMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  toastInfoMock: vi.fn(),
}));

vi.mock("@/lib/supabase/auth-context", () => ({
  useAuth: useAuthMock,
}));

vi.mock("sonner", () => ({
  toast: {
    info: toastInfoMock,
  },
}));

/* eslint-disable @typescript-eslint/no-unused-vars, @next/next/no-img-element */
vi.mock("next/image", () => ({
  default: ({ fill, priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
  }) => <img {...props} alt="" />,
}));
/* eslint-enable @typescript-eslint/no-unused-vars, @next/next/no-img-element */

import { ProductDetailClient } from "@/components/product/product-detail-client";

const product: Product = {
  id: "prod_1",
  externalId: "ext_1",
  name: "Ghế Sofa",
  description: "Sofa phòng khách",
  price: 1200000,
  images: ["/test.jpg"],
  category: "Phòng khách",
  isActive: true,
  stock: 10,
  lowStockThreshold: 2,
};

describe("ProductDetailClient auth add-to-cart flow", () => {
  const signOutMock = vi.fn();

  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
    useAuthMock.mockReset();
    toastInfoMock.mockReset();
    signOutMock.mockReset();
  });

  it("shows a login prompt and does not add to cart for guests", () => {
    useAuthMock.mockReturnValue({
      user: null,
      isLoading: false,
      signOut: signOutMock,
    });

    render(<ProductDetailClient product={product} />);

    fireEvent.click(screen.getByRole("button", { name: "Thêm vào giỏ" }));

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(toastInfoMock).toHaveBeenCalledTimes(1);
    expect(String(toastInfoMock.mock.calls[0][0]).toLowerCase()).toContain("đăng nhập");
  });

  it("adds to cart when the customer is signed in", () => {
    useAuthMock.mockReturnValue({
      user: { id: "user_123" },
      isLoading: false,
      signOut: signOutMock,
    });

    render(<ProductDetailClient product={product} />);

    fireEvent.click(screen.getByRole("button", { name: "Thêm vào giỏ" }));

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(toastInfoMock).not.toHaveBeenCalled();
  });
});
