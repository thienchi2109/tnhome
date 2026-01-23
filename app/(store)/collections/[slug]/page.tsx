import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeader } from "@/components/store/section-header";
import { getActiveProducts } from "@/lib/actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const title = slug.charAt(0).toUpperCase() + slug.slice(1) + " Collection";

  // Fetch products - could filter by category based on slug in future
  const products = await getActiveProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Quay về Trang chủ
      </Link>

      <SectionHeader
        title={title}
        subtitle={`Bộ sưu tập được chọn lọc cho ${slug} của bạn.`}
      />
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
