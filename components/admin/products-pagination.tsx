"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductsPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 dòng" },
  { value: "20", label: "20 dòng" },
  { value: "50", label: "50 dòng" },
  { value: "100", label: "100 dòng" },
];

export function ProductsPagination({
  currentPage,
  pageSize,
  totalPages,
}: Omit<ProductsPaginationProps, "totalItems">) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Helper to create URL with updated params
  const createPageUrl = (page: number, newPageSize?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    params.set("pageSize", (newPageSize ?? pageSize).toString());
    return `${pathname}?${params.toString()}`;
  };

  // Handle page size change - reset to page 1
  const handlePageSizeChange = (newSize: string) => {
    router.push(createPageUrl(1, parseInt(newSize, 10)));
  };

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      {/* Page Size Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Hiển thị</span>
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-[100px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Page Info */}
      <div className="text-sm text-muted-foreground">
        Trang {currentPage} / {totalPages}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        {hasPreviousPage ? (
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href={createPageUrl(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Trang trước</span>
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Trang trước</span>
          </Button>
        )}

        {hasNextPage ? (
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href={createPageUrl(currentPage + 1)}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Trang sau</span>
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Trang sau</span>
          </Button>
        )}
      </div>
    </div>
  );
}
