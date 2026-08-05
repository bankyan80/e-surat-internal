"use client";

import { useRouter } from "next/navigation";
import { Search, Moon, Sun, LogOut, Menu, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/components/providers/theme-provider";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import { APP_NAME, ROLE_LABELS } from "@/lib/constants";
import { signOut } from "@/lib/auth-actions";
import { useGlobalSearch } from "@/components/providers/search-provider";
import type { Profile } from "@/lib/types";

interface NavbarProps {
  profile: Profile;
  onMenuClick: () => void;
}

export function Navbar({ profile, onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { setSearch } = useGlobalSearch();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value.trim());
  }, 400);

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Berhasil logout.");
    router.push("/login");
    router.refresh();
  };

  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : profile.email.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="size-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="size-4" />
          </div>
          <span className="text-sm font-bold">{APP_NAME}</span>
        </div>
      </div>

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari nomor surat, perihal, atau tujuan..."
          defaultValue=""
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Ganti tema"
        >
          {theme === "light" ? <Moon className="size-5" /> : <Sun className="size-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full outline-none ring-primary focus-visible:ring-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {profile.full_name || profile.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {profile.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <span className="text-xs font-medium">
                Role: {ROLE_LABELS[profile.role]}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
