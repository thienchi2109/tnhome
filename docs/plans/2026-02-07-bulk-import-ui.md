# Plan: Add Bulk Import UI to Admin Products Page

## Context

The bulk import backend is fully implemented (Excel parser in `lib/import-products.ts`, server action `bulkUpsertProducts` in `lib/actions.ts`, comprehensive tests). However, **no frontend UI was ever built** — Tasks 4-5 from the original plan (`docs/plans/2026-01-26-admin-products-bulk-import.md`) were never executed. An admin currently has no way to trigger bulk import through the application.

**Goal:** Build the missing import UI so admins can upload `.xlsx` files and see results.

---

## Step 1: Create template generator — `lib/product-import-template.ts`

**~40 lines.** Generates a downloadable `.xlsx` with correct headers + example row.

```typescript
export async function createProductImportTemplate(): Promise<ArrayBuffer>
```

- Headers: `external_id`, `name`, `price`, `category`, `images`, `description`, `isActive`
- Must match `headerMap` in `lib/import-products.ts` exactly
- Bold header row with light fill, proportional column widths
- One example data row for reference
- Uses `exceljs` (already installed)

---

## Step 2: Create template download route — `app/api/admin/products/template/route.ts`

**~40 lines.** First API route in the project (creates `app/api/` directory tree).

- `GET` handler with Clerk auth + admin email check (same pattern as `lib/actions.ts` lines 672-686)
- Returns `Response` with Content-Type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition attachment filename `tn-home-import-template.xlsx`
- `Cache-Control: no-store`
- 401 for unauthenticated, 403 for non-admin

---

## Step 3: Create import sheet component — `components/admin/product-import-sheet.tsx`

**~250 lines.** Right slide-in panel matching `ProductFormSheet` pattern exactly.

### Pattern (from `components/admin/product-form-sheet.tsx`):
- URL-driven: `?action=import` opens, navigate to `/admin/products` closes
- Backdrop: `fixed inset-0 z-50 bg-black/50 animate-in fade-in-0`
- Panel: `fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl` slide-in-from-right
- Escape key handler via `useEffect` + `document.addEventListener`
- Body scroll lock via `document.body.style.overflow`
- Reset state on close

### UX States:

**State 1 — File Selection (initial):**
- Drag-and-drop zone with dashed border (`border-2 border-dashed rounded-xl`)
- `Upload` icon, "Kéo thả file Excel vào đây" text, "hoặc" divider
- "Chọn file" outline button triggering hidden `<input type="file" accept=".xlsx">`
- Constraint text: "Chỉ nhận file .xlsx (tối đa 5MB, 1.000 dòng)"
- Drag-active state: `border-primary bg-primary/5`

**State 2 — File Selected:**
- File card: `FileSpreadsheet` icon (green-600) + filename + size + remove `X` button
- "Bắt đầu nhập" primary button enabled
- Drop zone hidden, file card replaces it

**State 3 — Uploading (`isPending`):**
- Button disabled with `Loader2 animate-spin` + "Đang nhập..."
- Remove button disabled
- Close button still accessible

**State 4 — Success:**
- Green banner (`rounded-xl border-green-200 bg-green-50`): `CheckCircle2` icon + "Nhập thành công"
- Stats: "Tạo mới: X" / "Cập nhật: Y"
- If partial errors: amber warning section with `ScrollArea h-40` listing row errors (cap at 50 displayed, show "...và N lỗi khác" if more)
- "Đóng" button to dismiss
- Toast notification via Sonner

**State 5 — Error:**
- Red banner: `AlertCircle` icon + error message from server
- "Thử lại" button resets to State 1
- Toast error notification

### Submit handler pattern (must follow exactly):
```typescript
const [isPending, startTransition] = useTransition();

function handleImport() {
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);

  startTransition(async () => {
    try {
      const result = await bulkUpsertProducts(formData);
      if (result.success) {
        setResult(result.data);
        toast.success(`Đã nhập ${result.data.created} mới, cập nhật ${result.data.updated}`);
        router.refresh(); // refresh server component data behind sheet
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
      toast.error("Lỗi kết nối");
    }
  });
}
```
- `startTransition` wraps the async call (drives `isPending` for button state)
- try/catch handles network failures gracefully
- `router.refresh()` on success ensures products table shows fresh data

