import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PaginationNav } from "@/components/ui/pagination-nav";

const pushMock = vi.fn();
let mockQueryString = "";

vi.mock("next/navigation", () => ({
  usePathname: () => "/products",
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => new URLSearchParams(mockQueryString),
}));

describe("PaginationNav", () => {
  beforeEach(() => {
    pushMock.mockClear();
    mockQueryString = "";
  });

  it("navigates to first and last pages in store variant", () => {
    mockQueryString = "q=sofa&page=3";

    render(
      <PaginationNav
        currentPage={3}
        totalPages={10}
        variant="store"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Trang đầu" }));
    expect(pushMock).toHaveBeenNthCalledWith(1, "/products?q=sofa", { scroll: false });

    fireEvent.click(screen.getByRole("button", { name: "Trang cuối" }));
    expect(pushMock).toHaveBeenNthCalledWith(2, "/products?q=sofa&page=10", { scroll: false });
  });

  it("disables first/prev buttons on first page and last/next on last page", () => {
    render(
      <PaginationNav
        currentPage={1}
        totalPages={3}
        variant="store"
      />
    );

    expect(screen.getByRole("button", { name: "Trang đầu" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Trang trước" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Trang sau" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Trang cuối" })).not.toBeDisabled();
  });

  it("renders first and last controls for admin variant", () => {
    mockQueryString = "status=PAID&page=3&pageSize=20";

    render(
      <PaginationNav
        currentPage={3}
        totalPages={7}
        variant="admin"
        pageSize={20}
      />
    );

    const firstHref = screen
      .getByRole("link", { name: "Trang đầu" })
      .getAttribute("href");
    const firstUrl = new URL(firstHref ?? "", "http://localhost");
    expect(firstUrl.pathname).toBe("/products");
    expect(firstUrl.searchParams.get("status")).toBe("PAID");
    expect(firstUrl.searchParams.get("pageSize")).toBe("20");
    expect(firstUrl.searchParams.get("page")).toBeNull();

    const lastHref = screen
      .getByRole("link", { name: "Trang cuối" })
      .getAttribute("href");
    const lastUrl = new URL(lastHref ?? "", "http://localhost");
    expect(lastUrl.pathname).toBe("/products");
    expect(lastUrl.searchParams.get("status")).toBe("PAID");
    expect(lastUrl.searchParams.get("pageSize")).toBe("20");
    expect(lastUrl.searchParams.get("page")).toBe("7");
  });
});
