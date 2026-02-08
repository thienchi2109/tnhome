"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function OrderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");
  const routerRef = useRef(router);
  const searchParamsRef = useRef(searchParams);

  useEffect(() => {
    routerRef.current = router;
    searchParamsRef.current = searchParams;
  }, [router, searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParamsRef.current.get("search") || "";
      if (value === currentSearch) {
        return;
      }

      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      params.delete("page");

      const queryString = params.toString();
      routerRef.current.push(
        queryString ? `/admin/orders?${queryString}` : "/admin/orders"
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Tìm đơn hàng..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
