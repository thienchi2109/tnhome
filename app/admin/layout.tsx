"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminQueryProvider } from "@/components/admin/admin-query-provider";
import { AdminLayoutProvider } from "@/components/admin/admin-layout-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="xl:pl-64">
        <AdminLayoutProvider
          value={{ openSidebar: () => setSidebarOpen(true) }}
        >
          <AdminQueryProvider>{children}</AdminQueryProvider>
        </AdminLayoutProvider>
      </div>
    </div>
  );
}
