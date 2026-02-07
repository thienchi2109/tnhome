# Plan: Centralize Pagination into Shared Component

## Context

Two pagination components exist with duplicated logic but different UI needs:
- `components/store/store-pagination.tsx` (147 lines) — storefront: fancy styling, loading bar, total items count, `router.push` + `useTransition`
- `components/admin/products-pagination.tsx` (124 lines) — admin: compact, page size selector, `<Link>` tags

Both share identical core logic: URL param manipulation, boundary checks, page indicator. The goal is to extract this into a single variant-based component, eliminating ~120 lines of duplication.

## Approach: Variant-Based with Hybrid Navigation

A single `<PaginationNav>` component with a `variant` prop (`"store"` | `"admin"`) that controls visual style and navigation strategy.

## Implementation Steps

### Phase 1: Create Component (sequential sub-tasks)

#### 1a. Props interface + shared logic skeleton
**File:** `components/ui/pagination-nav.tsx`

```typescript
interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  variant?: "store" | "admin";  // default: "store"
  totalItems?: number;          // Shows count caption (store variant)
  pageSize?: number;            // Enables page size selector (admin variant)
  pageSizeOptions?: { value: string; label: string }[];
  ariaLabel?: string;           // default: "Phân trang"
}
```

**Shared logic inside the component:**
- `useSearchParams()` + `usePathname()` for URL building (both variants use absolute paths)
- `createPageUrl(page, newPageSize?)` — merges page into existing search params; **omits `page` param when page=1** for clean URLs (intentional normalization — admin previously always set `page=1`, this is safe because `normalizePaginationParams` in `lib/constants.ts:22-26` defaults missing page to 1)
- `canGoPrev` / `canGoNext` boundary checks
- Early return `null` when `totalPages <= 1`

#### 1b. Store variant rendering
- `useRouter()` + `useTransition()` for navigation
- **`{ scroll: false }`** on `router.push` (preserves current behavior — users stay at scroll position)
- `aria-live` region for screen reader announcements (gracefully omits item count when `totalItems` is undefined)
- Rounded-full prev/next buttons with chevron hover animation
- Center "Trang X / Y" indicator
- Total items caption below (only when `totalItems` provided)
- Animated gradient loading bar when `isPending`

#### 1c. Admin variant rendering
- `<Link>` for prev/next buttons (prefetchable)
- `useRouter()` **only** for page-size `<Select>` `onValueChange` handler (Select doesn't render links, so `router.push` is required here)
- shadcn `Button variant="outline"` for prev/next
- Helper pattern to avoid JSX duplication for enabled/disabled Link buttons:
  ```tsx
  // Disabled: plain Button; Enabled: Button asChild wrapping Link
  disabled ? <Button disabled> : <Button asChild><Link href={...}>
  ```
- `PAGE_SIZE_OPTIONS` default constant (exported from `lib/constants.ts` for reuse)
- "Trang X / Y" text center
- No loading bar

#### 1d. Integration + compile check
- Combine 1b and 1c into variant conditional rendering
- Verify with `npm.cmd run type-check`
- Estimated total: **~195 lines** (well within 350-line limit)

### Phase 2: Swap Consumers (parallel — Steps 2 and 3 are independent)

#### Step 2: Update Store Products Page
**File:** `app/(store)/products/page.tsx`
- Line 3: Change import from `store-pagination` → `@/components/ui/pagination-nav`
- Lines 191-197: Replace `<StorePagination>` with `<PaginationNav variant="store">`
- **Remove** the outer `pagination.totalPages > 1` guard (redundant — component handles this internally)

#### Step 3: Update Admin Products Page
**File:** `app/admin/products/page.tsx`
- Line 14: Change import from `products-pagination` → `@/components/ui/pagination-nav`
- Lines 217-221: Replace `<ProductsPagination>` with `<PaginationNav variant="admin" pageSize={pagination.pageSize}>`

### Phase 3: Cleanup (after Phase 2)

#### Step 4: Delete Old Components (parallel)
- Delete `components/store/store-pagination.tsx`
- Delete `components/admin/products-pagination.tsx`

#### Step 4.5: Move `PAGE_SIZE_OPTIONS` to constants
**File:** `lib/constants.ts`
- Export `PAGE_SIZE_OPTIONS` array alongside existing `STORE_PAGE_SIZE` and `normalizePaginationParams`

### Phase 4: Verification (parallel where possible)

| Check | Command | Depends On |
|-------|---------|------------|
| V1: TypeScript | `npm.cmd run type-check` | All steps complete |
| V2: Lint | `npm.cmd run lint` | All steps complete |
| V3: Dead refs | Grep for `store-pagination` and `products-pagination` | Step 4 |
| V4: Store test | Manual: navigate `/products`, test prev/next, verify loading bar + total count | Step 2 |
| V5: Admin test | Manual: navigate `/admin/products`, test prev/next + page size selector | Step 3 |
| V6: Clean URLs | Verify page 1 has no `?page=1` in URL (both variants) | Steps 2+3 |

V1+V2+V3 can run in parallel. V4+V5 can run in parallel.

## Execution Parallelism Summary

```
Phase 1 (sequential): 1a → 1b → 1c → 1d
Phase 2 (parallel):   [Step 2] || [Step 3]
Phase 3 (parallel):   [Step 4: delete old] || [Step 4.5: move constant]
Phase 4 (parallel):   [V1 + V2 + V3] || [V4 + V5 + V6]
```

Critical path: Phase 1 (~80% of effort) → Phase 2 → Phase 3 → Phase 4

## Files to Modify

| File | Action |
|------|--------|
| `components/ui/pagination-nav.tsx` | **Create** — unified pagination component (~195 lines) |
| `lib/constants.ts` | **Edit** — export `PAGE_SIZE_OPTIONS` |
| `app/(store)/products/page.tsx` | **Edit** — swap import + usage (lines 3, 191-197) |
| `app/admin/products/page.tsx` | **Edit** — swap import + usage (lines 14, 217-221) |
| `components/store/store-pagination.tsx` | **Delete** |
| `components/admin/products-pagination.tsx` | **Delete** |

## Reusable Existing Code

- `cn()` from `lib/utils.ts` — class merging
- `Button`, `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `components/ui/`
- `ChevronLeft`, `ChevronRight` from `lucide-react`
- `normalizePaginationParams()` from `lib/constants.ts` — already handles missing `page` param (defaults to 1)

## Behavioral Changes (Intentional)

1. **Admin URLs normalized**: `page=1` param will be omitted from admin URLs (was always included before). Safe — `normalizePaginationParams` handles this.
2. **Store URL construction**: Now uses `usePathname()` for absolute paths (was relative `?page=2` before). Functionally equivalent for `router.push`.
3. **Redundant guard removed**: Store consumer's `pagination.totalPages > 1` check removed — component handles internally.
