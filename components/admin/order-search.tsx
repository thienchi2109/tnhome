"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function OrderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");
  const isUserInput = useRef(false);

  useEffect(() => {
    if (!isUserInput.current) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.push(`/admin/orders?${params.toString()}`);
      isUserInput.current = false;
    }, 400);
    return () => clearTimeout(timer);
  }, [value, router, searchParams]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Tìm đơn hàng..."
        value={value}
        onChange={(e) => {
          isUserInput.current = true;
          setValue(e.target.value);
        }}
        className="pl-9"
      />
    </div>
  );
}
