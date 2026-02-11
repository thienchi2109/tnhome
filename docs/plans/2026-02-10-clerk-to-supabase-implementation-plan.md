# Plan: Migrate Clerk → Supabase Auth (Google OAuth)

## Context

Clerk authentication adds deployment complexity — custom domain config, OAuth credential routing, JS CDN fallback hacks (`clerk-provider-options.ts`), and external API calls (`clerkClient().users.getUser()`) on every admin request. Migrating to Supabase Cloud Auth (managed, free tier, auth-only) simplifies deployment, eliminates external API calls in the hot path, and removes 2 dependencies + 4 Clerk-specific files.

**Source plan:** `docs/plans/2026-02-09-clerk-to-supabase-auth-migration.md`
**Stack:** Next.js 16.1.6, React 19, Prisma 6, Tailwind v4, shadcn/ui

---

## Phase 0: Supabase Cloud Setup (Manual Preflight — BLOCKING)

> Must be completed before any code changes. Code will not work without this.

1. Create Supabase project at `supabase.com/dashboard` (free tier)
2. Enable Google provider: Authentication → Providers → Google
3. Google Cloud Console: Create OAuth Web credentials
   - Authorized redirect URI: `https://<project-id>.supabase.co/auth/v1/callback`
   - Authorized JS origin: `https://giadungtnhome.io.vn`
4. Supabase Dashboard → URL Configuration:
   - Site URL: `https://giadungtnhome.io.vn`
   - Redirect URLs: `https://giadungtnhome.io.vn/auth/callback`, `http://localhost:3003/auth/callback`
5. Record env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Add to `.env.local` (do NOT commit)

**Verification:** Open `https://<project-id>.supabase.co/auth/v1/health` — should return `{ "status": "ok" }`

---

## Phase 1: Dependencies + Supabase Client Utilities

### Step 1.1: Package changes
- Remove: `@clerk/localizations`, `@clerk/nextjs`
- Add: `@supabase/supabase-js`, `@supabase/ssr`
- Run: `npm.cmd install`

### Step 1.2: Create `lib/supabase/client.ts` (~10 lines)
Browser client using `createBrowserClient()` from `@supabase/ssr`. Singleton pattern (default `isSingleton: true`).

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Step 1.3: Create `lib/supabase/server.ts` (~25 lines)
Server client using `createServerClient()` with `await cookies()` from `next/headers`.

- `cookies()` is async in Next.js 16 — must `await` before passing to cookie handlers
- `setAll` wrapped in try/catch (read-only in Server Components; middleware handles refresh)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* read-only in Server Components */ }
        },
      },
    }
  );
}
```

### Step 1.4: Create `lib/supabase/middleware.ts` (~40 lines)
`updateSession()` helper for middleware — creates Supabase client with request/response cookie forwarding. Returns `{ user, supabaseResponse }`.

- **Critical:** Must call `supabase.auth.getUser()` immediately to refresh sessions
- Uses `setAll` pattern that re-creates response to propagate cookies correctly

---

## Phase 2: Middleware — `middleware.ts`

**Current** (48 lines): `clerkMiddleware` + external API call to Clerk on every `/admin` request
**New** (~35 lines): `updateSession()` + read email from JWT result — no external API call for email

**Changes:**
- Replace `clerkMiddleware`/`createRouteMatcher`/`clerkClient` imports → import `updateSession` from `@/lib/supabase/middleware`
- Admin route check: `user.email` from `getUser()` result (already in JWT, no API call)
- Keep existing matcher config unchanged
- Keep `ADMIN_EMAILS` pattern unchanged
- Keep redirect behavior: unauthenticated → `/sign-in`, non-admin → `/?error=unauthorized`

**File:** `middleware.ts`

---

## Phase 3: OAuth Callback — Create `app/auth/callback/route.ts` (~30 lines)

PKCE code exchange endpoint. Supabase redirects here after Google OAuth.

- Extract `code` from search params
- Call `supabase.auth.exchangeCodeForSession(code)`
- Handle `x-forwarded-host` for production (Cloudflare Tunnel)
- **`next` param normalization:** Extract pathname from `next` param. If it's an absolute URL (e.g., `http://localhost:3003/admin`), parse with `new URL()` and extract `.pathname` only. If relative, use as-is. Reject any URL that doesn't start with `/` after normalization (prevent open redirect).
- Redirect to normalized `next` or `/`
- Error fallback: redirect to `/sign-in?error=auth-callback-failed`

