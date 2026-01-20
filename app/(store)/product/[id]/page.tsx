"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import { ArrowLeft, Minus, Plus, Share2, Star } from "lucide-react";
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
    colors: ["White", "Terracotta", "Charcoal"],
    sizes: ["Set of 3", "Large Only", "Medium Only"],
    details: [
        { label: "Material", value: "100% Ceramic" },
        { label: "Dimensions", value: "S: 10cm, M: 15cm, L: 20cm" },
        { label: "Care", value: "Wipe clean with a damp cloth" }
    ]
};

export default function ProductDetailPage() {
    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        console.log("Added to cart:", {
            id: product.id,
            name: product.name,
            price: product.price,
            color: selectedColor,
            size: selectedSize,
            quantity
        });
        // In a real app, calls cart store here
    };

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

                        {/* Selectors */}
                        <div className="space-y-6 pt-4 border-t border-border">
                            {/* Color Selector */}
                            <div>
                                <label className="text-sm font-medium mb-3 block">
                                    Color: <span className="text-muted-foreground font-normal">{selectedColor}</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={cn(
                                                "px-4 py-2 border rounded-full text-sm transition-all duration-200",
                                                selectedColor === color
                                                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                                                    : "border-border hover:border-foreground/50"
                                            )}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size Selector */}
                            <div>
                                <label className="text-sm font-medium mb-3 block">
                                    Option: <span className="text-muted-foreground font-normal">{selectedSize}</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={cn(
                                                "px-4 py-2 border rounded-full text-sm transition-all duration-200",
                                                selectedSize === size
                                                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                                                    : "border-border hover:border-foreground/50"
                                            )}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-6">
                            <div className="flex gap-4">
                                <div className="flex items-center border border-border rounded-full px-3 h-12">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-1 hover:bg-muted rounded-full transition-colors"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-1 hover:bg-muted rounded-full transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <Button
                                    size="lg"
                                    className="flex-1 rounded-full h-12 text-base"
                                    onClick={handleAddToCart}
                                >
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
