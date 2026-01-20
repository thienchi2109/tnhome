# Day 1 Foundation - Modern E-Commerce Website

## Overview
Set up the foundation for a modern, Apple-inspired e-commerce platform targeting Gen Z shoppers in Vietnam. This milestone establishes the core architecture, design system, and essential UI components.

---

## Tech Stack
- **Framework:** Next.js 15+ (App Router, Server Components)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand (cart persistence)
- **Database:** PostgreSQL (Supabase self-hosted on Docker)
- **ORM:** Prisma
- **Testing:** Vitest
- **Icons:** Lucide React

---

## Phase 1: Project Initialization

### 1.1 Create Next.js Project
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```
- Use Turbopack for dev
- App Router: Yes
- No `src/` directory

### 1.2 Install Dependencies
```bash
# Core
npm install zustand lucide-react clsx tailwind-merge class-variance-authority

# Database
npm install prisma @prisma/client

# Dev/Testing
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

---

## Phase 2: shadcn/ui Setup

```bash
npx shadcn@latest init  # Style: New York, Color: Zinc, CSS variables: Yes
npx shadcn@latest add button card sheet scroll-area separator skeleton badge
```

---

## Phase 3: Directory Structure

```
D:\tnhome\
├── app/
│   ├── (store)/              # Route group for storefront
│   │   ├── page.tsx          # Homepage
│   │   ├── product/[id]/page.tsx
│   │   └── checkout/page.tsx
│   ├── admin/products/page.tsx
│   ├── api/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn/ui (auto-created)
│   ├── layout/
│   │   └── header.tsx
│   └── cart/
│       └── cart-drawer.tsx
├── lib/
│   ├── prisma.ts
│   └── utils.ts
├── store/
│   └── cart.ts
├── prisma/
│   └── schema.prisma
├── types/
│   └── index.ts
├── __tests__/
│   ├── setup.ts
│   └── store/cart.test.ts
├── docker/
│   └── Dockerfile
├── docker-compose.yml
├── vitest.config.ts
└── .env.example
```

---

## Phase 4: Design System Configuration

### 4.1 Tailwind Config (`tailwind.config.ts`)
- Primary color: Electric Blue (#007AFF)
- Apple-inspired spacing (section-mobile: 56px, section-desktop: 96px)
- Max content width: 1200px
- Inter font family
- Rounded corners (rounded-xl)

### 4.2 Global CSS (`app/globals.css`)
- CSS custom properties for colors
- Typography classes: heading-hero, heading-section, heading-product
- Mobile-first responsive design

---

## Phase 5: Core Components

### 5.1 Files to Create

| File | Purpose |
|------|---------|
| `lib/utils.ts` | `cn()` helper + `formatPrice()` for VND |
| `types/index.ts` | CartItem, Product interfaces |
| `store/cart.ts` | Zustand store with localStorage persistence |
| `components/layout/header.tsx` | Sticky header with logo, nav, cart icon with badge |
| `components/cart/cart-drawer.tsx` | Sheet-based cart drawer with item management |
| `app/layout.tsx` | Root layout with Header + CartDrawer |
| `app/(store)/page.tsx` | Homepage shell with hero section |

### 5.2 Cart Store Features
- Add/remove/update items
- Quantity management
- Total calculation
- localStorage persistence
- Auto-open on first add

### 5.3 Cart Drawer Features
- Empty state with illustration
- Item list with images
- Quantity +/- buttons
- Price display in VND
- Checkout CTA
- Clear cart button

---

## Phase 6: Database Schema

```prisma
model Product {
  id          String      @id @default(cuid())
  name        String
  description String?
  price       Int         // VND as integer
  images      String[]    // Cloudinary URLs
  category    String
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  orderItems  OrderItem[]
}

model Order {
  id        String      @id @default(cuid())
  total     Int
  status    String      @default("PENDING")
  userId    String?
  items     OrderItem[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Int     // Price at time of order
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])
}
```

---

## Phase 7: Docker Configuration

### 7.1 Dockerfile (`docker/Dockerfile`)
- Multi-stage build
- Node 20 Alpine
- Standalone output
- Prisma generate in build

### 7.2 Docker Compose (`docker-compose.yml`)
- Web service only (Next.js)
- Uses existing self-hosted Supabase for database
- No local PostgreSQL container needed

---

## Phase 8: Testing Setup

### 8.1 Vitest Config (`vitest.config.ts`)
- jsdom environment
- React plugin
- Path aliases support

### 8.2 Cart Store Tests
- Add item to cart
- Increment quantity for existing item
- Calculate total correctly
- Remove item from cart

---

## Phase 9: Package.json Scripts

```json
{
  "dev": "next dev --turbo",
  "build": "next build",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "test": "vitest",
  "test:run": "vitest run",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "docker:build": "docker-compose build",
  "docker:up": "docker-compose up -d"
}
```

---

## Phase 10: Environment Variables

Create `.env.example`:
```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/tnhome"

# Clerk (Day 3)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Cloudinary (Day 3)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# VietQR (Day 4)
VIETQR_BANK_ID=
VIETQR_ACCOUNT_NO=
```

---

## Phase 11: Git Initialization

```bash
git init
git add .
git commit -m "feat: Day 1 foundation setup"
```

---

## Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] Homepage loads at `http://localhost:3000`
- [ ] Header displays with logo, navigation, cart icon
- [ ] Cart drawer opens when clicking cart icon
- [ ] Cart state persists after page refresh
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] `npm run test` passes all cart tests
- [ ] `npx prisma validate` confirms valid schema

---

## Execution Order

1. Initialize Next.js project
2. Install all dependencies
3. Initialize and configure shadcn/ui
4. Create directory structure
5. Configure Tailwind with design tokens
6. Set up Prisma schema and client
7. Create type definitions
8. Implement Zustand cart store
9. Build Header component
10. Build Cart Drawer component
11. Create root layout with components
12. Create homepage shell
13. Configure Vitest and write tests
14. Set up Docker configuration
15. Initialize Git and commit

---

## Notes

- **Design:** Apple Store Vietnam inspired - clean, editorial, generous whitespace
- **Mobile-first:** iPhone width as baseline
- **No external services yet:** Clerk/Cloudinary/VietQR setup deferred to later days
- **Focus:** Solid architecture and working UI shell
