import { HeroSection } from "@/components/store/hero-section";
import { SectionHeader } from "@/components/store/section-header";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveProducts } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch latest 8 products for homepage preview
  const allProducts = await getActiveProducts();
  const products = allProducts.slice(0, 8);

  return (
    <main className="flex flex-col pb-20">
      <HeroSection />

      {/* New Arrivals Section */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeader
            title="Sản Phẩm Mới"
            subtitle="Những thiết kế mới mẻ cho phong cách sống hiện đại."
            action={
              <Button variant="link" className="text-base h-auto p-0 hover:no-underline group" asChild>
                <Link href="/products" className="flex items-center gap-1">
                  Xem Tất Cả <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            }
          />
          <ProductGrid products={products} />
        </div>
      </section>

      {/* Featured Collection - Split Layout */}
      <section className="py-16 md:py-24 border-t border-border/40">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <h2 className="heading-section">Bộ Sưu Tập Nhà Bếp</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Được thiết kế cho cả công năng và vẻ đẹp. Bộ sưu tập đồ dùng nhà bếp của chúng tôi mang lại nét thanh lịch cho các thói quen hàng ngày của bạn. Từ bộ gốm sứ đến đồ dùng bền bỉ, mọi thứ bạn cần cho một kiệt tác ẩm thực.
              </p>
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link href="/collections/kitchen">Khám Phá Nhà Bếp</Link>
              </Button>
            </div>
            <div className="order-1 md:order-2 aspect-[4/5] bg-muted rounded-2xl overflow-hidden relative">
              {/* Placeholder for Collection Image */}
              <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