### Footer:
- Template download link: `<a href="/api/admin/products/template" download>` with `Download` icon + "Tải mẫu Excel"
- Pinned at bottom via `border-t p-4`

### Accessibility (from UI/UX + web guidelines review):
- `role="alert"` on error and success banners (screen reader announcement)
- `aria-label` on all icon-only buttons (close, remove file)
- `<label>` wrapping the hidden file input (accessible name)
- `role="presentation"` on drag-drop zone div (accessible fallback is the "Chọn file" button)
- Focus management: auto-focus drop zone on open
- Color + icon for all status indicators (never color alone)
- `disabled={isPending}` on submit button (prevent double submission)
- Error list uses `<ul>` with semantic `<li>` elements

### Imports (reuse existing):
- `Button` from `@/components/ui/button`
- `ScrollArea` from `@/components/ui/scroll-area`
- `bulkUpsertProducts` from `@/lib/actions`
- `toast` from `sonner`
- `cn` from `@/lib/utils`
- Icons: `Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Download` from `lucide-react`

---

## Step 4: Wire into admin products page — `app/admin/products/page.tsx`

### Changes:

**4a. Add imports (lines 6, 12-13 area):**
- Add `Upload, Download` to lucide-react imports
- Add `import { ProductImportSheet } from "@/components/admin/product-import-sheet"`

**4b. Replace single button with button group (lines 71-76):**

Replace:
```tsx
<Button asChild className="gap-2">
  <Link href="/admin/products?action=new">
    <Plus className="h-4 w-4" />
    Thêm sản phẩm
  </Link>
</Button>
```

With:
```tsx
<div className="flex flex-wrap items-center gap-2">
  <Button variant="outline" size="sm" asChild>
    <a href="/api/admin/products/template" download>
      <Download className="mr-1.5 h-4 w-4" />
      Tải mẫu
    </a>
  </Button>
  <Button variant="outline" size="sm" asChild>
    <Link href="/admin/products?action=import">
      <Upload className="mr-1.5 h-4 w-4" />
      Nhập Excel
    </Link>
  </Button>
  <Button asChild className="gap-2">
    <Link href="/admin/products?action=new">
      <Plus className="h-4 w-4" />
      Thêm sản phẩm
    </Link>
  </Button>
</div>
```

Note: `flex-wrap` prevents overflow on mobile (iPhone 375px). Buttons wrap to second row when needed.

**4c. Add ProductImportSheet after ProductFormSheet (after line 212):**
```tsx
<Suspense fallback={null}>
  <ProductImportSheet />
</Suspense>
```

Note: `searchParams` interface already includes `action?: string` — no change needed.

---

## Step 5: Add template test — `__tests__/lib/product-import-template.test.ts`

**~30 lines.** Verify template generation:
- Returned buffer is valid XLSX
- Headers match expected 7 columns in correct order
- Example data row exists at row 2

---

## Verification

1. `npm.cmd run test:run` — all tests pass (existing + new template test)
2. `npm.cmd run type-check` — no TypeScript errors
3. `npm.cmd run lint` — no lint errors
4. Manual: visit `/admin/products`, verify 3 buttons appear (Tải mẫu, Nhập Excel, Thêm sản phẩm)
5. Manual: click "Nhập Excel" → sheet opens, upload `.xlsx` → results display
6. Manual: click "Tải mẫu" → downloads template file

---

## Critical Files

| File | Action | Purpose |
|------|--------|---------|
| `lib/product-import-template.ts` | CREATE | Template generator |
| `app/api/admin/products/template/route.ts` | CREATE | Template download endpoint |
| `components/admin/product-import-sheet.tsx` | CREATE | Import UI sheet |
| `app/admin/products/page.tsx` | MODIFY | Wire buttons + sheet |
| `__tests__/lib/product-import-template.test.ts` | CREATE | Template test |
| `components/admin/product-form-sheet.tsx` | REFERENCE | Pattern to follow |
| `lib/actions.ts` (lines 666-765) | REFERENCE | `bulkUpsertProducts` action |
| `lib/import-products.ts` | REFERENCE | Header names for template |
