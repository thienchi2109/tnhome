"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart";

import Image from "next/image";

export function Header() {
  const { openCart } = useCartStore();

  // Use useSyncExternalStore for SSR-safe cart count
  const itemCount = useSyncExternalStore(
    useCartStore.subscribe,
    () => useCartStore.getState().getItemCount(),
    () => 0 // Server snapshot - return 0 during SSR
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-28 max-w-[1200px] items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
            <Image
              src="/app-logo.jpg"
              alt="TN Home"
              fill
              className="object-cover p-1"
              sizes="80px"
              priority
            />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hidden sm:block">
            TN Home
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <Link
            href="/"
            className="text-base font-medium text-foreground/80 hover:text-foreground hover:bg-muted px-4 py-2 rounded-full transition-all"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-base font-medium text-foreground/80 hover:text-foreground hover:bg-muted px-4 py-2 rounded-full transition-all"
          >
            Products
          </Link>
          <Link
            href="/about"
            className="text-base font-medium text-foreground/80 hover:text-foreground hover:bg-muted px-4 py-2 rounded-full transition-all"
          >
            About
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Search Input - Desktop */}
          <div className="relative hidden md:flex items-center ml-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-[200px] lg:w-[300px] rounded-full bg-muted/40 border border-transparent hover:bg-muted/60 focus:bg-background focus:border-primary pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/70"
            />
          </div>

          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full">
            <User className="h-6 w-6" />
            <span className="sr-only">Account</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-12 w-12 rounded-full"
            onClick={openCart}
          >
            <ShoppingBag className="h-6 w-6" />
            {itemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute top-1 right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </Badge>
            )}
            <span className="sr-only">Cart</span>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden h-12 w-12 rounded-full">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
