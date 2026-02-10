"use client";

import dynamic from "next/dynamic";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminLayout } from "@/components/admin/admin-layout-context";

interface AdminHeaderProps {
  title: string;
  description?: string;
}

const ClerkUserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  {
    ssr: false,
    loading: () => <div className="h-9 w-9 rounded-full bg-muted/50" aria-hidden />,
  }
);

export function AdminHeader({ title, description }: AdminHeaderProps) {
  const { openSidebar } = useAdminLayout();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur-sm px-4 xl:px-6">
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
          <h1 className="text-lg xl:text-xl font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ClerkUserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
      </div>
    </header>
  );
}
