"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Send,
  Archive,
  UserRound,
  ScrollText,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { INSTITUTION_NAME } from "@/lib/constants";
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

export function MobileSidebar({
  open,
  role,
  onClose,
}: {
  open: boolean;
  role: Role;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const isAdmin = role === "Administrator";

  if (!open) return null;

  const renderItems = (
    items: { title: string; href: string; icon: typeof LayoutDashboard }[]
  ) =>
    items.map((item) => {
      const active = pathname === item.href;
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            active
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon className="size-4 shrink-0" />
          {item.title}
        </Link>
      );
    });

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar shadow-xl">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-wide">SIMSURAT</p>
            <p className="text-[11px] text-muted-foreground">E-Surat Internal</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {renderItems(baseNav)}
          {isAdmin && (
            <>
              <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Administrasi
              </div>
              {renderItems(adminNav)}
            </>
          )}
        </nav>
        <div className="border-t p-4">
          <p className="text-[11px] leading-snug text-muted-foreground">
            {INSTITUTION_NAME}
          </p>
        </div>
      </div>
    </div>
  );
}
