"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    index: number;
}

export function ProductCard({ id, name, price, description, image, index }: ProductCardProps) {
    return (
        <Link href={`/product/${id}`} className="group flex flex-col gap-3">
            <div className="aspect-square relative overflow-hidden rounded-xl bg-muted/50">
                {/* Image Placeholder or Real Image Component would go here. 
                    Using a simple div with background for now to match strict plan "images w/ blur" 
                    but sticking to the skeleton style seen in Grid unless I add Image component. 
                */}
                <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800" />

                {/* Interaction Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Quick Add Button - Desktop */}
                <div className="absolute bottom-4 left-4 right-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
                    <Button className="w-full rounded-full shadow-lg" size="sm" onClick={(e) => {
                        e.preventDefault(); // Prevent navigation when clicking quick add
                        // Add to cart logic
                    }}>
                        Quick Add
                    </Button>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start">
                    <h3 className="text-base font-medium leading-tight group-hover:text-primary transition-colors">
                        {name}
                    </h3>
                    <span className="text-sm font-semibold">{formatPrice(price)}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                    {description}
                </p>
            </div>
        </Link>
    );
}
