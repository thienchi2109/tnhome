# Day 2 Storefront UI - Implementation Plan

## Goal
Transform the empty homepage into a stunning, modern, and mobile-first storefront inspired by Apple's minimalist aesthetic. Focus on high-quality visuals, bold typography, and smooth interactions to create a "premium" shopping experience for Gen Z.

## User Review Required
> [!IMPORTANT]
> **Design Direction**: We are adopting a strict "Content is King" approach. No clutter, no sticky popups, no aggressive countdowns. Images will drive the narrative.

> [!NOTE]
> **Mobile Optimization**: The Hero section will use a vertical stacking layout on mobile (Image Top, Text Bottom) to ensure legibility and impact, distinct from the desktop side-by-side or overlay layout.

## Proposed Changes

### Design System & Global Styles
Refine the foundation to support the new "Apple-like" aesthetic.

#### [MODIFY] [globals.css](file:///d:/tnhome/app/globals.css)
- Add utility classes for "glass" effects (backdrop-blur).
- Define new animations: `fade-in-up`, `scale-in`.
- Ensure `selection` color matches the brand (Electric Blue).

#### [MODIFY] [tailwind.config.ts](file:///d:/tnhome/tailwind.config.ts)
- Add custom animation keyframes.
- Verify color palette (Zinc neutral + Electric Blue accent).

### Storefront Components
New components to build the visual experience.

#### [NEW] [components/store/hero-section.tsx](file:///d:/tnhome/components/store/hero-section.tsx)
- **Features**: Full-height (or 80vh) hero, high-res background image/video.
- **Mobile**: Stacks content vertically.
- **Interactions**: Parallax effect or subtle zoom on scroll.
- **Content**: Headline, Subheadline, Primary CTA, Secondary Link.

#### [NEW] [components/product/product-card.tsx](file:///d:/tnhome/components/product/product-card.tsx)
- **Features**: Minimalist card. 
- **Image**: Aspect ratio 1:1 or 4:5. Hover reveals secondary image or "Quick Add" button.
- **Info**: Clean typography (Name, Price). No star ratings if no data available yet.
- **Mobile**: Simplified view.

#### [NEW] [components/product/product-grid.tsx](file:///d:/tnhome/components/product/product-grid.tsx)
- **Features**: Responsive grid (2 cols mobile, 3-4 cols desktop).
- **Layout**: Gap-4 or Gap-6 (generous whitespace).

### Pages

#### [MODIFY] [app/(store)/page.tsx](file:///d:/tnhome/app/(store)/page.tsx)
- Assemble the Homepage:
    1. `HeroSection` (Featured Product/Campaign)
    2. `SectionHeader` ("New Arrivals")
    3. `ProductGrid` (Trending items)
    4. `FeaturedCollection` (Editorial style, split layout)

#### [NEW] [app/(store)/product/[id]/page.tsx](file:///d:/tnhome/app/(store)/product/[id]/page.tsx)
- **Layout**: Split view (Gallery Left, Details Right) on Desktop. Stacked on Mobile.
- **Gallery**: Swipeable carousel on mobile. Grid on Desktop.
- **Actions**: Sticky "Add to Cart" bar on mobile scroll.
- **Details**: Accordion for "Description", "Materials", "Shipping".

## Verification Plan

### Automated Tests
- [ ] Run `npm run lint` and `npm run type-check`.
- [ ] Verify build with `npm run build`.

### Manual Verification
1. **Mobile Responsiveness**:
    - Open Chrome DevTools (Device Mode: iPhone 12/14 Pro).
    - Verify Hero section text is legible and CTA is "thumb-friendly".
    - Check Product Grid acts as 2-column on mobile.
    - Ensure extensive horizontal scrolling is avoided (except for curated horizontal lists).

2. **Visual Quality**:
    - Hover states on Product Cards should be smooth (transition-all duration-300).
    - Images should load with a blur-up effect or skeleton loader.

3. **Interactions**:
    - Click "Add to Cart" -> Open Cart Drawer.
    - Navigate to Product Detail -> Verify URL routing.