```typescript
// Normalize next param: absolute → relative, validate starts with /
let next = searchParams.get("next") ?? "/";
try {
  const parsed = new URL(next, origin);
  next = parsed.pathname; // strip host, keep path only
} catch {
  next = "/"; // invalid URL → default
}
if (!next.startsWith("/")) next = "/";
```

**File:** `app/auth/callback/route.ts`

---

## Phase 4: Server-Side Auth Consumers

### Step 4.1: `lib/actions/admin-auth.ts` (31 lines → ~25 lines)
Replace `auth()` + `clerkClient().users.getUser()` with `createClient()` → `supabase.auth.getUser()`.
- Email from `user.email` directly — no external API call
- Return type stays `{ userId: string; email: string }`
- **Keep throwing `UnauthorizedError`** — callers (`getOrders`, `updateOrderStatus`) catch this

### Step 4.2: `lib/actions/order-actions.ts` (3 functions)
- **Line 6:** Replace `import { auth } from "@clerk/nextjs/server"` → `import { createClient } from "@/lib/supabase/server"`
- **`createOrder` (line 141):** Replace `const { userId: clerkUserId } = await auth()` → `const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); const authUserId = user?.id ?? null;`
- **`findOrCreateCustomer` (line 73):** Rename param `clerkUserId` → `authUserId`. **Safe re-linking with conflict guard:**

```typescript
// Re-link rules (prevent identity takeover):
// 1. customer.userId is null → link (guest → first login)
// 2. customer.userId starts with "user_" (legacy Clerk) → re-link to Supabase UUID
// 3. customer.userId === authUserId → no change needed
// 4. customer.userId is a different Supabase UUID → DO NOT overwrite (conflict)
function shouldRelink(existingUserId: string | null, authUserId: string): boolean {
  if (!existingUserId) return true;                    // case 1: guest
  if (existingUserId.startsWith("user_")) return true; // case 2: legacy Clerk ID
  if (existingUserId === authUserId) return false;      // case 3: already linked
  return false;                                         // case 4: conflict — don't overwrite
}

// In the phone-match branch:
...(authUserId && shouldRelink(customer.userId, authUserId) ? { userId: authUserId } : {}),
```

- **`getCustomerByAuth` (line 316):** Same `createClient()` → `getUser()` pattern

### Step 4.3: `app/api/admin/products/template/route.ts` (44 lines)
Keep explicit route-level auth checks (do NOT reuse `requireAdmin()` — it throws errors that would result in 500 instead of proper 401/403 JSON responses in Route Handlers).

Replace Clerk calls with Supabase:
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

---

## Phase 5: Client-Side Auth

### Step 5.1: Create `lib/supabase/auth-context.tsx` (~50 lines)
React context providing `{ user, isLoading, signOut }`. Replaces `useAuth()`, `<SignedIn>`, `<SignedOut>`.

```typescript
"use client";
// Uses createClient() from lib/supabase/client.ts
// supabase.auth.getUser() on mount
// onAuthStateChange() subscription for real-time updates
// signOut() calls supabase.auth.signOut() + redirect to /
// Exports: AuthProvider, useAuth hook
```

- `user` is `User | null` from `@supabase/supabase-js`
- `isLoading` replaces the `useSyncExternalStore` mounted hack in header.tsx

### Step 5.2: `app/layout.tsx` (modify)
- Remove: `ClerkProvider`, `viVN`, `resolveClerkJSUrl` imports
- Add: `<AuthProvider>` wrapper from auth-context
- Remove `clerkJSUrl` resolution logic

### Step 5.3: `components/layout/header.tsx` (modify)
- Remove: `SignedIn`, `SignedOut`, `UserButton` from `@clerk/nextjs`
- Add: `useAuth()` from `@/lib/supabase/auth-context`
- Replace `<SignedIn>...</SignedIn>` → `{user && (...)}`
- Replace `<SignedOut>...</SignedOut>` → `{!user && (...)}`
- Replace `<UserButton>` → Custom avatar dropdown (shadcn DropdownMenu)
  - Avatar from `user.user_metadata.avatar_url` (Google provides this)
  - "Đăng xuất" button calls `signOut()`
- Remove "Đăng ký" link (Google OAuth handles both signup+signin)
- Use `isLoading` from `useAuth()` instead of `useSyncExternalStore` mounted hack
- **Redirect URLs:** Build sign-in redirect as relative path: `/sign-in?redirect_url=/products/123` (not absolute)

