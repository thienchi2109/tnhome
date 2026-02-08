import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminQueryProvider } from "@/components/admin/admin-query-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="pl-64">
        <AdminQueryProvider>{children}</AdminQueryProvider>
      </div>
    </div>
  );
}
