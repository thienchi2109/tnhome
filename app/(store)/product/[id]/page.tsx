import { notFound } from "next/navigation";
import { getActiveProductById } from "@/lib/actions";
import { ProductDetailClient } from "@/components/product/product-detail-client";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getActiveProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
