"use client";

import Image from "next/image";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminLayout } from "@/components/admin/admin-layout-context";
import { useAuth } from "@/lib/supabase/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  title: string;
  description?: string;
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  const { openSidebar } = useAdminLayout();
  const { user, isLoading, signOut } = useAuth();

  const avatar = user?.user_metadata?.avatar_url;
  const avatarUrl = typeof avatar === "string" ? avatar : null;
  const userInitial = (user?.email?.charAt(0) ?? "U").toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 px-4 backdrop-blur-sm xl:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="xl:hidden"
          onClick={openSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground xl:text-xl">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="h-9 w-9 rounded-full bg-muted/50" aria-hidden />
        ) : user ? (
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
        ) : null}
      </div>
    </header>
  );
}
