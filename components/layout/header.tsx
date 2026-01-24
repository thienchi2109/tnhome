"use client";

import { useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Menu, User, Settings, List, ChevronDown, LogIn, UserPlus } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart";

import Image from "next/image";

export function Header() {
  const { openCart } = useCartStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Use useSyncExternalStore for SSR-safe cart count
  const itemCount = useSyncExternalStore(
    useCartStore.subscribe,
    () => useCartStore.getState().getItemCount(),
    () => 0 // Server snapshot - return 0 during SSR
  );

  const categories = [
    { name: "Nội thất", href: "/products?category=furniture" },
    { name: "Phòng khách", href: "/products?category=living-room" },
    { name: "Phòng ngủ", href: "/products?category=bedroom" },
    { name: "Bếp & Ăn uống", href: "/products?category=kitchen" },
    { name: "Trang trí", href: "/products?category=decor" },
    { name: "Đèn & Ánh sáng", href: "/products?category=lighting" },
    { name: "Ngoài trời", href: "/products?category=outdoor" },
    { name: "Sản phẩm mới", href: "/products?sort=newest", highlight: true },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <header className="flex flex-col w-full bg-background relative z-50">


        {/* Main Header */}
        <div className="w-full border-b bg-background py-4">
          <div className="mx-auto flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 max-w-[1400px]">
            {/* Mobile Menu & Logo */}
            <div className="flex items-center gap-3 md:gap-8 shrink-0">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 -ml-2">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="text-left">
                      <Link href="/" className="flex items-center gap-2">
                        <div className="relative h-8 w-8 overflow-hidden rounded-sm">
                          <Image
                            src="/app-logo.png"
                            alt="TN Home"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="font-bold text-lg text-primary">TN Home</span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 py-6">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-medium text-muted-foreground px-2 pb-2">Danh mục</h3>
                      <nav className="flex flex-col gap-1">
                        {categories.map((category) => (
                          <Link
                            key={category.name}
                            href={category.href}
                            className={`px-2 py-2 text-sm font-medium rounded-md transition-colors ${category.highlight
                              ? "text-primary bg-primary/5 hover:bg-primary/10"
                              : "text-foreground hover:bg-muted"
                              }`}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </nav>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-sm font-medium text-muted-foreground px-2 pb-2">Tài khoản</h3>
                      <SignedOut>
                        <div className="grid gap-2 px-2">
                          <Button asChild variant="outline" className="justify-start gap-2 w-full">
                            <Link href="/sign-in">
                              <LogIn className="h-4 w-4" />
                              Đăng nhập
                            </Link>
                          </Button>
                          <Button asChild className="justify-start gap-2 w-full">
                            <Link href="/sign-up">
                              <UserPlus className="h-4 w-4" />
                              Đăng ký
                            </Link>
                          </Button>
                        </div>
                      </SignedOut>
                      <SignedIn>
                        <div className="flex flex-col gap-2 px-2">
                          <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors">
                            <Settings className="h-4 w-4" />
                            Quản trị viên
                          </Link>
                        </div>
                      </SignedIn>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <div className="relative h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-lg">
                  <Image
                    src="/app-logo.png"
                    alt="TN Home"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 80px, 96px"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl md:text-4xl font-black tracking-tight text-primary leading-none">
                    TN Home
                  </span>
                  <span className="text-xs md:text-sm font-medium text-muted-foreground leading-none tracking-widest uppercase">
                    Gia dụng và Nội thất
                  </span>
                </div>
              </Link>
            </div>

            {/* Search Bar - Centered & Prominent */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-auto">
              <div className="relative w-full flex items-center">
                <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-12 bg-muted/50 rounded-l-full border border-r-0 border-input">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm nội thất, trang trí và hơn thế nữa..."
                  className="w-full h-11 pl-12 pr-12 bg-muted/10 border border-input focus:border-primary rounded-full outline-none text-sm transition-all focus:bg-background focus:ring-4 focus:ring-primary/10"
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1 h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Search Icon Only */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden ml-auto"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-6 w-6" />
            </Button>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-4 shrink-0">
              <div className="hidden md:flex items-center gap-2 border-r border-border pr-4 mr-1">
                <SignedOut>
                  <Link href="/sign-in" className="flex items-center gap-2 hover:text-primary transition-colors text-sm font-medium">
                    <User className="h-5 w-5" />
                    <span>Đăng nhập</span>
                  </Link>
                  <span className="text-muted-foreground">/</span>
                  <Link href="/sign-up" className="hover:text-primary transition-colors text-sm font-medium">
                    Đăng ký
                  </Link>
                </SignedOut>

                <SignedIn>
                  <Link href="/admin" className="flex items-center gap-2 hover:text-primary transition-colors text-sm font-medium" title="Quản trị viên">
                    <Settings className="h-5 w-5" />
                  </Link>
                  <div className="pl-2">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
              </div>

              {/* Cart */}
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  className="relative flex items-center gap-2 md:px-4 h-11 rounded-full hover:bg-primary/5 group"
                  onClick={openCart}
                >
                  <div className="relative">
                    <ShoppingBag className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background">
                        {itemCount > 99 ? "99+" : itemCount}
                      </span>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col items-start gap-0.5 text-xs">
                    <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                      Giỏ hàng
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Search Expanded */}
          {isSearchOpen && (
            <div className="lg:hidden border-t px-4 py-3 bg-background animate-in slide-in-from-top-1 duration-200">
              <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full h-10 pl-9 pr-4 rounded-full border border-input bg-muted/20 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        {/* Categories Navigation - Sticky */}
        <div className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b shadow-sm">
          <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-4 md:px-6 overflow-x-auto">

            {/* All Categories Dropdown Trigger Design */}
            <Button className="shrink-0 gap-2 rounded-full hidden md:flex" size="sm">
              <Menu className="h-4 w-4" />
              <span>Danh mục</span>
            </Button>

            <div className="h-6 w-px bg-border mx-2 hidden md:block" />

            <nav className="flex items-center gap-1 md:gap-2 pr-4 md:pr-0">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className={`
                    whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-full transition-all border border-transparent shrink-0
                    ${category.highlight
                      ? "text-primary bg-primary/5 hover:bg-primary/10 border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            <div className="ml-auto shrink-0 hidden lg:block">
              <Link href="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                Xem tất cả <ChevronDown className="h-4 w-4 -rotate-90" />
              </Link>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
