"use client";

import { createContext, useContext } from "react";

interface AdminLayoutContextValue {
  openSidebar: () => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextValue>({
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
