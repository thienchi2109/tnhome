import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategorySpotlightProps {
  title: string;
  subtitle: string;
  href: string;
  ctaText: string;
  imageSrc: string;
  imageAlt: string;
}

export function CategorySpotlight({
  title,
  subtitle,
  href,
  ctaText,
  imageSrc,
  imageAlt,
}: CategorySpotlightProps) {
  return (
    <section className="px-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="relative h-[280px] md:h-[400px] overflow-hidden rounded-2xl">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            <h2 className="heading-section text-white mb-2">{title}</h2>
            <p className="text-white/80 text-base md:text-lg mb-6 max-w-md">
              {subtitle}
            </p>
            <div>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-white text-white bg-transparent hover:bg-white hover:text-black"
                asChild
              >
                <Link href={href} className="flex items-center gap-2">
                  {ctaText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
