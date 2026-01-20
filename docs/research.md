This is a comprehensive research analysis and execution plan for your e-commerce project.

### **Executive Summary**
You are entering a crowded market dominated by giants (Shopee, TikTok Shop) and established SaaS platforms (Haravan, Sapo). However, your niche is **"The Digital Showcase"**—a simple, branded catalog for shops that already use KiotViet for operations but lack a beautiful online presence. Your advantage is **simplicity and no monthly fees** (unlike Sapo/Haravan which charge ~300k-500k VND/month).

---

### **1. Competitor Analysis**
Most Vietnamese shops currently use one of these three tiers. Your opportunity is in the "Gap" between free social media and expensive SaaS.

| Competitor | Type | Cost (VND) | Pros | Cons |
| :--- | :--- | :--- | :--- | :--- |
| **Haravan / Sapo** | SaaS Platform | ~300k - 1tr / month | Powerful, syncs inventory with KiotViet (paid addon). | Expensive for small shops; Overkill features; Monthly recurring cost. |
| **Shopee / TikTok** | Marketplace | Free to join (High fees per sale) | Huge traffic; Built-in shipping. | High fees (8-14%); Price wars; No brand loyalty; You don't own the customer data. |
| **MyKiot** | KiotViet Add-on | Free (Basic) | Integrated with KiotViet. | **Ugly interface**; Hard to customize; Doesn't look "Youthful/Dynamic". |
| **WordPress (Woo)** | CMS | ~150k/mo (Hosting) | Fully customizable. | **Maintenance nightmare**; Plugins break often; Slow speed; Security risks. |
| **Your Solution** | **Custom Web App** | **Free (Hosting/Ops)** | **Fast, Modern UI; No monthly fees; Full brand control.** | No auto-inventory sync (Manual update required); You must build it. |

---

### **2. Tech Stack (The "Free Forever" Architecture)**
To stick to a **$0 budget** while meeting your requirements (Clerk, Cloudinary, Google Auth), use this modern "Serverless" stack. All these tools have generous free tiers that will last you for years.

*   **Frontend (The Interface):** **Next.js 16+ (App Router)**.
    *   *Why:* The industry standard. Fast, SEO-friendly, and hosts for free on Vercel.
*   **Styling (The "Youthful" Look):** **Tailwind CSS** + **Shadcn/UI**.
    *   *Why:* Shadcn provides copy-paste components (beautiful buttons, cards, inputs) that look premium instantly.
*   **Authentication (Login):** **Clerk**.
    *   *Why:* Handles "Login with Google" for customers AND Admin security.
    *   *Free Tier:* Up to 10,000 monthly active users (Perfect for a single shop).
*   **Image Storage:** **Cloudinary**.
    *   *Why:* Optimizes images automatically (makes them load fast).
    *   *Free Tier:* Generous credits for a catalog of ~500 products.
*   **Database (Product Data): **self-hosting Supabase on Docker**, deploy in VPS (I already have)
    *   *Why:* Both offer excellent free tiers for PostgreSQL databases.
*   **Payment:** **VietQR API** (via `img.vietqr.io`).
    *   *Why:* No need for a business merchant account. You generate a dynamic QR code that includes the Order ID and Amount automatically.
*   **Chatbot:** **Facebook Messenger Plugin**.
    *   *Why:* Vietnamese customers trust Messenger. It's free and connects directly to the shop owner's phone.

---

### **3. MVP Features (Prioritized)**
Don't build everything at once. Focus on the "Showcase" aspect first.

