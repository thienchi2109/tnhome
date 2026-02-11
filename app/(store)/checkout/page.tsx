import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCustomerByAuth } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  // Fetch saved customer data for logged-in users
  const savedCustomer = await getCustomerByAuth();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-14 md:py-24">
        <div className="space-y-2 mb-8">
          <h1 className="heading-section">Thanh toán</h1>
          <p className="text-muted-foreground">
            Vui lòng điền thông tin để hoàn tất đơn hàng.
          </p>
        </div>
        <CheckoutForm savedCustomer={savedCustomer} />
      </div>
    </div>
  );
}
