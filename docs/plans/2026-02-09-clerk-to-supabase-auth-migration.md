# Migration Plan: Clerk → Supabase Auth (Google OAuth)

## Context

Clerk authentication is too complex for production deployment — custom domain configuration, OAuth credential routing, JS bundle CDN fallback hacks (`clerk-provider-options.ts`), and external API calls (`clerkClient().users.getUser()`) on every admin request. Migrating to Supabase Cloud Auth (managed, free tier) simplifies deployment, eliminates external API calls in the hot path, and consolidates on infrastructure we partially already use.

## Decisions

| Decision | Choice |
|----------|--------|
| Auth hosting | Supabase Cloud (managed, free tier) — auth only |
| Database | Stays self-hosted PostgreSQL + Prisma (no changes) |
| Custom domain | Not needed — default `<project-id>.supabase.co` |
| User data access | Prisma for business data, `@supabase/ssr` for auth only |
| Login UI | Single "Sign in with Google" button |
| Admin check | `ADMIN_EMAILS` env var against JWT email claim (no API call) |

## Phase 0: Supabase Cloud Setup (Manual, No Code)

1. Create Supabase project at `supabase.com/dashboard` (free tier)
2. Enable Google provider: Authentication → Providers → Google
3. Google Cloud Console: Create OAuth Web credentials
   - Authorized redirect URI: `https://<project-id>.supabase.co/auth/v1/callback`
   - Authorized JS origin: `https://giadungtnhome.io.vn`
4. Supabase Dashboard → URL Configuration:
   - Site URL: `https://giadungtnhome.io.vn`
   - Redirect URLs: `https://giadungtnhome.io.vn/auth/callback`, `http://localhost:3003/auth/callback`
5. Record: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Phase 1: Dependencies + Supabase Client Utilities

### Step 1.1: `package.json`
- Remove: `@clerk/localizations`, `@clerk/nextjs`
- Add: `@supabase/supabase-js`, `@supabase/ssr`
- Run: `npm.cmd install`

### Step 1.2: Create `lib/supabase/client.ts` (~15 lines)
Browser client using `createBrowserClient()` from `@supabase/ssr`.

### Step 1.3: Create `lib/supabase/server.ts` (~30 lines)
Server client using `createServerClient()` with `cookies()` from `next/headers`.
- `setAll` wrapped in try/catch (read-only in Server Components, middleware handles refresh)

### Step 1.4: Create `lib/supabase/middleware.ts` (~45 lines)
`updateSession()` helper — creates Supabase client with request/response cookie forwarding.
- Returns `{ supabase, user, supabaseResponse }` so middleware can do admin checks without creating a second client
- **Critical**: Must call `supabase.auth.getUser()` immediately after `createServerClient()` to refresh sessions

## Phase 2: Middleware — `middleware.ts`

Replace `clerkMiddleware` + `clerkClient().users.getUser()` with Supabase session refresh.

**Current** (48 lines): External API call to Clerk on every `/admin` request
**New** (~35 lines): Read email from JWT — zero external calls

- Import `updateSession` from `@/lib/supabase/middleware`
- Admin route check: `user.email` from `getUser()` result (already in JWT)
- Keep existing matcher config unchanged
- Keep `ADMIN_EMAILS` pattern unchanged
- Keep redirect behavior: unauthenticated → `/sign-in`, non-admin → `/?error=unauthorized`

## Phase 3: OAuth Callback — Create `app/auth/callback/route.ts` (~30 lines)

PKCE code exchange endpoint. Supabase redirects here after Google OAuth.

- Extract `code` from search params
- Call `supabase.auth.exchangeCodeForSession(code)`
- Handle `x-forwarded-host` for production (Cloudflare Tunnel)
- Redirect to `next` param (for post-login redirect) or `/`
- Error fallback: redirect to `/sign-in?error=auth-callback-failed`

## Phase 4: Server-Side Auth Consumers

### Step 4.1: `lib/actions/admin-auth.ts`
Replace `auth()` + `clerkClient().users.getUser()` with `supabase.auth.getUser()`.
- Email comes directly from `user.email` — no external API call
- Return type stays `{ userId: string; email: string }`

### Step 4.2: `lib/actions/order-actions.ts`
Two functions to update:
- `createOrder()` (line ~141): Replace `const { userId: clerkUserId } = await auth()` → `supabase.auth.getUser()`, use `user?.id ?? null`
- `getCustomerByAuth()` (line ~316): Same pattern

### Step 4.3: `app/api/admin/products/template/route.ts`
Replace inline Clerk check with `supabase.auth.getUser()` or reuse `requireAdmin()`

## Phase 5: Client-Side Auth