| Feature | Priority | Implementation Strategy |
| :--- | :--- | :--- |
| **Homepage** | **Must-Have** | Hero banner (Promotion), Featured Categories, "Best Sellers". |
| **Product List** | **Must-Have** | Grid view, Filter by Price/Category, Search bar. |
| **Product Detail** | **Must-Have** | High-quality images (Cloudinary), Price, Description, "Add to Cart". |
| **Cart & Checkout** | **Must-Have** | Simple form (Name, Address, Phone). **Payment:** Show VietQR code → Customer scans → Customer clicks "I have paid". |
| **Admin Panel** | **Must-Have** | Protected route (Admin only). Form to Add/Edit products. Upload button linked to Cloudinary. |
| **Auth** | **Must-Have** | Clerk Integration. Google Login button for customers. |
| **Chat** | **Must-Have** | Floating bubble (Messenger Customer Chat Plugin). |
| *Order History* | *Nice-to-Have* | Let customers see past orders (Save this for Phase 2). |
| *Inventory Sync* | *Ignore* | You said KiotViet handles this. Just add a "In Stock / Out of Stock" toggle in Admin. |

---

### **4. Development Roadmap (For Non-Tech Founders)**
Since you are non-technical, **do not write code from scratch**. Use **Cursor AI** (an AI code editor) or **v0.dev** (for UI).

#### **Step 1: The Setup (1 Hour)**
1.  Install **Node.js** and **VS Code** (or Cursor).
2.  Go to **Clerk.com**, create an account, create a new application, and enable "Google" provider. Copy the `API Keys`.
3.  Go to **Cloudinary.com**, create a free account. Copy the `Cloud Name` and `API Keys`.
4.  Go to **Neon.tech**, create a free Postgres database. Copy the `Connection String`.

#### **Step 2: Generate the UI with AI (v0.dev)**
*   Go to [v0.dev](https://v0.dev) (by Vercel).
*   **Prompt:** *"Design a modern, youthful e-commerce homepage for a household goods store. Use a bright color palette (orange and teal). Include a hero section, a grid of product cards with images, prices, and an 'Add to Cart' button. Use Tailwind CSS."*
*   Copy the generated code.

#### **Step 3: Build the Logic with Cursor AI (The "Magic" Step)**
*   Download **Cursor** (cursor.com). It looks like VS Code but has AI built-in.
*   Open a new project folder.
*   **Prompt to Cursor (Command+K):**
    > "Create a new Next.js 14 app with Tailwind CSS. Set up Clerk for authentication. Create a database schema for 'Products' (id, name, price, image_url, category, description) using Prisma and SQLite (for now). Create an Admin page where I can upload images to Cloudinary and save product details to the database."

#### **Step 4: The Payment Logic (VietQR)**
*   You don't need a complex payment gateway.
*   **Logic:** When the user checks out with a total of **500,000 VND**, show them this image URL:
    `https://img.vietqr.io/image/[BANK_ID]-[ACCOUNT_NO]-compact.jpg?amount=500000&addInfo=Order123`
*   Replace `[BANK_ID]` and `[ACCOUNT_NO]` with the shop owner's details.

---

### **5. Monetization & Value**
If you are building this for a client (the shop owner):

*   **Setup Fee:** **5,000,000 - 10,000,000 VND**.
    *   This covers your time setting up the domain, hosting, and uploading their first 50 products.
*   **Maintenance:** **0 VND/month** (Use this as your selling point).
    *   Since Vercel, Clerk, and Neon are free, you don't need to charge them monthly hosting fees. This is how you beat Haravan.
*   **Optional Retainer:** **500,000 VND/month** if they want you to upload new banners or fix issues.

### **6. Recommended Tools Summary**

| Category | Tool | Cost | Why? |
| :--- | :--- | :--- | :--- |
| **Code Editor (AI)** | **Cursor** | Free | Writes the code for you. |
| **UI Generator** | **v0.dev** | Free | Designs the website visually. |
| **Hosting** | **Vercel** | Free | Best for Next.js. |
| **Auth** | **Clerk** | Free | Easiest Google Login setup. |
| **Images** | **Cloudinary** | Free | Professional image hosting. |
| **Payment** | **VietQR** | Free | Public API for QR codes. |
| **Database** | **Neon** | Free | Modern Postgres database. |

### **Actionable Next Step**
Don't worry about the backend yet. Go to **v0.dev** right now and type: *"E-commerce product dashboard with a sidebar for Admin, allowing image uploads and price editing."* See if you like the interface it generates. That is your MVP starting point.