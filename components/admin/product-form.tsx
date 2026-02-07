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
import { ImageUpload } from "@/components/admin/image-upload";
import { CategoryCombobox } from "@/components/admin/category-combobox";
import { createProduct, updateProduct } from "@/lib/actions";
import { toast } from "sonner";
import type { Product } from "@/types";

const productFormSchema = z.object({
  externalId: z.string().max(64).optional(),
  name: z.string().min(1, "Tên là bắt buộc").max(200),
  description: z.string().max(2000).optional(),
  price: z.number().int().positive("Giá phải là số dương"),
  category: z.string().min(1, "Danh mục là bắt buộc"),
  images: z.array(z.string().url()).min(1, "Cần ít nhất một hình ảnh"),
  isActive: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Product | null;
  onSuccess?: () => void;
  categories?: string[];
}

export function ProductForm({ initialData, onSuccess, categories = [] }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      externalId: initialData?.externalId || "",
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
        toast.success(initialData ? "Sản phẩm đã được cập nhật" : "Sản phẩm đã được tạo");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/admin/products");
          router.refresh();
        }
      } else {
        toast.error(result.error);
      }
    });
  };

  const images = useWatch({ control: form.control, name: "images" });
  const currentCategory = useWatch({ control: form.control, name: "category" });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Images */}
      <div className="space-y-2">
        <Label>Hình ảnh sản phẩm</Label>
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

      {/* External ID (Mã hàng) */}
      <div className="space-y-2">
        <Label htmlFor="externalId">Mã hàng</Label>
        <Input
          id="externalId"
          placeholder="ví dụ: SKU-001"
          disabled={isPending}
          {...form.register("externalId")}
        />
        {form.formState.errors.externalId && (
          <p className="text-sm text-red-500">
            {form.formState.errors.externalId.message}
          </p>
        )}
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Tên sản phẩm</Label>
        <Input
          id="name"
          placeholder="ví dụ: Bình gốm hiện đại"
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
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          placeholder="Mô tả sản phẩm của bạn..."
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
          <Label htmlFor="price">Giá (VND)</Label>
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
          <Label>Danh mục</Label>
          <CategoryCombobox
            value={currentCategory}
            onChange={(value) => form.setValue("category", value)}
            categories={categories}
            disabled={isPending}
            placeholder="Chọn hoặc tạo danh mục..."
          />
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
          Sản phẩm đang hoạt động và hiển thị trên cửa hàng
        </Label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}
