import React, { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.layout";
import Topbar from "./TopBar.layout";

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Stable callbacks so memoized children don't re-render needlessly
  const closeSidebar = useCallback(() => setIsMobileOpen(false), []);
  const toggleSidebar = useCallback(() => setIsMobileOpen((prev) => !prev), []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={isMobileOpen} onClose={closeSidebar} />

      <div className="flex flex-1 flex-col min-w-0">
        <Topbar onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