### Step 5.4: `components/admin/admin-header.tsx` (modify)
Replace dynamic `UserButton` import with avatar from `useAuth()`. Remove `next/dynamic` import.

### Step 5.5: `components/product/product-detail-client.tsx` (modify)
Replace `useAuth()` from `@clerk/nextjs` → custom `useAuth()`. Change `if (!userId)` → `if (!user)`.
- **Fix redirect_url:** Use `window.location.pathname` (relative) instead of `window.location.href` (absolute) when building `/sign-in?redirect_url=...`

---

## Phase 6: Auth Pages

### Step 6.1: Create `components/auth/google-sign-in-button.tsx` (~40 lines)
Client component with Google OAuth trigger:
- Reads `redirect_url` from search params for post-login redirect
- **Normalizes to relative path** before passing to callback: `redirectTo: origin + '/auth/callback?next=' + encodeURIComponent(redirectPath)`
- `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`
- Apple-inspired styling: `rounded-xl`, `h-11`, Google SVG icon
- Loading state: "Đang chuyển hướng..."

### Step 6.2: `app/(auth)/sign-in/[[...sign-in]]/page.tsx` (modify)
Replace Clerk `<SignIn>` → `<GoogleSignInButton />` inside existing `<AuthShell>`

### Step 6.3: `app/(auth)/sign-up/[[...sign-up]]/page.tsx` (modify)
Redirect to `/sign-in` or render same `<GoogleSignInButton>` with different copy.

### Step 6.4: `components/auth/auth-shell.tsx` — No changes needed

---

## Phase 7: Delete Clerk Files

- `lib/clerk-provider-options.ts`
- `lib/clerk-auth-appearance.ts`
- `__tests__/lib/clerk-provider-options.test.ts`
- `docs/clerk_vps_production_setup.md`

---

## Phase 8: Configuration

### `.env.example`
Remove: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_JS_URL`
Add: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### `docker/Dockerfile`
Replace `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` build arg → `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### `next.config.ts`
Add `lh3.googleusercontent.com` to `images.remotePatterns` (Google avatar photos)

---

## Phase 9: Tests

### Existing test updates

#### `__tests__/components/product/product-detail-client.auth.test.tsx`
- Mock `@/lib/supabase/auth-context` instead of `@clerk/nextjs`
- Change mock shape: `{ userId: null }` → `{ user: null, isLoading: false, signOut: vi.fn() }`

#### `__tests__/lib/order-actions.get-orders.test.ts`
- Mock `@/lib/supabase/server` instead of `@clerk/nextjs/server`
- Mock shape: `createClient → auth.getUser → { data: { user: { id, email } } }`

### New tests (auth migration risk surface)

#### `__tests__/middleware.test.ts` (new)
- Unauthenticated user hitting `/admin` → redirected to `/sign-in?redirect_url=...`
- Authenticated non-admin hitting `/admin` → redirected to `/?error=unauthorized`
- Authenticated admin hitting `/admin` → passes through
- Non-admin routes → pass through regardless of auth state

#### `__tests__/app/auth/callback/route.test.ts` (new)
- Valid `code` + relative `next` → redirects to `next` path
- Valid `code` + absolute `next` URL → normalizes to pathname only
- Valid `code` + no `next` → redirects to `/`
- Valid `code` + `next` with external domain → rejects, redirects to `/`
- Missing `code` → redirects to error page
- Invalid `code` (exchange fails) → redirects to error page

#### `__tests__/lib/order-actions.relink.test.ts` (new)
- `findOrCreateCustomer` with `customer.userId = null` + `authUserId` → links
- `findOrCreateCustomer` with `customer.userId = "user_xxx"` + `authUserId` → re-links (Clerk migration)
- `findOrCreateCustomer` with `customer.userId = supabaseUUID` + same `authUserId` → no change
- `findOrCreateCustomer` with `customer.userId = differentUUID` + `authUserId` → does NOT overwrite (conflict guard)

---

## Data Migration: Clerk IDs → Supabase UUIDs

**Strategy:** Safe lazy re-linking via `findOrCreateCustomer` with conflict guard

- Existing `Customer.userId` stores Clerk IDs (`user_xxxx`)
- New sessions produce Supabase UUIDs
- **Safe re-linking rules in `findOrCreateCustomer`:**
  1. `customer.userId` is null → link (guest → first login)
  2. `customer.userId` starts with `user_` → re-link (legacy Clerk → Supabase UUID)
  3. `customer.userId` === `authUserId` → no change (already correct)
  4. `customer.userId` is a different Supabase UUID → **DO NOT overwrite** (prevents identity takeover via phone collision)
