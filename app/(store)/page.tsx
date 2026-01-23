import { HeroSection } from "@/components/store/hero-section";
import { SectionHeader } from "@/components/store/section-header";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getActiveProducts } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch latest 8 products for homepage preview
  const allProducts = await getActiveProducts();
  const products = allProducts.slice(0, 8);

  return (
    <main className="flex flex-col pb-32">
      <HeroSection />

      {/* New Arrivals Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeader
            title="Sản Phẩm Mới"
            subtitle="Những thiết kế mới mẻ cho phong cách sống hiện đại."
            action={
              <Button variant="link" className="text-base h-auto p-0 hover:no-underline group text-foreground" asChild>
                <Link href="/products" className="flex items-center gap-2">
                  Xem Tất Cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            }
          />
          <ProductGrid products={products} />
        </div>
      </section>

      {/* Featured Collection - Split Layout */}
      <section className="py-24 md:py-32 border-t border-border/40">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 space-y-8 pr-12">
              <h2 className="heading-hero text-4xl md:text-5xl">Bộ Sưu Tập Nhà Bếp</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                Được thiết kế cho cả công năng và vẻ đẹp. Bộ sưu tập đồ dùng nhà bếp của chúng tôi mang lại nét thanh lịch cho các thói quen hàng ngày của bạn. Từ bộ gốm sứ đến đồ dùng bền bỉ, mọi thứ bạn cần cho một kiệt tác ẩm thực.
              </p>
              <Button size="lg" className="rounded-none px-10 h-14 text-base" asChild>
                <Link href="/collections/kitchen">Khám Phá Nhà Bếp</Link>
              </Button>
            </div>
            {/* New Kitchen Image */}
            <div className="order-1 md:order-2 aspect-[4/3] bg-muted relative overflow-hidden">
              <Image
                src="/kitchen-collection.png"
                alt="Bộ sưu tập nhà bếp cao cấp"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
