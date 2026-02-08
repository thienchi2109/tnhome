"use client";

import { createContext, useContext } from "react";

interface AdminLayoutContextValue {
  isMobile: boolean;
  openSidebar: () => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextValue>({
  isMobile: false,
  openSidebar: () => {},
});

export function AdminLayoutProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AdminLayoutContextValue;
}) {
  return (
    <AdminLayoutContext.Provider value={value}>
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  return useContext(AdminLayoutContext);
}
