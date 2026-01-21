import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <CartDrawer />
        </div>
    );
}
