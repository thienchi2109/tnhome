"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-muted">
      <Image
        src="/living-room-hero.png"
        alt="Minimalist Living Room"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay for text readability */}

      <div className="absolute inset-0 flex items-center justify-center text-center">
        <div className="container px-4 space-y-8 animate-fade-in-up">
          <h1 className="heading-hero text-white max-w-4xl mx-auto drop-shadow-sm">
            Đơn Giản Là Đỉnh Cao <br className="hidden md:block" /> Của Sự Tinh Tế.
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-lg mx-auto leading-relaxed font-light">
            Khám phá bộ sưu tập sản phẩm gia dụng cao cấp.
            Nơi chất lượng gặp gỡ thiết kế tối giản.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="rounded-none px-12 h-14 text-base bg-white text-black hover:bg-white/90 border-0" asChild>
              <Link href="/products">Mua Sắm Ngay</Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-none px-12 h-14 text-base text-white border-white bg-transparent hover:bg-white hover:text-black" asChild>
              <Link href="/about">Câu Chuyện</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
