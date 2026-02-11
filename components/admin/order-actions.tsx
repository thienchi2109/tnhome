"use client";

import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateOrderStatus } from "@/lib/actions/order-actions";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Truck, CreditCard, XCircle } from "lucide-react";
import type { OrderStatus } from "@/types";

const NEXT_ACTIONS: Record<string, Array<{ status: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }>> = {
  PENDING: [
    { status: "PAID", label: "Xác nhận thanh toán", icon: CreditCard },
  ],
  PAID: [
    { status: "SHIPPED", label: "Giao hàng", icon: Truck },
  ],
  SHIPPED: [
    { status: "COMPLETED", label: "Hoàn thành", icon: CheckCircle2 },
  ],
  COMPLETED: [],
  CANCELLED: [],
};

const CANCELLABLE = ["PENDING", "PAID", "SHIPPED"];

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
}

export function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const nextActions = NEXT_ACTIONS[currentStatus] ?? [];
  const canCancel = CANCELLABLE.includes(currentStatus);

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    startTransition(async () => {
      try {
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success) {
          toast.success("Cập nhật trạng thái thành công");
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error("Không thể cập nhật trạng thái đơn hàng");
      }
    });
  };

  if (nextActions.length === 0 && !canCancel) return null;

  return (
    <div className="flex items-center gap-2">
      {nextActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.status}
            size="sm"
            onClick={() => handleStatusUpdate(action.status)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="md:mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Icon className="md:mr-1.5 h-3.5 w-3.5" />
            )}
            <span className="hidden md:inline">{action.label}</span>
          </Button>
        );
      })}

      {canCancel && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isPending}>
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Hủy đơn
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hủy đơn hàng?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này sẽ hủy đơn hàng và khôi phục số lượng tồn kho.
                Không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Quay lại</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleStatusUpdate("CANCELLED")}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Xác nhận hủy
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
