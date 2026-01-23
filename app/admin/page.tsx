import { AdminHeader } from "@/components/admin/admin-header";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import {
  Package,
  PackageCheck,
  ShoppingCart,
  TrendingUp,
  Plus,
  Store,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

// Force dynamic rendering - don't prerender at build time
export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const [totalProducts, activeProducts, totalOrders, revenueData] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({
        where: { isActive: true },
      }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
    ]);

  return {
    totalProducts,
    activeProducts,
    totalOrders,
    revenue: revenueData._sum.total || 0,
  };
}

async function getRecentActivity() {
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      total: true,
      status: true,
      createdAt: true,
    },
  });

  return recentOrders;
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const recentActivity = await getRecentActivity();

  const statCards = [
    {
      title: "Tổng sản phẩm",
      value: stats.totalProducts,
      icon: Package,
      trend: null,
      color: "blue",
    },
    {
      title: "Sản phẩm đang bán",
      value: stats.activeProducts,
      icon: PackageCheck,
      trend: null,
      color: "green",
    },
    {
      title: "Tổng đơn hàng",
      value: stats.totalOrders,
      icon: ShoppingCart,
      trend: null,
      color: "purple",
    },
    {
      title: "Doanh thu",
      value: formatPrice(stats.revenue),
      icon: TrendingUp,
      trend: null,
      color: "orange",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader
        title="Tổng Quan"
        description="Chào mừng trở lại! Đây là tình hình hoạt động của cửa hàng bạn."
      />

      <main className="flex-1 p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                {/* Subtle gradient background */}
                <div
                  className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5 ${card.color === "blue"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600"
                      : card.color === "green"
                        ? "bg-gradient-to-br from-green-500 to-green-600"
                        : card.color === "purple"
                          ? "bg-gradient-to-br from-purple-500 to-purple-600"
                          : "bg-gradient-to-br from-orange-500 to-orange-600"
                    }`}
                />

                <div className="relative space-y-2">
                  {/* Icon */}
                  <div
                    className={`inline-flex rounded-xl p-2.5 ${card.color === "blue"
                        ? "bg-blue-50"
                        : card.color === "green"
                          ? "bg-green-50"
                          : card.color === "purple"
                            ? "bg-purple-50"
                            : "bg-orange-50"
                      }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${card.color === "blue"
                          ? "text-blue-600"
                          : card.color === "green"
                            ? "text-green-600"
                            : card.color === "purple"
                              ? "text-purple-600"
                              : "text-orange-600"
                        }`}
                    />
                  </div>

                  {/* Title */}
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>

                  {/* Value */}
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {typeof card.value === "number"
                      ? card.value.toLocaleString()
                      : card.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Thao tác nhanh
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/admin/products?action=new"
              className="group flex items-center gap-4 rounded-xl border bg-gradient-to-br from-blue-50 to-blue-50/50 p-4 transition-all hover:shadow-md hover:from-blue-100 hover:to-blue-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-sm transition-transform group-hover:scale-105">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Thêm sản phẩm</h3>
                <p className="text-sm text-muted-foreground">
                  Tạo một danh sách sản phẩm mới
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>

            <Link
              href="/"
              target="_blank"
              className="group flex items-center gap-4 rounded-xl border bg-gradient-to-br from-green-50 to-green-50/50 p-4 transition-all hover:shadow-md hover:from-green-100 hover:to-green-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 shadow-sm transition-transform group-hover:scale-105">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Xem cửa hàng</h3>
                <p className="text-sm text-muted-foreground">
                  Xem giao diện cửa hàng trực tuyến
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-green-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Đơn hàng gần đây
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Xem tất cả
            </Link>
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Đơn hàng #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {order.status}
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 font-semibold text-foreground">
                Chưa có đơn hàng nào
              </h3>
              <p className="text-sm text-muted-foreground">
                Đơn hàng sẽ xuất hiện ở đây sau khi khách hàng bắt đầu mua sắm.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
