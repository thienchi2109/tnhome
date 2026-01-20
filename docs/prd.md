Here is a Narrative-Driven PRD designed to be handed directly to a developer or used with an AI coding assistant.

# Product Requirements Document (PRD): MyShop "Vibe Store"

## 1. Product Overview
*   **App Name:** MyShop (Internal Code: *Project Neon*)
*   **Tagline:** "Shopping at the speed of Gen Z."
*   **One-Sentence Pitch:** A high-performance, visually dynamic e-commerce platform designed for young shoppers, featuring a frictionless Google Login, QR-based payments, and a robust admin dashboard for real-time inventory management.
*   **Launch Goal:** Deploy a fully functional MVP where a user can browse, login via Google, and complete a "mock" checkout via QR code within 3 minutes.

## 2. Who It's For
### Primary Persona: "Minh the Gen Z Shopper"
*   **Profile:** 20-25 years old, university student or fresh grad.
*   **Behavior:** Lives on TikTok/Instagram. Has zero patience for slow websites or filling out long registration forms. Loves visual-first shopping.
*   **Tech:** Uses a smartphone 90% of the time. Pays for everything via banking app QR or MoMo.

### Secondary Persona: "The Modern Shop Owner" (Admin)
*   **Profile:** 30s, busy entrepreneur.
*   **Needs:** Needs to update product prices or upload a new promo banner from their laptop immediately without touching code.

## 3. User Journey Story
1.  **The Hook:** Minh clicks a link and lands on **MyShop**. The site loads instantly. The vibe is energetic—bold fonts, bright colors, and high-quality images. No boring "corporate" feel.
2.  **The Browse:** Minh sees a "Trending Now" section. He filters by category using a smooth, pill-shaped filter bar. He clicks a product.
3.  **The Decision:** The product page features a large gallery (hosted on Cloudinary). He sees the price and a clear "Add to Cart" button.
4.  **The Frictionless Auth:** He proceeds to checkout. Instead of typing an email/password, he sees **"Continue with Google"**. One tap, and he's logged in via Clerk.
5.  **The Checkout:** He reviews his cart. He selects "Bank Transfer / QR". A dynamic VietQR code appears. He scans it with his banking app, confirms payment, and clicks "I have paid".
6.  **The Support:** He has a question about shipping, so he taps the floating **Messenger icon** to chat directly with the shop page.

## 4. MVP Features (Prioritized)

### P0: Must-Have (The Core Loop)
| Feature | User Story | Success Criteria | Technical Note |
| :--- | :--- | :--- | :--- |
| **Dynamic Storefront** | As a customer, I want to see a modern homepage with banners and product grids so I can find what's new. | Homepage loads in <1.5s. Responsive on mobile. | Next.js 15+ App Router. Tailwind CSS. |
| **Authentication** | As a customer, I want to log in with my Google account so I don't have to remember passwords. | Clerk "Sign in with Google" works. User profile is created. | **Clerk** Free Tier. |
| **Product Management (Admin)** | As an Admin, I want to add/edit/delete products and upload images so the store is current. | Admin can upload an image, set price, and it appears on Home immediately. | **Cloudinary** Widget for uploads. **Supabase** (Self-hosted) for data. |
| **Shopping Cart** | As a customer, I want to add items to a cart and see the total price update. | Cart persists across page reloads (Local Storage or DB). | State management (Zustand or Context). |
| **QR Payment** | As a customer, I want to pay via QR code. | System generates a VietQR link based on Total Amount + Order ID. | `img.vietqr.io` API. |
| **Chat Integration** | As a customer, I want to chat with support. | Floating Facebook Messenger bubble appears on all pages. | Facebook Customer Chat Plugin. |

### P1: Nice-to-Have (If Time Allows)
*   **Order History:** A "My Orders" page for customers to see past purchases.
*   **Product Search:** A real-time search bar in the header.
*   **Related Products:** "You might also like" section on product details.

### P2: Deferred (Not in MVP)
*   Online Payment Gateway (Stripe/VNPay) integration (Sticking to manual QR for MVP).
*   Inventory syncing with external software (KiotViet).
*   Review/Rating system.

## 5. Success Metrics
*   **Performance:** Lighthouse Performance Score > 90.
*   **Reliability:** 100% successful image uploads via Admin panel.
*   **Conversion:** A user can go from "Landing Page" to "Checkout Success" in under 5 clicks.

## 6. Look & Feel (The "Vibe")
*   **Style:** Modern, Clean, "Pop". Think *Spotify* meets *Shopee*.
*   **Color Palette:**
    *   **Primary:** Electric Blue or Vivid Orange (Action buttons).
    *   **Background:** Clean White (or very light gray) for content readability.
    *   **Text:** Dark Slate (never pure black).
*   **UI Components:** **Shadcn/UI**. Use rounded corners (`rounded-xl`), subtle drop shadows, and plenty of whitespace.
*   **Imagery:** Large, high-resolution product photos. No pixelation allowed.

### Simple Wireframe (Home)
```text
[Header: Logo | Search | Cart(0) | Login Avatar]
--------------------------------------------------
[ HERO BANNER: "Summer Sale - 50% Off" (Swipe)   ]
--------------------------------------------------
[ Filter: All | Fashion | Tech | Accessories     ]
--------------------------------------------------
[ Grid:                                          ]
[ [Img] [Img] [Img] [Img]                        ]
[ Name  Name  Name  Name                         ]
[ $$$   $$$   $$$   $$$                          ]
--------------------------------------------------
[ Floating Chat Bubble (Bottom Right)            ]
```

## 7. Technical Considerations
*   **Framework:** Next.js 15 (App Router).
*   **Database:** PostgreSQL (via Self-hosted Supabase on Docker).
*   **ORM:** Prisma (recommended for type safety) or Drizzle.
*   **Styling:** Tailwind CSS + Shadcn/UI (Lucide React for icons).
*   **Image Optimization:** Use `next/image` with Cloudinary loader.
*   **Security:**
    *   Admin routes (`/admin/*`) must be protected by Clerk Middleware (check for specific Admin User ID).
    *   Public routes: Read-only for products.

## 8. Quality Standards
*   **Mobile First:** The site must look perfect on an iPhone 12/14 width.
*   **Empty States:** If the cart is empty, show a cute illustration and a "Start Shopping" button, not just a blank space.
*   **Loading States:** Use "Skeleton loaders" (shimmer effect) while data is fetching, not spinning wheels.
*   **Error Handling:** If an image fails to load, show a fallback placeholder.

## 9. Budget & Constraints
*   **Hosting:** Vercel (Free Hobby Tier).
*   **DB Hosting:** Existing VPS (Dockerized Supabase).
*   **Services:** Clerk (Free Tier), Cloudinary (Free Tier).
*   **Timeline:** MVP ready for demo in 7 days.

## 10. Definition of Done
1.  Code is pushed to GitHub.
2.  Live URL is accessible (e.g., `myshop-demo.vercel.app`).
3.  Admin can log in, create a product "Test Item", upload a photo, and save.
4.  Customer can log in via Google, add "Test Item" to cart, and see the correct QR code at checkout.