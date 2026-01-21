import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
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
  icons: {
    icon: [

      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon_io/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/favicon_io/apple-touch-icon.png" },
    ],
  },
  manifest: "/favicon_io/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="vi" className={inter.variable}>
        <body className="min-h-screen bg-background font-sans antialiased">
          <Header />
          <main className="flex-1">{children}</main>
          <CartDrawer />
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
