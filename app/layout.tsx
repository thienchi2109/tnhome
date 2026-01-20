import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TN Home - Modern E-Commerce",
  description: "Shopping at the speed of Gen Z. Modern, fast, and beautiful.",
  keywords: ["e-commerce", "shopping", "vietnam", "household"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <CartDrawer />
      </body>
    </html>
  );
}
