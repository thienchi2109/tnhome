import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Apple-style */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-14 md:py-24">
        <div className="mx-auto max-w-[1200px] text-center">
          <h1 className="heading-hero mb-6">
            Welcome to TN Home
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-8">
            Discover our curated collection of premium household products.
            Quality meets design.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8"
              asChild
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Placeholder for Product Grid - Day 2 */}
      <section className="py-14 md:py-24 bg-muted">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <h2 className="heading-section text-center mb-12">
            Featured Products
          </h2>
          <p className="text-center text-muted-foreground">
            Product grid will be implemented on Day 2
          </p>
        </div>
      </section>
    </div>
  );
}
