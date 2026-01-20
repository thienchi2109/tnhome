# CLAUDE.md - TN Home E-Commerce

## Project Context

**Project:** TN Home | **Stack:** Next.js 15, React 19, PostgreSQL (Supabase), Prisma 6
**Goal:** Modern Gen Z E-Commerce Platform | **Market:** Vietnam
**Auth:** Clerk (Google OAuth) | **Media:** Cloudinary | **Payment:** VietQR

## General Rules

For general development patterns, tool usage, debugging, and context engineering rules, see:
**Reference:** `D:\lims-lite\CLAUDE.md`

Apply all general rules from that file, especially:
- ⚠️ Enforcement Checklist (warpgrep, edit_file, Context7, GKG)
- 🐛 Debugging & Problem-Solving (systematic-debugging skill)
- 🧠 Context Engineering (mandatory for complex work)
- Tool Priority (warpgrep → edit_file → Context7)
- Beads Task Tracking workflow

## Project-Specific Rules

### 1. Design System (Apple-Inspired)

**Core Principles:**
- Mobile-first (iPhone width baseline)
- Clean, editorial, product-first layout
- Generous whitespace, rounded corners (rounded-xl)
- Soft shadows, minimal chrome

**Colors:**
```typescript
Primary: Electric Blue (#007AFF)
Background: White (#FFFFFF)
Foreground: Dark (#1D1D1F)
Muted: Light Gray (#F5F5F7)
Border: Gray (#D2D2D7)
```

**Typography:**
- Font: Inter (latin + vietnamese subsets)
- Classes: `heading-hero`, `heading-section`, `heading-product`, `text-body`, `text-caption`

**Spacing:**
- Section mobile: 56px (3.5rem)
- Section desktop: 96px (6rem)
- Max content width: 1200px

### 2. Tech Stack Constraints

**Next.js 15 App Router:**
- Server Components by default
- Route groups: `(store)`, `(admin)`
- Client components: Mark with `"use client"`

**Prisma 6:**
- Connection: Direct PostgreSQL URL (no adapters)
- Schema: `prisma/schema.prisma`
- Client: Singleton pattern in `lib/prisma.ts`
- Commands: `npm run db:generate`, `npm run db:push`

**State Management:**
- Server state: Server Components + Server Actions
- Cart state: Zustand with localStorage persistence
- UI state: `useState` for local interactions

**Styling:**
- Tailwind CSS v4
- shadcn/ui components (New York style)
- Lucide React icons

### 3. File Organization

```
app/
  (store)/          # Public storefront routes
  admin/            # Admin panel routes
  api/              # API routes
components/
  ui/               # shadcn/ui primitives
  layout/           # header.tsx, footer.tsx
  cart/             # cart-drawer.tsx, cart-item.tsx
  product/          # Product components (Day 2+)
lib/
  prisma.ts         # Prisma client singleton
  utils.ts          # Utility functions (cn, formatPrice)
  actions.ts        # Server actions
store/
  cart.ts           # Zustand cart store
types/
  index.ts          # TypeScript interfaces
```

**File Size:** 250-350 lines max, single responsibility

### 4. Database (Prisma + Supabase)

**Connection:**
- Self-hosted Supabase provides PostgreSQL
- Prisma connects via `DATABASE_URL` in `.env`
- No Supabase JS client - Prisma handles all queries

**Schema Pattern:**
```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  price       Int      // VND as integer
  images      String[] // Cloudinary URLs
  category    String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([isActive])
}
```

**Price Storage:** Always store VND as integers (e.g., 100000 = 100,000₫)

### 5. React Patterns

**Component Structure:**
```typescript
"use client"; // Only if needed

import { /* imports */ } from "...";

interface Props {
  // TypeScript props
}

export function ComponentName({ props }: Props) {
  // Hooks first
  // Event handlers
  // Derived state

  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

**Server Actions:**
```typescript
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const schema = z.object({
  name: z.string().min(1),
  price: z.number().int().positive(),
});

