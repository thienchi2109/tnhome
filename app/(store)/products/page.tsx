import { ProductGrid } from "@/components/product/product-grid";
import { StorePagination } from "@/components/store/store-pagination";
import { SectionHeader } from "@/components/store/section-header";
import { getActiveProductsPaginated } from "@/lib/actions";
import { STORE_PAGE_SIZE, normalizePaginationParams } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export async function generateMetadata({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const category = params.category;

  const title = category
    ? page > 1
      ? `${category} - Trang ${page} | TN Home`
      : `${category} | TN Home`
    : page > 1
      ? `Sản phẩm - Trang ${page} | TN Home`
      : "Sản phẩm | TN Home";

  return {
    title,
    description: category
      ? `Khám phá bộ sưu tập ${category.toLowerCase()} của TN Home.`
      : "Khám phá toàn bộ bộ sưu tập nội thất hiện đại của TN Home.",
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { page } = normalizePaginationParams(params.page, STORE_PAGE_SIZE);
  const category = params.category;

  const { products, pagination } = await getActiveProductsPaginated(
    { page, pageSize: STORE_PAGE_SIZE },
    category
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <SectionHeader
        title={category || "Tất cả sản phẩm"}
        subtitle={
          category
            ? `Khám phá bộ sưu tập ${category.toLowerCase()} của chúng tôi.`
            : "Khám phá toàn bộ bộ sưu tập nội thất hiện đại."
        }
      />

      <div className="mt-8 md:mt-12">
        <ProductGrid products={products} />
      </div>

      <StorePagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
      />
    </div>
  );
}
