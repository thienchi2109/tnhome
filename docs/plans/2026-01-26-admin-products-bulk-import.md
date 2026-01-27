# Admin Products Bulk Import Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an admin Excel bulk-import flow that upserts products by `external_id`, and add a required unique `external_id` column to the Products table.

**Architecture:** Introduce a new `externalId` field on `Product` mapped to DB column `external_id`, backfill existing rows, and enforce uniqueness. Parse `.xlsx` files server-side with ExcelJS and validate rows with Zod before upserting via Prisma. Enforce admin authorization, 5MB file size limit, 1000-row limit, and HTTPS-only image URLs. Provide an admin import sheet in the Products page with upload + template download, and show summary + row-level errors.

**Tech Stack:** Next.js 15 (app router, server actions), Prisma/Postgres, ExcelJS, Zod, Vitest, shadcn/ui components, Sonner.

---

### Task 1: Add `external_id` column + wire through types/actions

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_external_id/migration.sql`
- Modify: `types/index.ts`
- Modify: `lib/actions.ts`
- Modify: `components/admin/product-form.tsx`

**Step 1: Update Prisma schema (no tests yet)**

```prisma
model Product {
  id          String      @id @default(cuid())
  externalId  String      @unique @map("external_id")
  name        String
  description String?
  price       Int
  images      String[]
  category    String
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  orderItems  OrderItem[]

  @@index([category])
  @@index([isActive])
  @@index([isActive, category, price])
  @@index([isActive, createdAt(sort: Desc)])
}
```

**Step 2: Generate a migration and edit SQL to backfill**

Run:

```bash
npx prisma migrate dev --create-only --name add_external_id
```

Edit `prisma/migrations/<timestamp>_add_external_id/migration.sql` to ensure existing rows are filled and the column becomes NOT NULL + UNIQUE:

```sql
ALTER TABLE "Product" ADD COLUMN "external_id" TEXT;
UPDATE "Product" SET "external_id" = "id" WHERE "external_id" IS NULL;
ALTER TABLE "Product" ALTER COLUMN "external_id" SET NOT NULL;
CREATE UNIQUE INDEX "Product_external_id_key" ON "Product"("external_id");
```

**Step 3: Apply migration**

Run:

```bash
npx prisma migrate dev
```

Expected: migration applied without errors.

**Step 4: Update TypeScript types**

Edit `types/index.ts`:

```ts
export interface Product {
  id: string;
  externalId: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  category: string;
  isActive: boolean;
}
```

**Step 5: Update product actions to accept/return externalId**

Edit `lib/actions.ts`:

```ts
const productSchema = z.object({
  externalId: z.string().min(1).max(64).optional(),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  price: z.number().int().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  isActive: z.boolean().default(true),
});

export async function createProduct(
  formData: z.infer<typeof productSchema>
): Promise<ActionResult<{ id: string }>> {
  const validated = productSchema.parse(formData);
  const externalId = validated.externalId ?? crypto.randomUUID();
  const product = await prisma.product.create({
    data: {
      externalId,
      name: validated.name,
      description: validated.description || null,
      price: validated.price,
      category: validated.category,
      images: validated.images,
      isActive: validated.isActive,
    },
    select: { id: true },
  });
  // ...existing revalidate calls
}

export async function updateProduct(
  formData: z.infer<typeof updateProductSchema>
): Promise<ActionResult<{ id: string }>> {
  const validated = updateProductSchema.parse(formData);
  const { id, ...data } = validated;
  const product = await prisma.product.update({
    where: { id },
    data: {
      externalId: data.externalId,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      images: data.images,
      isActive: data.isActive,
    },
    select: { id: true },
  });
  // ...existing revalidate calls
}
```

Also update product queries to select `externalId` where needed (admin edit flow uses full product shape):

```ts
// inside getProducts select
externalId: true,
```

**Step 6: Add External ID input to admin form**

Edit `components/admin/product-form.tsx`:

```tsx
const productFormSchema = z.object({
  externalId: z.string().min(1).max(64).optional(),
  // ...existing fields
});

// inside form JSX
<div className="space-y-2">
  <Label htmlFor="externalId">Mã hàng</Label>
  <Input
    id="externalId"
    placeholder="ví dụ: SKU-001"
    disabled={isPending}
    {...form.register("externalId")}
  />
  {form.formState.errors.externalId && (
    <p className="text-sm text-red-500">{form.formState.errors.externalId.message}</p>
  )}
