"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteProduct, toggleProductStatus } from "@/lib/actions";
import { toast } from "sonner";

interface ProductActionsProps {
  productId: string;
  isActive: boolean;
  filterQuery?: string;
}

export function ProductActions({ productId, isActive, filterQuery }: ProductActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleToggleStatus = () => {
    startTransition(async () => {
      const result = await toggleProductStatus(productId, !isActive);
      if (result.success) {
        toast.success(isActive ? "Đã ẩn sản phẩm" : "Đã kích hoạt sản phẩm");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result.success) {
        toast.success("Đã xóa sản phẩm");
        setShowDeleteDialog(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <Link href={`/admin/products?edit=${productId}${filterQuery ? `&${filterQuery}` : ""}`}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Chỉnh sửa</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Chỉnh sửa</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleToggleStatus}
              disabled={isPending}
            >
              {isActive ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">{isActive ? "Ẩn" : "Hiện"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isActive ? "Ẩn" : "Hiện"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Xóa</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Xóa</TooltipContent>
        </Tooltip>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
