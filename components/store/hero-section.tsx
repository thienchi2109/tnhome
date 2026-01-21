"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* Mobile Layout: Stacked (Image Top, Text Bottom) */}
      <div className="flex flex-col md:hidden">
        <div className="relative h-[400px] w-full overflow-hidden bg-muted">
          {/* Fallback color/placeholder if image fails */}
          <Image
            src="/home-hero.png"
            alt="Minimalist Living Room"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex flex-col items-center text-center px-6 py-12 bg-background">
          <h1 className="heading-hero mb-4 animate-fade-in-up opacity-0" style={{ animationDelay: "0.2s" }}>
            Nâng Tầm <br /> Không Gian Sống.
          </h1>
          <p className="text-body text-muted-foreground mb-8 max-w-sm animate-fade-in-up opacity-0" style={{ animationDelay: "0.4s" }}>
            Đồ gia dụng thiết yếu được thiết kế tỉ mỉ cho ngôi nhà Việt hiện đại.
          </p>
          <div className="flex flex-col w-full gap-3 animate-fade-in-up opacity-0" style={{ animationDelay: "0.6s" }}>
            <Button size="lg" className="rounded-full w-full" asChild>
              <Link href="/products">Mua Sắm Ngay</Link>
            </Button>
            <Button variant="ghost" size="lg" className="rounded-full w-full" asChild>
              <Link href="/about">Câu Chuyện</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout: Overlay or Split */}
      <div className="hidden md:block relative h-[65vh] w-full">
        <Image
          src="/home-hero.png"
          alt="Minimalist Living Room"
          fill
          className="object-cover"
          priority
        />

        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent lg:from-background/60" />

        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-xl space-y-8 pt-20">
              <h1 className="heading-hero tracking-tight text-foreground animate-fade-in-up opacity-0" style={{ animationDelay: "0.2s" }}>
                Đơn Giản Là <br /> Đỉnh Cao Của Sự Tinh Tế.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed animate-fade-in-up opacity-0" style={{ animationDelay: "0.4s" }}>
                Khám phá bộ sưu tập sản phẩm gia dụng cao cấp.
                Nơi chất lượng gặp gỡ thiết kế tối giản.
              </p>
              <div className="flex flex-row gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: "0.6s" }}>
                {/* Apple-style buttons: Blue pill for primary, simple text or outline for secondary */}
                <Button size="lg" className="rounded-full px-10 h-12 text-base font-medium" asChild>
                  <Link href="/products">Mua Sắm Ngay</Link>
                </Button>
                <Button variant="link" size="lg" className="h-12 text-base font-medium px-6 hover:no-underline hover:opacity-70 transition-opacity" asChild>
                  <Link href="/about">Xem Phim &rarr;</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