</div>
```

**Step 7: Quick schema validation**

Run:

```bash
npx prisma validate
```

Expected: `The schema is valid`.

**Step 8: Commit**

```bash
git add prisma/schema.prisma prisma/migrations types/index.ts lib/actions.ts components/admin/product-form.tsx
git commit -m "feat: add external_id column and wire externalId through admin"
```

---

### Task 2: Add Excel import parsing utility + tests

**Files:**
- Create: `lib/import-products.ts`
- Test: `__tests__/lib/import-products.test.ts`

**Step 1: Write failing tests for parsing and validation**

`__tests__/lib/import-products.test.ts`:

```ts
import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { MAX_IMPORT_ROWS, parseProductImportSheet } from "@/lib/import-products";

async function workbookBuffer(rows: Array<Array<string | number | boolean | null>>) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Products");
  rows.forEach((row) => sheet.addRow(row));
  return workbook.xlsx.writeBuffer();
}

async function emptyWorkbookBuffer() {
  const workbook = new ExcelJS.Workbook();
  workbook.addWorksheet("Products");
  return workbook.xlsx.writeBuffer();
}

describe("parseProductImportSheet", () => {
  it("parses valid rows", async () => {
    const buffer = await workbookBuffer([
      ["external_id", "name", "price", "category", "images", "description", "isActive"],
      ["SKU-001", "Binh gom", 100000, "Decor", "https://a.com/1.jpg, https://a.com/2.jpg", "Mo ta", "true"],
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      externalId: "SKU-001",
      name: "Binh gom",
      price: 100000,
      category: "Decor",
      images: ["https://a.com/1.jpg", "https://a.com/2.jpg"],
      description: "Mo ta",
      isActive: true,
    });
  });

  it("accepts case-insensitive headers", async () => {
    const buffer = await workbookBuffer([
      ["EXTERNAL_ID", "NAME", "PRICE", "CATEGORY", "IMAGES"],
      ["SKU-002", "Binh", 120000, "Decor", "https://a.com/1.jpg"],
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.errors).toEqual([]);
    expect(result.rows[0].externalId).toBe("SKU-002");
  });

  it("reports duplicate external_id in file", async () => {
    const buffer = await workbookBuffer([
      ["external_id", "name", "price", "category", "images"],
      ["SKU-003", "A", 1000, "Decor", "https://a.com/1.jpg"],
      ["SKU-003", "B", 2000, "Decor", "https://a.com/2.jpg"],
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.rows).toHaveLength(1);
    expect(result.errors[0].messages[0]).toMatch(/duplicate/i);
  });

  it("errors on empty worksheet", async () => {
    const buffer = await emptyWorkbookBuffer();

    const result = await parseProductImportSheet(buffer);

    expect(result.rows).toHaveLength(0);
    expect(result.errors[0].messages[0]).toMatch(/header/i);
  });

  it("errors on corrupted file", async () => {
    const buffer = new Uint8Array([1, 2, 3]).buffer;

    const result = await parseProductImportSheet(buffer);

    expect(result.rows).toHaveLength(0);
    expect(result.errors[0].messages[0]).toMatch(/corrupted|invalid/i);
  });

  it("enforces max row limit", async () => {
    const rows = Array.from({ length: MAX_IMPORT_ROWS + 1 }, (_, index) => [
      `SKU-${index}`,
      "Name",
      1000,
      "Decor",
      "https://a.com/1.jpg",
    ]);

    const buffer = await workbookBuffer([
      ["external_id", "name", "price", "category", "images"],
      ...rows,
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.rows).toHaveLength(0);
    expect(result.errors[0].messages[0]).toMatch(/max/i);
  });

  it("reports validation errors with row numbers", async () => {
    const buffer = await workbookBuffer([
      ["external_id", "name", "price", "category", "images"],
      ["", "", -1, "", "not-a-url"],
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.rows).toHaveLength(0);
    expect(result.errors[0].row).toBe(2);
    expect(result.errors[0].messages.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run the test to confirm failure**

Run:

```bash
npx vitest __tests__/lib/import-products.test.ts
```

Expected: FAIL with `parseProductImportSheet is not a function`.

**Step 3: Implement parsing utility**

`lib/import-products.ts`:

```ts
import ExcelJS from "exceljs";
import { z } from "zod";

export const MAX_IMPORT_ROWS = 1000;

const importRowSchema = z.object({
  externalId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().positive(),
  category: z.string().min(1),
  images: z
    .array(
      z
        .string()
        .url()
        .refine((url) => url.startsWith("https://"), "Image URLs must use https")
    )
    .min(1),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type ImportRow = z.infer<typeof importRowSchema>;

export type ImportRowError = {
  row: number;
  messages: string[];
};

const headerMap: Record<string, keyof ImportRow> = {
  "external_id": "externalId",
  "externalid": "externalId",
  "name": "name",
  "price": "price",
  "category": "category",
  "images": "images",
  "description": "description",
  "isactive": "isActive",
};

const requiredHeaders: Array<keyof ImportRow> = [
  "externalId",
  "name",
  "price",
  "category",
  "images",
];

function normalizeHeader(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function parseImages(value: unknown) {
  return String(value ?? "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value: unknown) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;
  return true;
}

export async function parseProductImportSheet(buffer: ArrayBuffer) {
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.load(buffer);
  } catch (error) {
    return {
      rows: [],
      errors: [{ row: 0, messages: ["Invalid or corrupted .xlsx file"] }],
    };
  }

  const sheet = workbook.worksheets[0];

  if (!sheet) {
    return { rows: [], errors: [{ row: 0, messages: ["Missing worksheet"] }] };
  }

  const headerRow = sheet.getRow(1);
  const headerCells = headerRow.values.slice(1);

  if (headerCells.length === 0) {
    return { rows: [], errors: [{ row: 1, messages: ["Missing header row"] }] };
  }

  const headers = headerCells
    .map((cell) => headerMap[normalizeHeader(cell)])
    .filter(Boolean) as Array<keyof ImportRow>;

  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          messages: [`Missing required columns: ${missingHeaders.join(", ")}`],
        },
      ],
    };
  }

  const dataRowCount = Math.max(0, sheet.actualRowCount - 1);
  if (dataRowCount > MAX_IMPORT_ROWS) {
    return {
      rows: [],
      errors: [
        {
          row: 0,
          messages: [`Max ${MAX_IMPORT_ROWS} rows allowed`],
        },
      ],
    };
  }

  const rows: ImportRow[] = [];
  const errors: ImportRowError[] = [];
  const seen = new Set<string>();

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const values = row.values as Array<unknown>;
    const record: Record<string, unknown> = {};

    headers.forEach((key, index) => {
      const cellValue = values[index + 1];
      if (key === "images") record.images = parseImages(cellValue);
      else if (key === "price") record.price = Number(cellValue);
      else if (key === "isActive") record.isActive = parseBoolean(cellValue);
      else record[key] = String(cellValue ?? "").trim();
    });

    const parsed = importRowSchema.safeParse(record);
    if (!parsed.success) {
      errors.push({
        row: rowNumber,
        messages: parsed.error.issues.map((issue) => issue.message),
      });
      return;
    }

    if (seen.has(parsed.data.externalId)) {
      errors.push({ row: rowNumber, messages: ["Duplicate external_id in file"] });
      return;
    }

    seen.add(parsed.data.externalId);
    rows.push(parsed.data);
  });

  return { rows, errors };
}
```

**Step 4: Run tests to verify pass**

```bash
npx vitest __tests__/lib/import-products.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add lib/import-products.ts __tests__/lib/import-products.test.ts
git commit -m "feat: add Excel import parser with validation"
```

---

### Task 3: Implement bulk upsert server action

**Files:**
- Modify: `lib/actions.ts`
- (Optional) Test: `__tests__/lib/import-actions.test.ts`

**Step 1: Write failing tests for authorization and limits (optional)**

`__tests__/lib/import-actions.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { bulkUpsertProducts } from "@/lib/actions";

const authMock = vi.fn();
const clerkClientMock = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock,
  clerkClient: clerkClientMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { product: { findMany: vi.fn(), upsert: vi.fn() }, $transaction: vi.fn() },
}));

describe("bulkUpsertProducts", () => {
  it("returns an error when file is missing", async () => {
    authMock.mockResolvedValue({ userId: "user_1" });
    clerkClientMock.mockResolvedValue({
      users: { getUser: vi.fn().mockResolvedValue({ emailAddresses: [{ emailAddress: "admin@example.com" }] }) },
    });

    const result = await bulkUpsertProducts(new FormData());
    expect(result.success).toBe(false);
  });

  it("rejects when user is not admin", async () => {
    authMock.mockResolvedValue({ userId: null });

    const formData = new FormData();
    formData.append("file", new File(["x"], "products.xlsx"));

    const result = await bulkUpsertProducts(formData);
    expect(result.success).toBe(false);
  });

  it("rejects oversized files", async () => {
    authMock.mockResolvedValue({ userId: "user_1" });
    clerkClientMock.mockResolvedValue({
      users: { getUser: vi.fn().mockResolvedValue({ emailAddresses: [{ emailAddress: "admin@example.com" }] }) },
    });

    const bigFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "products.xlsx");
    const formData = new FormData();
    formData.append("file", bigFile);

    const result = await bulkUpsertProducts(formData);
    expect(result.success).toBe(false);
  });
});
```

**Step 2: Run the test to confirm failure**

```bash
npx vitest __tests__/lib/import-actions.test.ts
```

Expected: FAIL because `bulkUpsertProducts` does not exist yet.

**Step 3: Implement server action**

Edit `lib/actions.ts`:

```ts
import { auth, clerkClient } from "@clerk/nextjs/server";
import { parseProductImportSheet } from "@/lib/import-products";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export async function bulkUpsertProducts(
  formData: FormData
): Promise<ActionResult<{ created: number; updated: number; errors: Array<{ row: number; messages: string[] }> }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase() || "";
    if (!ADMIN_EMAILS.includes(userEmail)) {
      return { success: false, error: "Unauthorized" };
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { success: false, error: "File is required" };
    }

    if (file.size > MAX_IMPORT_BYTES) {
      return { success: false, error: "File too large (max 5MB)" };
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return { success: false, error: "Only .xlsx files are supported" };
    }

    const buffer = await file.arrayBuffer();
    const { rows, errors } = await parseProductImportSheet(buffer);

    if (rows.length === 0) {
      return {
        success: false,
        error: errors[0]?.messages[0] || "No valid rows to import",
      };
    }

    const externalIds = rows.map((row) => row.externalId);
    const existing = await prisma.product.findMany({
      where: { externalId: { in: externalIds } },
      select: { externalId: true },
    });
    const existingSet = new Set(existing.map((row) => row.externalId));

    await prisma.$transaction(
      rows.map((row) =>
        prisma.product.upsert({
          where: { externalId: row.externalId },
          create: {
            externalId: row.externalId,
            name: row.name,
            description: row.description ?? null,
            price: row.price,
            category: row.category,
            images: row.images,
            isActive: row.isActive,
          },
          update: {
            name: row.name,
            description: row.description ?? null,
            price: row.price,
            category: row.category,
            images: row.images,
            isActive: row.isActive,
          },
        })
      )
    );

    const created = rows.filter((row) => !existingSet.has(row.externalId)).length;
    const updated = rows.length - created;

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidateTag("categories");
    revalidateTag("products");

    return { success: true, data: { created, updated, errors } };
  } catch (error) {
    console.error("Bulk import failed:", error);
    return { success: false, error: "Bulk import failed" };
  }
}
```

**Step 4: Re-run tests**

```bash
npx vitest __tests__/lib/import-actions.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add lib/actions.ts __tests__/lib/import-actions.test.ts
git commit -m "feat: add bulk upsert products server action"
```

---

### Task 4: Add Excel template download (server-generated)

**Files:**
- Create: `lib/product-import-template.ts`
- Create: `app/api/admin/products/template/route.ts`
- Test: `__tests__/lib/product-import-template.test.ts`

**Step 1: Write failing test for template generation**

`__tests__/lib/product-import-template.test.ts`:

```ts
import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { createProductImportTemplate } from "@/lib/product-import-template";

describe("createProductImportTemplate", () => {
  it("creates a workbook with required headers", async () => {
    const buffer = await createProductImportTemplate();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.worksheets[0];

    const headers = sheet.getRow(1).values.slice(1);
    expect(headers).toEqual([
      "external_id",
      "name",
      "price",
      "category",
      "images",
      "description",
      "isActive",
    ]);
  });
});
```

**Step 2: Run the test to confirm failure**

```bash
npx vitest __tests__/lib/product-import-template.test.ts
```

Expected: FAIL because `createProductImportTemplate` does not exist yet.

**Step 3: Implement template generator**

`lib/product-import-template.ts`:

```ts
import ExcelJS from "exceljs";

const TEMPLATE_HEADERS = [
  "external_id",
  "name",
  "price",
  "category",
  "images",
  "description",
  "isActive",
];

export async function createProductImportTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Products");
  sheet.addRow(TEMPLATE_HEADERS);
  sheet.addRow([
    "SKU-001",
    "Binh gom",
    100000,
    "Decor",
    "https://example.com/image.jpg",
    "Mo ta",
    "true",
  ]);
  return workbook.xlsx.writeBuffer();
}
```

**Step 4: Run tests to verify pass**

```bash
npx vitest __tests__/lib/product-import-template.test.ts
```

Expected: PASS.

**Step 5: Create the template download route**

`app/api/admin/products/template/route.ts`:

```ts
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createProductImportTemplate } from "@/lib/product-import-template";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase() || "";
  if (!ADMIN_EMAILS.includes(userEmail)) {
    return new Response("Unauthorized", { status: 403 });
  }

  const buffer = await createProductImportTemplate();
  return new Response(Buffer.from(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"products-import-template.xlsx\"",
      "Cache-Control": "no-store",
    },
  });
}
```

**Step 6: Commit**

```bash
git add lib/product-import-template.ts app/api/admin/products/template/route.ts __tests__/lib/product-import-template.test.ts
git commit -m "feat: add Excel import template download"
```

---

### Task 5: Add admin import UI (sheet + buttons)

**Files:**
- Create: `components/admin/product-import-sheet.tsx`
- Modify: `app/admin/products/page.tsx`

**Step 1: Create the import sheet component**

`components/admin/product-import-sheet.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { bulkUpsertProducts } from "@/lib/actions";
import { toast } from "sonner";

export function ProductImportSheet() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Array<{ row: number; messages: string[] }>>([]);
  const [isPending, startTransition] = useTransition();

  const action = searchParams.get("action");
  const isOpen = action === "import";

  const handleClose = useCallback(() => {
    router.push("/admin/products");
  }, [router]);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setErrors([]);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!file) {
      toast.error("Hãy chọn file .xlsx");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await bulkUpsertProducts(formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setErrors(result.data.errors ?? []);
      toast.success(`Đã nhập ${result.data.created} mới, cập nhật ${result.data.updated}`);
      router.refresh();
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0" onClick={handleClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl bg-background border-l shadow-lg animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="flex items-start justify-between gap-4 p-4 border-b">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Nhập sản phẩm từ Excel</h2>
            <p className="text-sm text-muted-foreground">Tải file .xlsx theo mẫu cột yêu cầu (tối đa 5MB, 1000 dòng).</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Đóng</span>
          </Button>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <Input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Đang nhập..." : "Bắt đầu nhập"}
          </Button>

          {errors.length > 0 && (
            <div className="border rounded-lg p-3">
              <p className="text-sm font-medium mb-2">Lỗi dữ liệu</p>
              <ScrollArea className="h-48">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {errors.map((error) => (
                    <li key={`${error.row}-${error.messages.join("-")}`}>
                      Dòng {error.row}: {error.messages.join(", ")}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
```

**Step 2: Add import button and sheet to Products page**

Edit `app/admin/products/page.tsx`:

```tsx
import { ProductImportSheet } from "@/components/admin/product-import-sheet";

// inside header actions
<div className="flex items-center gap-2">
  <Button variant="outline" asChild>
    <a href="/api/admin/products/template">Tải mẫu Excel</a>
  </Button>
  <Button variant="outline" asChild>
    <Link href="/admin/products?action=import">Nhập Excel</Link>
  </Button>
  <Button asChild className="gap-2">
    <Link href="/admin/products?action=new">
      <Plus className="h-4 w-4" />
      Thêm sản phẩm
    </Link>
  </Button>
</div>

// near the end of page
<Suspense fallback={null}>
  <ProductFormSheet products={products} categories={categories} />
</Suspense>
<Suspense fallback={null}>
  <ProductImportSheet />
</Suspense>
```

**Step 3: Manual verification**

Run:

```bash
npm test
```

Expected: all existing tests pass.

**Step 4: Commit**

```bash
git add components/admin/product-import-sheet.tsx app/admin/products/page.tsx
git commit -m "feat: add admin Excel import UI"
```

---

### Task 6: Document import template for admins

**Files:**
- Create: `docs/admin-products-import.md`

**Step 1: Write the import template doc**

```md
# Admin Product Import Template

**Required columns:**
- `external_id` (unique, used for upsert - displayed as "Mã hàng" in UI)
- `name`
- `price` (integer VND)
- `category`
- `images` (comma or newline-separated HTTPS URLs)

**Optional columns:**
- `description`
- `isActive` (true/false, 1/0, yes/no)

**Limits:**
- 5MB max file size
- 1000 data rows max

**Template download:**
- Admin UI provides a \"Tải mẫu Excel\" button to download the latest template.
```

**Step 2: Commit**

```bash
git add docs/admin-products-import.md
git commit -m "docs: add admin product import template"
```

---

### Final Verification

Run:

```bash
npm test
```

Expected: 2 test files passed, 41 tests passed.
