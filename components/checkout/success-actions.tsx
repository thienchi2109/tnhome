"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, Package } from "lucide-react";

import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";

export function SuccessActions() {
  const clearCart = useCartStore((state) => state.clearCart);

  // Ensure cart is cleared on success page load
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      <Button size="lg" asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Tiếp tục mua sắm
        </Link>
      </Button>
      <Button variant="outline" size="lg" asChild>
        <Link href="/account/orders">
          <Package className="mr-2 h-4 w-4" />
          Xem đơn hàng
        </Link>
      </Button>
    </div>
  );
}
