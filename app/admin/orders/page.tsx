import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { OrderList } from "@/components/admin/order-list";
import { OrderSearch } from "@/components/admin/order-search";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "SHIPPED", label: "Đang giao" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const currentStatus = params.status || "";

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader
        title="Đơn hàng"
        description="Quản lý đơn hàng của cửa hàng"
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((filter) => {
              const isActive = currentStatus === filter.value;
              const linkParams = new URLSearchParams(params as Record<string, string>);
              if (filter.value) {
                linkParams.set("status", filter.value);
              } else {
                linkParams.delete("status");
              }
              linkParams.delete("page");
              const qs = linkParams.toString();
              const href = qs ? `/admin/orders?${qs}` : "/admin/orders";

              return (
                <Link
                  key={filter.value}
                  href={href}
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>

          <Suspense fallback={null}>
            <OrderSearch />
          </Suspense>
        </div>

        {/* Order List */}
        <Suspense fallback={null}>
          <OrderList />
        </Suspense>
      </main>
    </div>
  );
}
