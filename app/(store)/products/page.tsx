import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeader } from "@/components/store/section-header";

export default function ProductsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <SectionHeader
                title="All Products"
                subtitle="Browse our complete collection of modern home goods."
            />
            <div className="mt-8">
                <ProductGrid />
            </div>
        </div>
    );
}
