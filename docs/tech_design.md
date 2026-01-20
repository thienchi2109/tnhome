This Tech Design is optimized for **"Vibe Coding"**—a methodology where you act as the Product Manager/Architect and use AI (specifically **Cursor** or **Windsurf**) to write the actual code.

Given your timeline (1-2 weeks) and goal (Looks Amazing + Free), we are skipping traditional "boilerplate" setups and moving straight to high-velocity AI generation.

---

## 1. Recommended Approach: The "Vibe Stack"

This stack is chosen because AI models (Claude 3.5 Sonnet / GPT-4o) are incredibly proficient with these specific tools, minimizing hallucinations and debugging time.

*   **IDE/AI:** **Cursor** (using the `Composer` feature with Claude 3.5 Sonnet).
*   **Framework:** **Next.js 15** (App Router) – Fast, modern, great for SEO.
*   **Styling:** **Tailwind CSS** + **Shadcn/UI** – This is how you get the "Looks Amazing" result instantly.
*   **Database:** **Supabase** (PostgreSQL) – AI writes SQL/Prisma schemas easily.
*   **Auth:** **Clerk** – Easiest implementation for "Google Login."
*   **Media:** **Cloudinary** – Optimized image delivery.
*   **ORM:** **Prisma** – It provides a strictly typed schema that prevents AI from making database errors.

---

## 2. Alternative Options

| Option | Pros | Cons | Best For |
| :--- | :--- | :--- | :--- |
| **Option A: The Vibe Stack (Rec)** | Highest quality UI, easiest to maintain, free scaling. | Requires setting up API keys manually. | **Long-term projects & high-quality MVPs.** |
| **Option B: Bolt.new / Lovable** | Browser-based. You just type text, it builds the whole app live. | Hard to export and customize later. Can get "stuck" on complex logic. | **Prototypes to throw away.** |
| **Option C: Bubble (No-Code)** | Drag-and-drop. No coding knowledge needed. | Vendor lock-in. Hard to do custom things like dynamic VietQR. | **Non-technical founders.** |

---

## 3. Project Setup Checklist (Do this BEFORE opening Cursor)

You need the "keys" to the castle before the AI can build it.

1.  **GitHub:** Create a repo named `myshop-neon`.
2.  **Clerk:** Create a free account. Create a new app. Enable "Google" and "Email" providers. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
3.  **Supabase:** Create a free project. Go to Settings > Database. Copy the `connection string` (URI).
4.  **Cloudinary:** Create a free account. Get your `Cloud Name` and `Upload Preset` (Settings > Upload > Add upload preset > Mode: Unsigned).
5.  **Local Environment:**
    *   Install Node.js (v20+).
    *   Open Terminal: `npx create-next-app@latest myshop --typescript --tailwind --eslint`
    *   Select "Yes" for App Router and "No" for `src/` directory (keeps it simple).
    *   Run: `npx shadcn@latest init` (Select "New York" style, "Zinc" color).

---

## 4. Building Your Features (The Cursor Workflow)

**Crucial Step:** In Cursor, create a file named `.cursorrules` in the root folder. Paste the *entire* PRD content (from your prompt) into this file. This tells the AI *exactly* what it is building every time you ask a question.

### Phase 1: The Skeleton & Design System
*   **Tool:** Cursor Composer (`Cmd+I` or `Ctrl+I`).
*   **Prompt:**
    > "Initialize the project design system. Install 'lucide-react' for icons. Set up a Tailwind theme with a primary color of 'Electric Blue' (#007AFF) and a clean white background. Create a global Layout wrapper that includes a Header (Logo, Search, Cart icon, Login UserButton from Clerk) and a Footer. Use the 'Inter' font."

### Phase 2: Database & Prisma
*   **Tool:** Terminal + Cursor Chat.
*   **Action:** `npm install prisma @prisma/client` then `npx prisma init`.
*   **Prompt (in Chat):**
    > "Here is my PRD. Update the `schema.prisma` file to support Users, Products (name, price, image_url, category, stock), and Orders. Ensure Products map to the Admin requirements. Generate the model."
*   **Action:** Run `npx prisma db push` to sync Supabase.

