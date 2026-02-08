import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Chờ xử lý",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-0",
  },
  PAID: {
    label: "Đã thanh toán",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-0",
  },
  SHIPPED: {
    label: "Đang giao",
    className: "bg-purple-100 text-purple-800 hover:bg-purple-100 border-0",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-green-100 text-green-800 hover:bg-green-100 border-0",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-red-100 text-red-800 hover:bg-red-100 border-0",
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}

export function getStatusLabel(status: OrderStatus): string {
  return STATUS_CONFIG[status].label;
}
