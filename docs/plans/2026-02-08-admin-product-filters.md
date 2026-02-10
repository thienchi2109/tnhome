# Plan: Admin Products Search & Filtering (Server-Side)

## Context

The admin products page (`app/admin/products/page.tsx`) has no search or filtering — it shows all products with only pagination. The storefront already has server-side search and filtering via URL params → Server Component → Prisma `where` clause. The goal is to add search + category filter + status filter to the admin page, all server-side, following existing patterns.

## Changes (4 files: 1 new, 3 modified)

### 1. Add `AdminProductFilterOptions` type
**File:** `lib/actions/types.ts` (+5 lines)

```typescript
export interface AdminProductFilterOptions {
  search?: string;
  categories?: string[];   // multi-select, comma-separated in URL as ?category=A,B,C
  status?: "active" | "inactive"; // undefined = all
}
```

Separate from storefront's `ProductFilterOptions` because admin needs `status` toggle, while storefront uses `minPrice`, `maxPrice` and always filters `isActive: true`. Both now use `categories: string[]` for multi-category filtering.

### 2. Add filters to `getProducts()`
**File:** `lib/actions/product-actions.ts` (~20 lines changed at lines 178-235)

- Add second parameter: `filters?: AdminProductFilterOptions`
- Build a `whereClause` (same spread pattern as `getActiveProductsPaginated()` lines 281-303):
  - `search` → `OR: [{ name: contains, insensitive }, { description: contains, insensitive }]`
  - `categories` → `{ category: { in: filters.categories } }` (multi-select, Prisma `in` operator)
  - `status: "active"` → `{ isActive: true }`, `"inactive"` → `{ isActive: false }`, `undefined` → no clause (all)
- Pass `whereClause` to both `prisma.product.count({ where })` and `prisma.product.findMany({ where, ... })`
- Backwards-compatible: optional param, single call site

### 3. Create `AdminProductFilters` component
**File:** `components/admin/admin-product-filters.tsx` (NEW, ~193 lines)

Client component with horizontal toolbar containing:
- **Search input**: Debounced 400ms via `useDebouncedCallback` (from `use-debounce`, already installed). Updates `?q=` URL param. Clear button when active.
- **Category multi-select**: `DropdownMenu` with `DropdownMenuCheckboxItem` for each category. Values from `categories` prop (already fetched via `getAllCategories()`). Updates `?category=` param as comma-separated string. Trigger shows count badge when >1 selected. Menu stays open on item click (`onSelect: e.preventDefault()`).
- **Status select**: shadcn `Select` with: Tất cả / Đang bán / Ngừng bán. Updates `?status=` param.
- **Clear filters button**: Shown when any filter is active. Strips all filter params.
- All filter changes reset `?page=` to 1.
- Uses `usePathname()` for navigation (not hardcoded path).
- Uses `router.push()` (not `replace`), consistent with storefront.

### 4. Wire filters into admin products page
**File:** `app/admin/products/page.tsx` (~25 lines changed)

- Extend `searchParams` type with `q?`, `category?`, `status?`
- Extract and sanitize filter values:
  ```typescript
  const filterCategories = params.category
    ? params.category.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20)
    : undefined;
  const filterOptions = {
    search: params.q?.trim().slice(0, 100) || undefined,
    categories: filterCategories && filterCategories.length > 0 ? filterCategories : undefined,
    status: (params.status === "active" || params.status === "inactive")
      ? params.status : undefined,
  };
  ```
- Pass `filterOptions` to `getProducts(paginationParams, filterOptions)`
- Render `<AdminProductFilters categories={categories} />` between header actions and table
- Update empty state: distinguish "no products exist" vs "no products match filters"

### No changes needed
- **`pagination-nav.tsx`** — Already preserves all searchParams when paginating
- **`filter-schema.ts`** — Admin filtering validated inline (no Zod schema needed)
- **`filter-search-input.tsx`** — Storefront component stays untouched
- **`lib/actions/index.ts`** — Export unchanged (optional param is backwards-compatible)

## Review Notes (from code review)

- **Search sanitization**: `.trim().slice(0, 100)` applied in the page component to cap input length
- **Category sanitization**: `.split(",")` + `.slice(0, 20)` caps to 20 categories max
- **Status validation**: Explicit guard ensures only `"active"` | `"inactive"` pass through; anything else becomes `undefined` (safe default = show all)
- **URL param name**: Uses `q` (consistent with storefront), not `search` (used by orders page). Deliberate choice for storefront consistency.
- **Edit/action params**: Existing `?edit=` and `?action=` links may drop filter params. Known limitation — not in scope for this plan.

## Verification

1. Navigate to `/admin/products` — should show all products (same as current)
2. Type in search box — after 400ms, URL updates to `?q=...`, table filters, count updates
3. Check multiple categories — URL updates to `?category=A,B`, table filters to matching
4. Uncheck a category — URL updates, table adjusts
5. Select "Đang bán" or "Ngừng bán" — URL updates to `?status=active|inactive`, table filters
6. Combine search + categories + status — all filters apply together (AND logic)
7. Paginate while filtered — filters persist in URL
8. Click "Clear filters" — all filter params removed, full list shown
9. Browser back/forward — filters restore correctly
10. Run `npm.cmd run type-check` — no TypeScript errors
