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

  const products = allProducts.slice(0, 24);
  const totalCount = allProducts.length;

  return (
    <main className="flex flex-col pb-16">
      {/* Section 1: Editorial Tagline */}
      <section className="relative pt-12 md:pt-24 pb-12 md:pb-20 px-6 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background -z-10" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

        <div className="mx-auto max-w-[1400px] text-center md:text-left">
          <div className="max-w-4xl mx-auto md:mx-0">
            <h1 className="heading-hero text-foreground tracking-tight text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-forwards">
              Sản Phẩm Gia Dụng <br className="hidden md:block" />
              <span className="text-muted-foreground/80">Cho Cuộc Sống Hiện Đại.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-forwards md:leading-relaxed">
              Sự kết hợp hoàn hảo giữa chất lượng bền bỉ và thiết kế tối giản.
              Khám phá bộ sưu tập được tuyển chọn riêng cho ngôi nhà của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Category Pills — hidden below xl, redundant with sidebar/navbar */}
      <section className="hidden xl:block pb-6">
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
          <ProductGrid products={products} mobileLimit={12} />
          {totalCount > 24 && (
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
          title="Bộ Sưu Tập Đồ Dùng Bếp"
          subtitle="Được thiết kế cho cả công năng và vẻ đẹp. Nâng tầm không gian bếp của bạn."
          href="/products?category=do-dung-bep"
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