### Step 5.1: Create `lib/supabase/auth-context.tsx` (~50 lines)
React context providing `{ user, isLoading, signOut }`. Replaces `useAuth()`, `<SignedIn>`, `<SignedOut>`.
- Uses `supabase.auth.getUser()` on mount
- Subscribes to `onAuthStateChange()` for real-time updates
- `signOut()` calls `supabase.auth.signOut()` then redirects to `/`

### Step 5.2: `app/layout.tsx`
- Remove: `ClerkProvider`, `viVN`, `resolveClerkJSUrl`
- Add: `<AuthProvider>` wrapper from auth-context

### Step 5.3: `components/layout/header.tsx`
- Remove: `SignedIn`, `SignedOut`, `UserButton` from `@clerk/nextjs`
- Add: `useAuth()` from auth-context
- Replace `<SignedIn>...</SignedIn>` → `{user && (...)}`
- Replace `<SignedOut>...</SignedOut>` → `{!user && (...)}`
- Replace `<UserButton>` → Custom avatar dropdown (shadcn DropdownMenu)
  - Avatar from `user.user_metadata.avatar_url` (Google provides this)
  - "Đăng xuất" button calls `signOut()`
- Remove "Đăng ký" link (Google OAuth handles both signup+signin)
- Keep `isLoading`-based visibility guard (replaces `mounted` CSS hack)

### Step 5.4: `components/admin/admin-header.tsx`
Replace dynamic `UserButton` import with avatar from `useAuth()`.

### Step 5.5: `components/product/product-detail-client.tsx`
Replace `useAuth()` from `@clerk/nextjs` → custom `useAuth()`. Change `if (!userId)` → `if (!user)`.

## Phase 6: Auth Pages

### Step 6.1: Create `components/auth/google-sign-in-button.tsx` (~45 lines)
Client component with Google OAuth trigger:
- Calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`
- Reads `redirect_url` from search params for post-login redirect
- Apple-inspired styling: `rounded-xl`, `h-11`, Google SVG icon
- Loading state: "Đang chuyển hướng..."

### Step 6.2: `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
Replace Clerk `<SignIn>` → `<GoogleSignInButton />` inside existing `<AuthShell>`

### Step 6.3: `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
Redirect to `/sign-in` (Google OAuth handles both). Or render same button with different copy.

### Step 6.4: `components/auth/auth-shell.tsx` — No changes needed

## Phase 7: Delete Clerk Files

- `lib/clerk-provider-options.ts`
- `lib/clerk-auth-appearance.ts`
- `__tests__/lib/clerk-provider-options.test.ts`
- `docs/clerk_vps_production_setup.md`

## Phase 8: Configuration

### `.env.example`
Remove: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_JS_URL`
Add: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### `docker/Dockerfile`
Replace `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` build arg → `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### `next.config.ts`
Add `lh3.googleusercontent.com` to `images.remotePatterns` (Google avatar photos)

## Phase 9: Tests

### `__tests__/components/product/product-detail-client.auth.test.tsx`
- Mock `@/lib/supabase/auth-context` instead of `@clerk/nextjs`
- Change `{ userId: null }` → `{ user: null, isLoading: false, signOut: vi.fn() }`

### `__tests__/lib/order-actions.get-orders.test.ts`
- Mock `@/lib/supabase/server` instead of `@clerk/nextjs/server`
- Mock shape: `createClient → auth.getUser → { data: { user } }`

## Data Migration Note

`Customer.userId` and `Order.userId` store Clerk IDs (`user_xxxx`). After migration, new sessions produce Supabase UUIDs. For pre-production: existing records become orphaned (acceptable — orders are looked up by `orderId`, not `userId`). If needed later, a one-time script can map Clerk emails → Supabase UUIDs.

## File Summary

| Action | Count | Files |
|--------|-------|-------|
| Create | 6 | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `lib/supabase/auth-context.tsx`, `app/auth/callback/route.ts`, `components/auth/google-sign-in-button.tsx` |
| Modify | 12 | `package.json`, `middleware.ts`, `lib/actions/admin-auth.ts`, `lib/actions/order-actions.ts`, `app/api/admin/products/template/route.ts`, `app/layout.tsx`, `components/layout/header.tsx`, `components/admin/admin-header.tsx`, `components/product/product-detail-client.tsx`, `app/(auth)/sign-in/.../page.tsx`, `app/(auth)/sign-up/.../page.tsx`, `.env.example`, `docker/Dockerfile`, `next.config.ts` |
| Delete | 4 | `lib/clerk-provider-options.ts`, `lib/clerk-auth-appearance.ts`, `__tests__/lib/clerk-provider-options.test.ts`, `docs/clerk_vps_production_setup.md` |
| Update tests | 2 | `__tests__/.../product-detail-client.auth.test.tsx`, `__tests__/.../order-actions.get-orders.test.ts` |

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
10. Manual: Create order → Supabase user ID stored
11. `npm.cmd run build` — Production build succeeds
12. Docker build with `--build-arg NEXT_PUBLIC_SUPABASE_URL=... --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
