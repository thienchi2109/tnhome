"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { Loader2, ShoppingBag, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/store/cart";
import { createOrder } from "@/lib/actions";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Validation schema (matches server-side)
const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được quá 100 ký tự"),
  customerPhone: z
    .string()
    .regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
  customerEmail: z
    .string()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("")),
  customerAddress: z
    .string()
    .min(10, "Địa chỉ phải có ít nhất 10 ký tự")
    .max(500, "Địa chỉ không được quá 500 ký tự"),
  notes: z.string().max(500).optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface SavedCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
}

interface CheckoutFormProps {
  savedCustomer: SavedCustomer | null;
}

export function CheckoutForm({ savedCustomer }: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isHydrated, setIsHydrated] = useState(false);
  const { items, getTotal, clearCart } = useCartStore();

  // Hydration guard for localStorage cart
  useEffect(() => {
    // Use requestAnimationFrame to avoid lint warning about sync setState in effect
    requestAnimationFrame(() => {
      setIsHydrated(true);
    });
  }, []);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onBlur",
    defaultValues: {
      customerName: savedCustomer?.name || "",
      customerPhone: savedCustomer?.phone || "",
      customerEmail: savedCustomer?.email || "",
      customerAddress: savedCustomer?.address || "",
      notes: "",
    },
  });

  const onSubmit = (data: CheckoutFormValues) => {
    startTransition(async () => {
      const result = await createOrder({
        ...data,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      if (result.success) {
        clearCart();
        router.push(`/checkout/success?orderId=${result.data.orderId}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  // Show skeleton while hydrating
  if (!isHydrated) {
    return <CheckoutFormSkeleton />;
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-6 text-xl font-semibold">Giỏ hàng trống</h2>
        <p className="mt-2 text-muted-foreground">
          Thêm sản phẩm vào giỏ hàng để tiếp tục thanh toán.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tiếp tục mua sắm
          </Link>
        </Button>
      </div>
    );
  }

  const total = getTotal();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Customer Info Form */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Thông tin giao hàng</h2>
          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName">Họ và tên *</Label>
              <Input
                id="customerName"
                type="text"
                placeholder="Nguyễn Văn A"
                className="h-12 text-base"
                autoComplete="name"
                aria-invalid={!!form.formState.errors.customerName}
                aria-describedby={
                  form.formState.errors.customerName
                    ? "customerName-error"
                    : undefined
                }
                {...form.register("customerName")}
              />
              {form.formState.errors.customerName && (
                <p
                  id="customerName-error"
                  className="text-sm text-red-500"
                  role="alert"
                >
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Số điện thoại *</Label>
              <Input
                id="customerPhone"
                type="tel"
                inputMode="numeric"
                placeholder="0901234567"
                className="h-12 text-base"
                autoComplete="tel"
                aria-invalid={!!form.formState.errors.customerPhone}
                aria-describedby={
                  form.formState.errors.customerPhone
                    ? "customerPhone-error"
                    : undefined
                }
                {...form.register("customerPhone")}
              />
              {form.formState.errors.customerPhone && (
                <p
                  id="customerPhone-error"
                  className="text-sm text-red-500"
                  role="alert"
                >
                  {form.formState.errors.customerPhone.message}
                </p>
              )}
            </div>

            {/* Email (optional) */}
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email (không bắt buộc)</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="email@example.com"
                className="h-12 text-base"
                autoComplete="email"
                aria-invalid={!!form.formState.errors.customerEmail}
                aria-describedby={
                  form.formState.errors.customerEmail
                    ? "customerEmail-error"
                    : undefined
                }
                {...form.register("customerEmail")}
              />
              {form.formState.errors.customerEmail && (
                <p
                  id="customerEmail-error"
                  className="text-sm text-red-500"
                  role="alert"
                >
                  {form.formState.errors.customerEmail.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Địa chỉ giao hàng *</Label>
              <Textarea
                id="customerAddress"
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                className="min-h-24 text-base resize-none"
                autoComplete="street-address"
                aria-invalid={!!form.formState.errors.customerAddress}
                aria-describedby={
                  form.formState.errors.customerAddress
                    ? "customerAddress-error"
                    : undefined
                }
                {...form.register("customerAddress")}
              />
              {form.formState.errors.customerAddress && (
                <p
                  id="customerAddress-error"
                  className="text-sm text-red-500"
                  role="alert"
                >
                  {form.formState.errors.customerAddress.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú (không bắt buộc)</Label>
              <Textarea
                id="notes"
                placeholder="Ghi chú cho đơn hàng (ví dụ: giao hàng giờ hành chính)"
                className="min-h-20 text-base resize-none"
                {...form.register("notes")}
              />
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Đơn hàng của bạn</h2>

            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="font-medium line-clamp-2">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Tổng cộng</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="w-full h-14 text-lg"
            aria-busy={isPending}
          >
            {isPending && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
            )}
            {isPending ? "Đang xử lý..." : "Đặt hàng"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi.
          </p>
        </div>
      </div>
    </form>
  );
}

function CheckoutFormSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
