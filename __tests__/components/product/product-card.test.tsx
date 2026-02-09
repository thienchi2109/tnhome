import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes, ImgHTMLAttributes } from "react";

/* eslint-disable @typescript-eslint/no-unused-vars, @next/next/no-img-element */
vi.mock("next/image", () => ({
  default: ({ fill, priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
  }) => <img {...props} alt="" />,
}));
/* eslint-enable @typescript-eslint/no-unused-vars, @next/next/no-img-element */

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { ProductCard } from "@/components/product/product-card";

describe("ProductCard", () => {
  const baseProduct = {
    id: "product-1",
    name: "Tủ giày dép 4 cánh khe 1m2",
    price: 340000,
    images: ["/products/tu-giay.jpg"],
    category: "Tủ giày dép 4 cánh khe 1m2",
  };

  it("uses a multi-line category label on small screens", () => {
    render(<ProductCard {...baseProduct} />);

    const categoryLabel = screen.getByText(baseProduct.category, { selector: "p" });

    expect(categoryLabel).toHaveClass("line-clamp-2");
    expect(categoryLabel).toHaveClass("lg:line-clamp-1");
    expect(categoryLabel).not.toHaveClass("line-clamp-1");
  });

  it("stacks category and price on mobile to reduce truncation", () => {
    render(<ProductCard {...baseProduct} />);

    const categoryLabel = screen.getByText(baseProduct.category, { selector: "p" });
    const price = screen.getByText(/340\.000/, { selector: "span" });
    const footer = categoryLabel.parentElement;

    expect(footer).not.toBeNull();
    expect(footer).toHaveClass("flex-col");
    expect(footer).toHaveClass("lg:flex-row");
    expect(price).toHaveClass("self-end");
  });
});
