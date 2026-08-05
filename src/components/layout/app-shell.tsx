"use client";

import { useState } from "react";
import { SearchProvider } from "@/components/providers/search-provider";
import { Navbar } from "@/components/layout/navbar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import type { Profile } from "@/lib/types";

export function AppShell({
  profile,
  sidebar,
  children,
}: {
  profile: Profile;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SearchProvider>
      <div className="flex min-h-screen">
        {sidebar}
        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar
            profile={profile}
            onMenuClick={() => setMenuOpen(true)}
          />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
        <MobileSidebar
          open={menuOpen}
          role={profile.role}
          onClose={() => setMenuOpen(false)}
        />
      </div>
    </SearchProvider>
  );
}
