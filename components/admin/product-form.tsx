"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";
import { createProduct, updateProduct } from "@/lib/actions";
import { toast } from "sonner";
import type { Product } from "@/types";

const CATEGORIES = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Office",
  "Outdoor",
  "Decor",
  "Lighting",
];

const productFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  price: z.number().int().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  isActive: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Product | null;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      category: initialData?.category || "",
      images: initialData?.images || [],
      isActive: initialData?.isActive ?? true,
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    startTransition(async () => {
      const result = initialData
        ? await updateProduct({ id: initialData.id, ...data })
        : await createProduct(data);

      if (result.success) {
        toast.success(initialData ? "Product updated" : "Product created");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const images = useWatch({ control: form.control, name: "images" });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Images */}
      <div className="space-y-2">
        <Label>Product Images</Label>
        <ImageUpload
          value={images}
          onChange={(urls) => form.setValue("images", urls)}
          disabled={isPending}
          maxImages={5}
        />
        {form.formState.errors.images && (
          <p className="text-sm text-red-500">
            {form.formState.errors.images.message}
          </p>
        )}
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          placeholder="e.g., Modern Ceramic Vase"
          disabled={isPending}
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your product..."
          rows={4}
          disabled={isPending}
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {/* Price and Category */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Price (VND)</Label>
          <Input
            id="price"
            type="number"
            placeholder="100000"
            disabled={isPending}
            {...form.register("price", { valueAsNumber: true })}
          />
          {form.formState.errors.price && (
            <p className="text-sm text-red-500">
              {form.formState.errors.price.message}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={useWatch({ control: form.control, name: "category" })}
            onValueChange={(value) => form.setValue("category", value)}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category && (
            <p className="text-sm text-red-500">
              {form.formState.errors.category.message}
            </p>
          )}
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          disabled={isPending}
          {...form.register("isActive")}
        />
        <Label htmlFor="isActive" className="font-normal">
          Product is active and visible on store
        </Label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Product" : "Create Product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
