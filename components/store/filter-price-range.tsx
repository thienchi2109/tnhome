"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebouncedCallback } from "use-debounce";
import { cn, formatPrice } from "@/lib/utils";

interface FilterPriceRangeProps {
  min: number;
  max: number;
}

export function FilterPriceRange({ min, max }: FilterPriceRangeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Get current values from URL or default to range bounds
  const urlMin = searchParams.get("minPrice");
  const urlMax = searchParams.get("maxPrice");
  const currentMin = urlMin ? Number(urlMin) : min;
  const currentMax = urlMax ? Number(urlMax) : max;

  // Local state for slider/inputs (immediate feedback)
  const [range, setRange] = useState([currentMin, currentMax]);

  // Track previous URL values to sync state when URL changes externally
  const [prevUrlMin, setPrevUrlMin] = useState(currentMin);
  const [prevUrlMax, setPrevUrlMax] = useState(currentMax);

  // Sync local state when URL changes (e.g., "Xóa Tất Cả" clicked)
  if (currentMin !== prevUrlMin || currentMax !== prevUrlMax) {
    setRange([currentMin, currentMax]);
    setPrevUrlMin(currentMin);
    setPrevUrlMax(currentMax);
  }

  const updateFilters = useDebouncedCallback(
    (newMin: number, newMax: number) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());

        // Only set if different from bounds
        if (newMin > min) {
          params.set("minPrice", newMin.toString());
        } else {
          params.delete("minPrice");
        }

        if (newMax < max) {
          params.set("maxPrice", newMax.toString());
        } else {
          params.delete("maxPrice");
        }

        // Reset page when filtering
        params.delete("page");

        router.push(`/products?${params.toString()}`, { scroll: false });
      });
    },
    300
  );

  const handleSliderChange = (value: number[]) => {
    setRange(value);
    updateFilters(value[0], value[1]);
  };

  const handleInputChange = (index: 0 | 1, value: string) => {
    const numValue = Number(value.replace(/\D/g, "")) || 0;
    const newRange = [...range];
    newRange[index] = numValue;
    setRange(newRange);
  };

  const handleInputBlur = () => {
    // Validate and clamp on blur
    let [newMin, newMax] = range;

    // Clamp to global bounds
    newMin = Math.max(min, Math.min(newMin, max));
    newMax = Math.max(min, Math.min(newMax, max));

    // Ensure min <= max
    if (newMin > newMax) {
      [newMin, newMax] = [newMax, newMin];
    }

    setRange([newMin, newMax]);
    updateFilters(newMin, newMax);
  };

  return (
    <div
      className={cn(
        "space-y-4",
        "transition-opacity duration-200 motion-reduce:transition-none",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Khoảng giá
      </div>

      <Slider
        value={range}
        min={min}
        max={max}
        step={100000} // 100k VND steps
        onValueChange={handleSliderChange}
        className="py-4"
        aria-label="Khoảng giá"
      />

      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1.5">
          <Label
            htmlFor="min-price"
            className="text-xs text-muted-foreground"
          >
            Thấp nhất
          </Label>
          <Input
            id="min-price"
            type="text"
            inputMode="numeric"
            value={range[0].toLocaleString("vi-VN")}
            onChange={(e) => handleInputChange(0, e.target.value)}
            onBlur={handleInputBlur}
            className="h-9 text-sm"
            aria-valuetext={formatPrice(range[0])}
          />
        </div>
        <div className="pt-6 text-muted-foreground">–</div>
        <div className="flex-1 space-y-1.5">
          <Label
            htmlFor="max-price"
            className="text-xs text-muted-foreground"
          >
            Cao nhất
          </Label>
          <Input
            id="max-price"
            type="text"
            inputMode="numeric"
            value={range[1].toLocaleString("vi-VN")}
            onChange={(e) => handleInputChange(1, e.target.value)}
            onBlur={handleInputBlur}
            className="h-9 text-sm"
            aria-valuetext={formatPrice(range[1])}
          />
        </div>
      </div>
    </div>
  );
}