- **`Order.userId`:** Historical orders retain Clerk IDs. Acceptable — orders are looked up by `orderId`.

---

## File Summary

| Action | Count | Files |
|--------|-------|-------|
| Create | 6 | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `lib/supabase/auth-context.tsx`, `app/auth/callback/route.ts`, `components/auth/google-sign-in-button.tsx` |
| Modify | 11 | `package.json`, `middleware.ts`, `lib/actions/admin-auth.ts`, `lib/actions/order-actions.ts`, `app/api/admin/products/template/route.ts`, `app/layout.tsx`, `components/layout/header.tsx`, `components/admin/admin-header.tsx`, `components/product/product-detail-client.tsx`, `app/(auth)/sign-in/.../page.tsx`, `app/(auth)/sign-up/.../page.tsx` |
| Config | 3 | `.env.example`, `docker/Dockerfile`, `next.config.ts` |
| Delete | 4 | `lib/clerk-provider-options.ts`, `lib/clerk-auth-appearance.ts`, `__tests__/lib/clerk-provider-options.test.ts`, `docs/clerk_vps_production_setup.md` |
| Tests (update) | 2 | `__tests__/.../product-detail-client.auth.test.tsx`, `__tests__/.../order-actions.get-orders.test.ts` |
| Tests (new) | 3 | `__tests__/middleware.test.ts`, `__tests__/app/auth/callback/route.test.ts`, `__tests__/lib/order-actions.relink.test.ts` |

---

## Implementation Order (Dependencies)

```
Phase 0 (preflight — manual, BLOCKING)
  └── Supabase Cloud + Google OAuth setup

Phase 1 (foundation — no code deps) + Phase 8 (config)
  ├── 1.1 package.json changes
  ├── 1.2 lib/supabase/client.ts
  ├── 1.3 lib/supabase/server.ts
  ├── 1.4 lib/supabase/middleware.ts
  ├── 8.1 .env.example
  ├── 8.2 docker/Dockerfile
  └── 8.3 next.config.ts

  ⟶ VERIFY: npm.cmd run type-check (Clerk still imported but not used — expect errors)

Phase 2+3 (middleware + callback — depends on 1.3, 1.4)
  ├── middleware.ts
  └── app/auth/callback/route.ts

Phase 4 (server consumers — depends on 1.3)  ← can parallelize
  ├── 4.1 admin-auth.ts
  ├── 4.2 order-actions.ts (with safe relink)
  └── 4.3 template/route.ts

  ⟶ VERIFY: npm.cmd run type-check (server-side Clerk imports should be gone)

Phase 5 (client — depends on 1.2) + Phase 6 (auth pages)
  ├── 5.1 auth-context.tsx
  ├── 5.2 layout.tsx
  ├── 5.3 header.tsx
  ├── 5.4 admin-header.tsx
  ├── 5.5 product-detail-client.tsx
  ├── 6.1 google-sign-in-button.tsx
  ├── 6.2 sign-in page
  └── 6.3 sign-up page

Phase 7 (cleanup)
  └── Delete Clerk files

  ⟶ VERIFY: npm.cmd run type-check — zero @clerk imports
  ⟶ VERIFY: npm.cmd run lint

Phase 9 (tests)
  ├── Update existing tests
  └── Add new tests (middleware, callback, relink)

  ⟶ VERIFY: npm.cmd run test:run — all pass
  ⟶ VERIFY: npm.cmd run build — production build succeeds
```

---

## Verification

1. `npm.cmd run type-check` — No TypeScript errors, all `@clerk/*` imports gone
2. `npm.cmd run lint` — Clean
3. `npm.cmd run test:run` — All tests pass with updated mocks
4. Manual: Sign-in → Google OAuth → redirect back with session
5. Manual: Sign-out → session cleared, redirect to home
6. Manual: `/admin` as non-admin → redirected to `/?error=unauthorized`
7. Manual: `/admin` unauthenticated → redirected to `/sign-in`
8. Manual: Add to cart (guest) → login prompt toast
9. Manual: Add to cart (authenticated) → works
10. Manual: Create order → Supabase user ID stored in DB
11. Manual: Returning customer (had Clerk ID) → userId re-linked to Supabase UUID
12. Manual: Phone collision with different account → userId NOT overwritten
13. `npm.cmd run build` — Production build succeeds
14. Docker build with `--build-arg NEXT_PUBLIC_SUPABASE_URL=... --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
