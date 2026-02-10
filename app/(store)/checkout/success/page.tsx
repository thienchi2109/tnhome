import { redirect } from "next/navigation";
import { CheckCircle } from "lucide-react";

import { getOrder } from "@/lib/actions";
import { formatPrice } from "@/lib/utils";
import { VietQRDisplay } from "@/components/checkout/vietqr-display";
import { SuccessActions } from "@/components/checkout/success-actions";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;
  const orderId = params.orderId;

  if (!orderId) {
    redirect("/");
  }

  const order = await getOrder(orderId);

  if (!order) {
    redirect("/");
  }

  // VietQR config from environment
  const bankId = process.env.VIETQR_BANK_ID || "970422"; // MB Bank default
  const accountNo = process.env.VIETQR_ACCOUNT_NO || "";
  const accountName = process.env.VIETQR_ACCOUNT_NAME || "TN HOME";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-2xl px-4 py-14 md:py-24">
        <div className="space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="heading-section">Đặt hàng thành công!</h1>
            <p className="text-muted-foreground">
              Cảm ơn bạn đã đặt hàng. Vui lòng thanh toán qua mã QR bên dưới.
            </p>
            <p className="text-sm text-muted-foreground">
              Mã đơn hàng:{" "}
              <span className="font-mono font-semibold text-foreground">
                {orderId}
              </span>
            </p>
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Chi tiết đơn hàng</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Tổng cộng</span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            {/* Shipping Info */}
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Người nhận:</span>{" "}
                <span className="font-medium">{order.shippingName}</span>
              </p>
              <p>
                <span className="text-muted-foreground">SĐT:</span>{" "}
                <span className="font-medium">{order.shippingPhone}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Địa chỉ:</span>{" "}
                <span className="font-medium">{order.shippingAddress}</span>
              </p>
              {order.notes && (
                <p>
                  <span className="text-muted-foreground">Ghi chú:</span>{" "}
                  <span className="font-medium">{order.notes}</span>
                </p>
              )}
            </div>
          </div>

          {/* VietQR Payment */}
          {accountNo && (
            <VietQRDisplay
              orderId={orderId}
              amount={order.total}
              bankId={bankId}
              accountNo={accountNo}
              accountName={accountName}
            />
          )}

          {/* Actions */}
          <SuccessActions />

          {/* Support Notice */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Cần hỗ trợ? Liên hệ{" "}
              <a
                href="tel:0901234567"
                className="font-medium text-primary hover:underline"
              >
                0901 234 567
              </a>{" "}
              hoặc nhắn tin qua{" "}
              <a
                href="https://m.me/tnhome"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Messenger
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
