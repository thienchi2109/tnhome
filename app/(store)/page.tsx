import { SectionHeader } from "@/components/store/section-header";
import { CategoryPills } from "@/components/store/category-pills";
import { CategorySpotlight } from "@/components/store/category-spotlight";
import { BrandStory } from "@/components/store/brand-story";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveProducts, getCategoriesWithSlugs } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allProducts, categoriesWithSlugs] = await Promise.all([
    getActiveProducts(),
    getCategoriesWithSlugs(),
  ]);

  const products = allProducts.slice(0, 8);
  const totalCount = allProducts.length;

  return (
    <main className="flex flex-col pb-16">
      {/* Section 1: Editorial Tagline */}
      <section className="pt-8 md:pt-12 pb-6 md:pb-8 px-6">
        <div className="mx-auto max-w-[1400px]">
          <h1 className="heading-hero text-foreground max-w-3xl">
            Sản Phẩm Gia Dụng
            <br />
            Cho Cuộc Sống Hiện Đại.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg">
            Chất lượng gặp thiết kế tối giản. Khám phá bộ sưu tập được chọn
            lọc cho ngôi nhà của bạn.
          </p>
        </div>
      </section>

      {/* Section 2: Category Pills */}
      <section className="pb-6">
        <CategoryPills categories={categoriesWithSlugs} />
      </section>

      {/* Section 3: Product Grid */}
      <section className="py-12 md:py-16 px-6">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeader
            title="Sản Phẩm Mới"
            subtitle="Những thiết kế mới mẻ cho phong cách sống hiện đại."
            action={
              <Button
                variant="link"
                className="text-base h-auto p-0 hover:no-underline group text-foreground"
                asChild
              >
                <Link href="/products" className="flex items-center gap-2">
                  Xem Tất Cả
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            }
          />
          <ProductGrid products={products} />
          {totalCount > 8 && (
            <div className="mt-10 text-center">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8"
                asChild
              >
                <Link href="/products" className="flex items-center gap-2">
                  Xem Thêm
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <p className="mt-3 text-sm text-muted-foreground">
                {totalCount} sản phẩm
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Category Spotlight */}
      <section className="py-12 md:py-16">
        <CategorySpotlight
          title="Bộ Sưu Tập Nhà Bếp"
          subtitle="Được thiết kế cho cả công năng và vẻ đẹp. Nâng tầm không gian bếp của bạn."
          href="/products?category=nha-bep"
          ctaText="Khám Phá"
          imageSrc="/kitchen-collection.png"
          imageAlt="Bộ sưu tập nhà bếp cao cấp"
        />
      </section>

      {/* Section 5: Brand Story */}
      <BrandStory />
    </main>
  );
}
