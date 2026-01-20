import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Skeleton for Day 2 - Will be populated with real data later
export function ProductGrid() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
            {/* Product Card Placeholder 1 */}
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="group flex flex-col gap-3">
                    <div className="aspect-square relative overflow-hidden rounded-xl bg-muted/50">
                        {/* Interaction Overlay */}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Quick Add Button - Desktop */}
                        <div className="absolute bottom-4 left-4 right-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
                            <Button className="w-full rounded-full shadow-lg" size="sm">Quick Add</Button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                            <h3 className="text-base font-medium leading-tight group-hover:text-primary transition-colors">
                                Minimalist Vase {i}
                            </h3>
                            <span className="text-sm font-semibold">500.000₫</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                            Matte finish ceramic, available in white
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
