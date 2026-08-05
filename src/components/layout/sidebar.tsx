"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Send,
  Archive,
  FileText,
  UserRound,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME, INSTITUTION_NAME } from "@/lib/constants";
import type { Role } from "@/lib/types";

const baseNav = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Surat Masuk", href: "/surat-masuk", icon: Inbox },
  { title: "Surat Keluar", href: "/surat-keluar", icon: Send },
  { title: "Arsip Surat", href: "/arsip", icon: Archive },
];

const adminNav = [
  { title: "Pengguna", href: "/pengguna", icon: UserRound },
  { title: "Audit Log", href: "/audit-log", icon: ScrollText },
];

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "Administrator";

  const renderNav = (
    items: { title: string; href: string; icon: typeof LayoutDashboard }[]
  ) =>
    items.map((item) => {
      const active = pathname === item.href;
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            active
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon className="size-4 shrink-0" />
          {item.title}
        </Link>
      );
    });

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <FileText className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-wide">{APP_NAME}</p>
          <p className="text-[11px] text-muted-foreground">E-Surat Internal</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {renderNav(baseNav)}
        {isAdmin && (
          <>
            <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Administrasi
            </div>
            {renderNav(adminNav)}
          </>
        )}
      </nav>
      <div className="border-t p-4">
        <p className="text-[11px] leading-snug text-muted-foreground">
          {INSTITUTION_NAME}
        </p>
      </div>
    </aside>
  );
}
