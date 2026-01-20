import { ProductCard } from "./product-card";

// Skeleton for Day 2 - Will be populated with real data later
export function ProductGrid() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ProductCard
                    key={i}
                    id={i.toString()}
                    index={i}
                    name={`Minimalist Vase ${i}`}
                    price={500000}
                    description="Matte finish ceramic, available in white"
                    image=""
                />
            ))}
        </div>
    );
}

