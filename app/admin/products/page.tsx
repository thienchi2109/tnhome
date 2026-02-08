import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { getProducts, getAllCategories } from "@/lib/actions";
import { isUnauthorizedError } from "@/lib/actions/errors";
import { normalizePaginationParams } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { Plus, Upload, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductActions } from "@/components/admin/product-actions";
import { ProductFormSheet } from "@/components/admin/product-form-sheet";
import { ProductImportSheet } from "@/components/admin/product-import-sheet";
import { PaginationNav } from "@/components/ui/pagination-nav";

export const dynamic = "force-dynamic";

// Next.js 15 searchParams type (Promise-based)
interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    action?: string;
    edit?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams;

  // Normalize pagination params with validation
  const paginationParams = normalizePaginationParams(params.page, params.pageSize);

  // Fetch products and categories in parallel
  let products, pagination, categories;
  try {
    [{ products, pagination }, categories] = await Promise.all([
      getProducts(paginationParams),
      getAllCategories(),
    ]);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect("/?error=unauthorized");
    }
    throw error;
  }

  // Calculate display range
  const startItem =
    pagination.totalItems === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(
    pagination.page * pagination.pageSize,
    pagination.totalItems
  );

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader
        title="Sản phẩm"
        description="Quản lý danh mục sản phẩm của bạn"
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {pagination.totalItems > 0 ? (
                <>
                  Hiển thị {startItem}-{endItem} trong {pagination.totalItems} sản phẩm
                </>
              ) : (
                "Không có sản phẩm nào"
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/api/admin/products/template" download>
                <Download className="mr-1.5 h-4 w-4" />
                Tải mẫu
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/products?action=import">
                <Upload className="mr-1.5 h-4 w-4" />
                Nhập Excel
              </Link>
            </Button>
            <Button asChild className="gap-2">
              <Link href="/admin/products?action=new">
                <Plus className="h-4 w-4" />
                Thêm sản phẩm
              </Link>
            </Button>
          </div>
        </div>

        {/* Products Grid/Table */}
        {products.length > 0 ? (
          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                      Sản phẩm
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                      Danh mục
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                      Giá
                    </th>
                    <th className="text-right p-4 font-medium text-muted-foreground text-sm">
                      Tồn kho
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                      Trạng thái
                    </th>
                    <th className="text-right p-4 font-medium text-muted-foreground text-sm">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                                Không ảnh
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {product.id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="font-normal">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">
                          {formatPrice(product.price)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-medium tabular-nums">
                          {product.stock}
                        </span>
                        {product.stock <= 0 && (
                          <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-100 border-0">
                            Hết hàng
                          </Badge>
                        )}
                        {product.stock > 0 && product.stock <= product.lowStockThreshold && (
                          <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">
                            Sắp hết
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={product.isActive ? "default" : "outline"}
                          className={
                            product.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "text-muted-foreground"
                          }
                        >
                          {product.isActive ? "Đang bán" : "Ngừng bán"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <ProductActions
                          productId={product.id}
                          isActive={product.isActive}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-12 shadow-sm">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 font-semibold text-foreground">
                Chưa có sản phẩm nào
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Bắt đầu bằng việc tạo sản phẩm đầu tiên của bạn.
              </p>
              <Button asChild>
                <Link href="/admin/products?action=new">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm sản phẩm
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalItems > 0 && (
          <PaginationNav
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            variant="admin"
            pageSize={pagination.pageSize}
          />
        )}
      </main>

      <Suspense fallback={null}>
        <ProductFormSheet products={products} categories={categories} />
      </Suspense>
      <Suspense fallback={null}>
        <ProductImportSheet />
      </Suspense>
    </div>
  );
}
