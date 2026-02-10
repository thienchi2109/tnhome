"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderActions } from "./order-actions";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderStatus } from "@/types";

interface OrderItem {
  id: string;
  total: number;
  status: OrderStatus;
  shippingName: string;
  shippingPhone: string;
  createdAt: string;
  _count: { items: number };
}

interface OrdersResponse {
  orders: OrderItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export function OrderList() {
  const searchParams = useSearchParams();
  const rawPage = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const rawPageSize = Number(searchParams.get("pageSize") || "20");
  const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.min(Math.floor(rawPageSize), 100) : 20;
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";

  const { data, isLoading } = useQuery<OrdersResponse>({
    queryKey: ["admin-orders", { page, pageSize, status, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return <OrderListSkeleton />;
  }

  if (!data || data.orders.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 font-semibold text-foreground">
            Không có đơn hàng nào
          </h3>
          <p className="text-sm text-muted-foreground">
            {search || status
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
              : "Đơn hàng sẽ xuất hiện ở đây sau khi khách hàng đặt hàng."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-sm">
                  Đơn hàng
                </th>
                <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-sm">
                  Khách hàng
                </th>
                <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-sm hidden md:table-cell">
                  SĐT
                </th>
                <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-sm hidden md:table-cell">
                  Số lượng
                </th>
                <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-sm">
                  Tổng tiền
                </th>
                <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-sm">
                  Trạng thái
                </th>
                <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-sm">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-3 md:p-4">
                    <div>
                      <p className="font-medium text-foreground">
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString("vi-VN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="p-3 md:p-4">
                    <p className="font-medium truncate max-w-[150px]">
                      {order.shippingName}
                    </p>
                  </td>
                  <td className="p-3 md:p-4 hidden md:table-cell">
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {order.shippingPhone}
                    </p>
                  </td>
                  <td className="p-3 md:p-4 text-right hidden md:table-cell">
                    <span className="tabular-nums">{order._count.items}</span>
                  </td>
                  <td className="p-3 md:p-4 text-right">
                    <span className="font-medium tabular-nums">
                      {formatPrice(order.total)}
                    </span>
                  </td>
                  <td className="p-3 md:p-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="p-3 md:p-4 text-right">
                    <OrderActions
                      orderId={order.id}
                      currentStatus={order.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.pagination.totalPages > 1 && (
        <PaginationNav
          currentPage={data.pagination.page}
          totalPages={data.pagination.totalPages}
          variant="admin"
          pageSize={data.pagination.pageSize}
        />
      )}
    </>
  );
}

function OrderListSkeleton() {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="p-3 md:p-4">
                <Skeleton className="h-3 w-20 rounded-full" />
              </th>
              <th className="p-3 md:p-4">
                <Skeleton className="h-3 w-24 rounded-full" />
              </th>
              <th className="p-3 md:p-4 hidden md:table-cell">
                <Skeleton className="h-3 w-16 rounded-full" />
              </th>
              <th className="p-3 md:p-4 hidden md:table-cell">
                <Skeleton className="ml-auto h-3 w-14 rounded-full" />
              </th>
              <th className="p-3 md:p-4">
                <Skeleton className="ml-auto h-3 w-14 rounded-full" />
              </th>
              <th className="p-3 md:p-4">
                <Skeleton className="h-3 w-16 rounded-full" />
              </th>
              <th className="p-3 md:p-4">
                <Skeleton className="ml-auto h-3 w-14 rounded-full" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="p-3 md:p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-3 w-32 rounded-full" />
                  </div>
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-28 rounded-full md:w-40" />
                </td>
                <td className="p-3 md:p-4 hidden md:table-cell">
                  <Skeleton className="h-4 w-28 rounded-full" />
                </td>
                <td className="p-3 md:p-4 hidden md:table-cell">
                  <Skeleton className="ml-auto h-4 w-10 rounded-full" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="ml-auto h-4 w-20 rounded-full" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-7 w-24 rounded-full" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
        <Skeleton className="h-3 w-32 rounded-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="hidden h-8 w-8 rounded-md sm:block" />
        </div>
      </div>
    </div>
  );
}
