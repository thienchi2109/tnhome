"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Menu,
  User,
  Settings,
  ChevronDown,
  LogIn,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/store/cart";
import { HeaderSearchInput } from "./header-search-input";
import { useAuth } from "@/lib/supabase/auth-context";
import Image from "next/image";

interface CategoryWithSlug {
  name: string;
  slug: string;
}

interface HeaderProps {
  categoriesWithSlugs?: CategoryWithSlug[];
}

function getAvatarUrl(user: ReturnType<typeof useAuth>["user"]) {
  const avatar = user?.user_metadata?.avatar_url;
  return typeof avatar === "string" ? avatar : null;
}

export function Header({ categoriesWithSlugs = [] }: HeaderProps) {
  const { openCart } = useCartStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isLoading, isAdmin, signOut } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Use useSyncExternalStore for SSR-safe cart count
  const itemCount = useSyncExternalStore(
    useCartStore.subscribe,
    () => useCartStore.getState().getItemCount(),
    () => 0 // Server snapshot - return 0 during SSR
  );

  const query = searchParams.toString();
  const redirectPath = `${pathname}${query ? `?${query}` : ""}`;
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`;

  const avatarUrl = getAvatarUrl(user);
  const userInitial = (user?.email?.charAt(0) ?? "U").toUpperCase();

  // Build dynamic categories from DB, with a static "Sản phẩm mới" at the end
  const categories = [
    ...categoriesWithSlugs.map((c) => ({
      name: c.name,
      href: `/products?category=${c.slug}`,
      highlight: false,
    })),
    { name: "Sản phẩm mới", href: "/products?sort=newest", highlight: true },
  ];

  const regularCategories = categories.filter((c) => !c.highlight);
  const highlightedCategories = categories.filter((c) => c.highlight);
  const mobileMenuSheetId = "mobile-menu-sheet";

  return (
    <header className="relative z-50 flex w-full flex-col bg-background">
      {/* Main Header */}
      <div className="w-full border-b bg-background py-4">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 md:gap-8 md:px-6">
          {/* Mobile Menu & Logo */}
          <div className="flex shrink-0 items-center gap-3 md:gap-8">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-ml-2 h-10 w-10 lg:hidden"
                  aria-controls={mobileMenuSheetId}
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                id={mobileMenuSheetId}
                side="left"
                className="w-[300px] overflow-y-auto"
              >
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <Link
                      href="/"
                      onClick={() => setIsSidebarOpen(false)}
                      className="flex items-center gap-2"
                    >
                      <div className="relative h-8 w-8 overflow-hidden rounded-sm">
                        <Image
                          src="/app-logo.png"
                          alt="TN Home"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-lg font-bold text-primary">TN Home</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 py-6">
                  <div className="flex flex-col gap-1">
                    <h3 className="px-2 pb-2 text-sm font-medium text-muted-foreground">Danh mục</h3>
                    <nav className="flex flex-col gap-1">
                      {categories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                            category.highlight
                              ? "bg-primary/5 text-primary hover:bg-primary/10"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </nav>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="px-2 pb-2 text-sm font-medium text-muted-foreground">Tài khoản</h3>
                    <div>
                      {!user ? (
                        <div className="grid gap-2 px-2">
                          <Button asChild variant="outline" className="w-full justify-start gap-2">
                            <Link href={signInHref} onClick={() => setIsSidebarOpen(false)}>
                              <LogIn className="h-4 w-4" />
                              Đăng nhập
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 px-2">
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setIsSidebarOpen(false)}
                              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                            >
                              <Settings className="h-4 w-4" />
                              Quản trị viên
                            </Link>
                          )}
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            onClick={() => {
                              setIsSidebarOpen(false);
                              void signOut();
                            }}
                          >
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="group flex shrink-0 items-center gap-2">
              <div className="relative h-20 w-20 overflow-hidden rounded-lg md:h-24 md:w-24">
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
                <span className="text-3xl font-black leading-none tracking-tight text-primary md:text-4xl">
                  TN Home
                </span>
                <span className="text-xs font-medium leading-none tracking-widest text-muted-foreground uppercase md:text-sm">
                  Gia dụng và Nội thất
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Centered & Prominent */}
          <div className="mx-auto hidden max-w-2xl flex-1 lg:flex">
            <HeaderSearchInput variant="desktop" placeholder="Tìm kiếm sản phẩm..." />
          </div>

          {/* Mobile Search Icon Only */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-6 w-6" />
          </Button>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1 md:gap-4">
            <div className="mr-1 hidden items-center gap-2 border-r border-border pr-4 md:flex">
              <div className="flex items-center gap-2">
                {!user ? (
                  <Link
                    href={signInHref}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                  >
                    <User className="h-5 w-5" />
                    <span>Đăng nhập</span>
                  </Link>
                ) : (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="relative h-9 w-9 overflow-hidden rounded-full border border-border/70 bg-muted"
                          aria-label="Tài khoản"
                        >
                          {avatarUrl ? (
                            <Image
                              src={avatarUrl}
                              alt="User avatar"
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-xs font-semibold">
                              {userInitial}
                            </span>
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="truncate">
                          {user.email ?? "Tài khoản"}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {isAdmin && (
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="flex w-full items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Quản trị viên
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {isAdmin && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                          onClick={() => {
                            void signOut();
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          Đăng xuất
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>

            {/* Cart */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="group relative flex h-11 items-center gap-2 rounded-full md:px-4 hover:bg-primary/5"
                onClick={openCart}
              >
                <div className="relative">
                  <ShoppingBag className="h-6 w-6 text-foreground transition-colors group-hover:text-primary" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </div>
                <div className="hidden flex-col items-start gap-0.5 text-xs md:flex">
                  <span className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                    Giỏ hàng
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search Expanded */}
        {isSearchOpen && (
          <div className="animate-in slide-in-from-top-1 border-t bg-background px-4 py-3 duration-200 lg:hidden">
            <HeaderSearchInput
              variant="mobile"
              autoFocus
              placeholder="Tìm kiếm..."
              onSearchSubmit={() => setIsSearchOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Categories Navigation - Sticky */}
      <div className="sticky top-0 z-40 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 overflow-x-auto px-4 md:px-6 scrollbar-hide">
          {/* All Categories Dropdown Trigger Design */}
          <Button className="hidden shrink-0 gap-2 rounded-full md:flex" size="sm">
            <Menu className="h-4 w-4" />
            <span>Danh mục</span>
          </Button>

          <div className="mx-2 hidden h-6 w-px bg-border md:block" />

          <nav className="flex w-full flex-1 items-center justify-center gap-1 pr-4 md:w-auto md:gap-2 md:pr-0">
            {/* Mobile View: Scrollable list of ALL categories */}
            <div className="flex w-full items-center gap-1 md:hidden">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className={`
                      shrink-0 whitespace-nowrap rounded-full border border-transparent px-3 py-1.5 text-sm font-medium transition-all
                      ${
                        category.highlight
                          ? "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }
                    `}
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Desktop View: Top 5 Regular + Dropdown + Highlighted */}
            <div className="hidden items-center gap-2 md:flex">
              {regularCategories.slice(0, 5).map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="shrink-0 whitespace-nowrap rounded-full border border-transparent px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                >
                  {category.name}
                </Link>
              ))}

              {regularCategories.length > 5 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 rounded-full px-3 text-muted-foreground hover:text-foreground"
                    >
                      Xem thêm <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-[60vh] w-56 overflow-y-auto">
                    {regularCategories.slice(5).map((category) => (
                      <DropdownMenuItem key={category.name} asChild>
                        <Link href={category.href} className="w-full cursor-pointer">
                          {category.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {highlightedCategories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="shrink-0 whitespace-nowrap rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary/10"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
