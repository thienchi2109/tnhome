import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeader } from "@/components/store/section-header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CollectionPage({ params }: { params: { slug: string } }) {
    const title = params.slug.charAt(0).toUpperCase() + params.slug.slice(1) + " Collection";

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
            </Link>

            <SectionHeader
                title={title}
                subtitle={`Curated selection for your ${params.slug}.`}
            />
            <div className="mt-8">
                <ProductGrid />
            </div>
        </div>
    );
}
