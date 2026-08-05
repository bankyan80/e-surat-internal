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
  PanelLeftClose,
  PanelLeftOpen,
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
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
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
          title={collapsed ? item.title : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            collapsed && "justify-center px-2",
            active
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon className="size-4 shrink-0" />
          {!collapsed && item.title}
        </Link>
      );
    });

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-r bg-sidebar transition-[width] duration-200 md:flex md:flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-2 border-b px-6",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <FileText className="size-5" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-wide">{APP_NAME}</p>
            <p className="text-[11px] text-muted-foreground">E-Surat Internal</p>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {renderNav(baseNav)}
        {isAdmin && (
          <>
            {!collapsed && (
              <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Administrasi
              </div>
            )}
            {renderNav(adminNav)}
          </>
        )}
      </nav>
      <div className="border-t p-4">
        {!collapsed ? (
          <p className="text-[11px] leading-snug text-muted-foreground">
            {INSTITUTION_NAME}
          </p>
        ) : (
          <div className="flex justify-center">
            <FileText className="size-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Buka sidebar" : "Lipat sidebar"}
        className="flex h-9 items-center justify-center border-t text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4" />
        ) : (
          <PanelLeftClose className="size-4" />
        )}
      </button>
    </aside>
  );
}
