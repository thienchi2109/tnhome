import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/actions", () => ({
  createProduct: vi.fn(async () => ({ success: true, data: { id: "prod-1" } })),
  updateProduct: vi.fn(async () => ({ success: true, data: { id: "prod-1" } })),
}));

vi.mock("@/components/admin/image-upload", () => ({
  ImageUpload: ({ onChange }: { onChange: (urls: string[]) => void }) => (
    <button
      type="button"
      data-testid="image-upload"
      onClick={() => onChange(["https://example.com/image.jpg"])}
    >
      Add Image
    </button>
  ),
}));

vi.mock("@/components/admin/category-combobox", () => ({
  CategoryCombobox: ({ onChange }: { onChange: (value: string) => void }) => (
    <button
      type="button"
      data-testid="category-combobox"
      onClick={() => onChange("Decor")}
    >
      Set Category
    </button>
  ),
}));

import { createProduct } from "@/lib/actions";
import { ProductForm } from "@/components/admin/product-form";

describe("ProductForm externalId", () => {
  it("allows blank externalId so createProduct can auto-generate", async () => {
    const createProductMock = vi.mocked(createProduct);

    render(<ProductForm categories={["Decor"]} />);

    fireEvent.click(screen.getByTestId("image-upload"));
    fireEvent.click(screen.getByTestId("category-combobox"));

    fireEvent.change(screen.getByLabelText("Tên sản phẩm"), {
      target: { value: "Binh gom" },
    });

    fireEvent.change(screen.getByLabelText("Giá (VND)"), {
      target: { value: "100000" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Tạo sản phẩm" }));

    await waitFor(() => {
      expect(createProductMock).toHaveBeenCalledTimes(1);
    });

    expect(createProductMock.mock.calls[0][0].externalId).toBeUndefined();
  });
});
