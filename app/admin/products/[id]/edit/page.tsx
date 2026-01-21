import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductForm } from "@/components/admin/product-form";
import { getProduct } from "@/lib/actions";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader
        title="Edit Product"
        description={`Editing: ${product.name}`}
      />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <ProductForm initialData={product} />
          </div>
        </div>
      </main>
    </div>
  );
}
