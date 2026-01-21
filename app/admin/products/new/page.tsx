import { AdminHeader } from "@/components/admin/admin-header";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader
        title="Thêm sản phẩm"
        description="Tạo danh sách sản phẩm mới"
      />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <ProductForm />
          </div>
        </div>
      </main>
    </div>
  );
}
