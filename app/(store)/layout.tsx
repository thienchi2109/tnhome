import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getCategoriesWithSlugs } from "@/lib/actions";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch categories from database for dynamic header navigation
  const categoriesWithSlugs = await getCategoriesWithSlugs();

  return (
    <div className="flex min-h-screen flex-col">
      <Header categoriesWithSlugs={categoriesWithSlugs} />
      <main className="flex-1">{children}</main>
      <CartDrawer />
    </div>
  );
}
