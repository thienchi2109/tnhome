import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import { ArrowLeft, ChevronRight, Minus, Plus, Share2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock Product Data
const product = {
    id: "1",
    name: "Modern Ceramic Vase Set",
    price: 1250000,
    description: "Hand-crafted ceramic vase set with a matte finish. Perfect for minimalist interiors. The set includes three sizes: small, medium, and large.",
    images: [
        "https://images.unsplash.com/photo-1581783342308-f792cca04eb2?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1000&auto=format&fit=crop"
    ],
    details: [
        { label: "Material", value: "100% Ceramic" },
        { label: "Dimensions", value: "S: 10cm, M: 15cm, L: 20cm" },
        { label: "Care", value: "Wipe clean with a damp cloth" }
    ]
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen pb-16 md:pb-24">
            {/* Breadcrumb / Back Navigation */}
            <div className="container mx-auto px-4 pt-6 pb-4">
                <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
                </Link>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">

                    {/* Left: Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        {/* Thumbnails (Grid) */}
                        <div className="grid grid-cols-2 gap-4">
                            {product.images.slice(1).map((img, idx) => (
                                <div key={idx} className="relative aspect-square bg-muted rounded-xl overflow-hidden">
                                    <Image
                                        src={img}
                                        alt={`${product.name} ${idx + 2}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Details - Sticky on Desktop */}
                    <div className="md:sticky md:top-24 space-y-8">
                        <div className="space-y-2">
                            <h1 className="heading-section leading-tight">{product.name}</h1>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-semibold tracking-tight">{formatPrice(product.price)}</span>
                                <div className="flex items-center gap-1 text-sm text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="font-medium text-foreground">4.8</span>
                                    <span className="text-muted-foreground">(24 reviews)</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-body text-muted-foreground leading-relaxed">
                            {product.description}
                        </p>

                        {/* Selectors Stub */}
                        <div className="space-y-4 pt-4 border-t border-border">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Color</label>
                                <div className="flex gap-2">
                                    {["White", "Terracotta", "Charcoal"].map((color, i) => (
                                        <button key={color} className={cn(
                                            "px-4 py-2 border rounded-full text-sm hover:border-foreground transition-colors",
                                            i === 0 ? "border-foreground bg-muted/20" : "border-border"
                                        )}>
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-6">
                            <div className="flex gap-4">
                                <div className="flex items-center border border-border rounded-full px-3 h-12">
                                    <button className="p-1 hover:bg-muted rounded-full transition-colors"><Minus className="w-4 h-4" /></button>
                                    <span className="w-8 text-center font-medium">1</span>
                                    <button className="p-1 hover:bg-muted rounded-full transition-colors"><Plus className="w-4 h-4" /></button>
                                </div>
                                <Button size="lg" className="flex-1 rounded-full h-12 text-base">
                                    Add to Cart
                                </Button>
                                <Button variant="outline" size="lg" className="rounded-full w-12 h-12 p-0 flex items-center justify-center">
                                    <Share2 className="w-5 h-5" />
                                </Button>
                            </div>
                            <p className="text-xs text-center text-muted-foreground">
                                Free shipping on orders over 1.000.000₫
                            </p>
                        </div>

                        {/* Expansion Details */}
                        <div className="border-t border-border pt-6 space-y-4">
                            {product.details.map((detail) => (
                                <div key={detail.label} className="flex justify-between py-2 text-sm border-b border-border/50 last:border-0">
                                    <span className="text-muted-foreground">{detail.label}</span>
                                    <span className="font-medium">{detail.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