export async function createProduct(formData: FormData) {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten() };

  const product = await prisma.product.create({
    data: result.data,
  });

  revalidatePath("/admin/products");
  return { success: true, product };
}
```

### 6. Code Generation Standards

**React Components:**
- Functional components + TypeScript
- shadcn/ui for UI primitives
- Lucide React for icons
- Tailwind for styling

**Forms:**
- react-hook-form + @hookform/resolvers + Zod
- Server Actions for mutations

**Data Fetching:**
- Server Components: Direct Prisma queries
- Client Components: Fetch from API routes or Server Actions

**Currency Formatting:**
```typescript
// Always use formatPrice from lib/utils.ts
formatPrice(100000) // "100.000₫"
```

### 7. Testing

**Vitest Setup:**
- Test files: `__tests__/**/*.test.ts(x)`
- Setup: `__tests__/setup.ts`
- Commands: `npm run test`, `npm run test:run`

**Cart Store Tests:**
- Add/remove items
- Quantity management
- Total calculation
- Persistence

### 8. Development Workflow

**Daily Commands:**
```bash
npm run dev           # Dev server with Turbopack
npm run type-check    # TypeScript validation
npm run lint          # ESLint
npm run test          # Vitest watch mode
```

**Database Commands:**
```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to DB (dev only)
npm run db:migrate    # Create migration (production)
npm run db:studio     # Prisma Studio GUI
```

**Docker Commands:**
```bash
npm run docker:build  # Build production image
npm run docker:up     # Start containers
npm run docker:down   # Stop containers
```

### 9. Milestone Plan

**Day 1 - Foundation (COMPLETED):**
- ✅ Next.js + Tailwind + shadcn/ui
- ✅ Layout, Header, Cart Drawer
- ✅ Git, Vitest, ESLint/TypeCheck
- ✅ Prisma schema setup

**Day 2 - Product Catalog:**
- Product Card component
- Product Grid with filtering
- Product Detail page
- Hero banner
- Category navigation

**Day 3 - Authentication & Media:**
- Clerk integration
- Cloudinary image uploads
- Protected routes
- Admin product management

**Day 4 - Checkout & Payment:**
- Checkout flow
- VietQR integration
- Order creation
- Email notifications

**Day 5+ - Polish & Deploy:**
- Loading states
- Error handling
- Performance optimization
- Docker deployment to VPS

### 10. Environment Variables

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/tnhome"

# Clerk (Day 3)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Cloudinary (Day 3)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# VietQR (Day 4)
VIETQR_BANK_ID=
VIETQR_ACCOUNT_NO=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 11. Key Principles

1. **Mobile-First:** Design for iPhone width, scale up
2. **Performance:** Use Server Components by default, minimize client JS
3. **Type Safety:** Zod validation, strict TypeScript, no `any`
4. **Clean Design:** Apple-inspired aesthetics, generous whitespace
5. **User Experience:** Fast, intuitive, Gen Z-friendly

### 12. Reference Documentation

| Topic | File |
|-------|------|
| Day 1 Plan | `docs/plan_day1_foundation.md` |
| Spec | `docs/spec_1_modern_ecommerce_website.md` |
| General Rules | `D:\lims-lite\CLAUDE.md` |

## Git Workflow

**Commits:** Follow Conventional Commits
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code restructuring
- `chore:` - Maintenance tasks
- `docs:` - Documentation

**Co-authored commits:**
```bash
git commit -m "feat: add feature

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Windows Commands

Use `powershell -Command` or bash syntax with forward slashes. Never mix cmd syntax.

**npm/npx in PowerShell:** Always use `.cmd` suffix for npm commands:
- `npm.cmd` instead of `npm`
- `npx.cmd` instead of `npx`

This prevents "spawn EINVAL" errors when running from PowerShell.

```bash
mkdir -p src/components/feature  # ✅ bash-style
npm.cmd run dev                  # ✅ PowerShell npm
npx.cmd prisma generate          # ✅ PowerShell npx
```

## Critical Reminders

1. **ALWAYS use warpgrep** for code search (not grep/Glob)
2. **ALWAYS use edit_file** for code changes (not Edit)
3. **ALWAYS use Context7** before generating library code
4. **ALWAYS invoke skills** if they might apply (even 1%)
5. **NEVER use `SELECT *`** - specify columns explicitly
6. **NEVER create files > 350 lines** - refactor immediately
7. **ALWAYS validate with Zod** in Server Actions
8. **ALWAYS store prices as integers** (VND)

---

*This file should be read at the start of every session.*