### Phase 3: The "Vibe" Homepage (P0)
*   **Tool:** Cursor Composer.
*   **Prompt:**
    > "Create the Homepage (`page.tsx`). It needs a Hero Section with a swipeable banner (use a placeholder), a 'Trending Now' section displaying a grid of mock products using Shadcn Cards, and a Filter Bar (Pills). Ensure the images use `next/image`. Make it responsive."

### Phase 4: Admin & Cloudinary (P0)
*   **Tool:** Cursor Composer.
*   **Prompt:**
    > "Create a route `/admin/products`. This page should be protected (only allow specific user IDs). Create a form using Shadcn Form and React Hook Form to add a product. Integrate the Cloudinary Upload Widget (Client-side) to handle image uploads and return the URL to the form."

### Phase 5: Cart & Checkout (P0)
*   **Tool:** Cursor Composer.
*   **Prompt:**
    > "Create a Zustand store (`store/cart.ts`) to manage cart state (add, remove, clear). Persist to local storage. Create a `/cart` page displaying items. Add a 'Checkout' button that redirects to `/checkout`. On `/checkout`, calculate the total and display a dynamic VietQR image using `https://img.vietqr.io/image/BANK_ID-ACC_NO-template.png?amount=TOTAL&addInfo=ORDER_ID`."

---

## 5. Design Implementation (CSS Variables)

To ensure the site "Looks Amazing," force the AI to use this color logic in `globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%; /* Clean White */
    --foreground: 222.2 84% 4.9%; /* Dark Slate */
    --primary: 221.2 83.2% 53.3%; /* Electric Blue */
    --primary-foreground: 210 40% 98%;
    --radius: 0.75rem; /* Soft rounded corners */
  }
}
```

**Design Tip:** Ask the AI to "Use plenty of whitespace (padding), subtle shadows (`shadow-sm` or `shadow-md`), and `rounded-xl` for all images and cards."

---

## 6. Data & Storage Structure

**Supabase/Prisma Schema Strategy:**

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Decimal
  images      String[] // Array of Cloudinary URLs
  category    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Order {
  id        String      @id @default(cuid())
  total     Decimal
  status    String      @default("PENDING") // PENDING, PAID
  items     OrderItem[]
  userId    String?     // Optional for guest checkout logic if needed
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  quantity  Int
}
```

---

## 7. AI Assistance Strategy (Prompt Templates)

*   **When styling is ugly:** "Refactor this component. Use Shadcn Card and Button components. Increase padding between elements. Make the font size larger for headings. Apply a modern, minimalist aesthetic."
*   **When logic breaks:** "I am getting error [Paste Error]. Analyze the server action in `actions.ts` and the frontend component `page.tsx`. Fix the data passing logic."
*   **For the "Vibe":** "Make this section feel like Spotify. Dark mode accents, bold typography, smooth hover transitions."

---

## 8. Deployment Plan

1.  **Push to GitHub:** `git add .`, `git commit -m "initial"`, `git push`.
2.  **Vercel:**
    *   Import the GitHub Repo.
    *   **Environment Variables:** Copy/Paste all variables from your `.env.local` file into Vercel settings.
    *   **Deploy.**
3.  **Supabase:** Ensure "Allow connections from everywhere" is on (or restrict to Vercel IPs if you want to be strict, but "Everywhere" is fine for MVP).

---

## 9. Cost Breakdown

| Item | Dev Phase Cost | Production Cost (Low Traffic) | Notes |
| :--- | :--- | :--- | :--- |
| **Vercel** | $0 | $0 | Free Hobby Tier is generous. |
| **Supabase** | $0 | $0 | Free Tier (500MB database). |
| **Clerk** | $0 | $0 | Free for first 10,000 monthly active users. |
| **Cloudinary** | $0 | $0 | Free Tier (generous bandwidth). |
| **Cursor** | $0 / $20 | $0 / $20 | You can use free trial or pay $20/mo for faster AI. |
| **TOTAL** | **$0** | **$0** | **Truly free MVP.** |

---

## 10. Success Checklist

*   **Before Start:** Do I have my API Keys (Clerk, Supabase, Cloudinary)?
*   **Day 1:** Can I log in with Google and see a blank homepage?
*   **Day 3:** Can I (Admin) upload a photo and see it on the homepage?
*   **Day 5:** Can I scan a QR code that has the correct price?
*   **Launch:** Is the Lighthouse Performance score green (>90)?

**Final Vibe Check:** Does the site make you want to buy something? If not, ask the AI to "Add more pop."