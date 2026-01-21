import { ProductCard } from "./product-card";
import { getActiveProducts } from "@/lib/actions";

interface ProductGridProps {
  category?: string;
  limit?: number;
}

export async function ProductGrid({ category, limit }: ProductGridProps) {
  const products = await getActiveProducts(category);
  const displayProducts = limit ? products.slice(0, limit) : products;

  if (displayProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
      {displayProducts.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          image={product.images[0]}
          category={product.category}
        />
      ))}
    </div>
  );
}

