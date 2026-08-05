"use client";

import { useState } from "react";
import { SearchProvider } from "@/components/providers/search-provider";
import { Navbar } from "@/components/layout/navbar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Sidebar } from "@/components/layout/sidebar";
import type { Profile, Role } from "@/lib/types";

export function AppShell({
  profile,
  role,
  children,
}: {
  profile: Profile;
  role: Role;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SearchProvider>
      <div className="flex min-h-screen">
        <Sidebar
          role={role}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar
            profile={profile}
            onMenuClick={() => setMenuOpen(true)}
          />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
        <MobileSidebar
          open={menuOpen}
          role={role}
          onClose={() => setMenuOpen(false)}
        />
      </div>
    </SearchProvider>
  );
}
