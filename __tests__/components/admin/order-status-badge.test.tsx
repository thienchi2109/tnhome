import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { OrderStatus } from "@/types";
import { OrderStatusBadge, getStatusLabel } from "@/components/admin/order-status-badge";

describe("OrderStatusBadge fallbacks", () => {
  it("returns raw status text when status is not in config", () => {
    expect(getStatusLabel("UNKNOWN" as OrderStatus)).toBe("UNKNOWN");
  });

  it("renders a safe fallback badge when status is not in config", () => {
    render(<OrderStatusBadge status={"UNKNOWN" as OrderStatus} />);
    expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
  });
});
