"use client";

import { useEffect, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SuratFilters {
  tanggalFrom: string;
  tanggalTo: string;
  bulan: string;
  tahun: string;
}

export interface SuratFilterValues {
  tanggalFrom?: string;
  tanggalTo?: string;
  bulan?: number;
  tahun?: number;
}

interface SuratFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: SuratFilterValues;
  onFiltersChange: (filters: SuratFilterValues) => void;
  showDateFilter?: boolean;
}

export function SuratFilterBar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  showDateFilter = true,
}: SuratFilterBarProps) {
  const [localFilters, setLocalFilters] = useState<SuratFilters>({
    tanggalFrom: filters.tanggalFrom ?? "",
    tanggalTo: filters.tanggalTo ?? "",
    bulan: filters.bulan ? String(filters.bulan) : "",
    tahun: filters.tahun ? String(filters.tahun) : "",
  });

  const [debounced, setDebounced] = useState(search);

  useEffect(() => {
    setDebounced(search);
  }, [search]);

  useEffect(() => {
    if (debounced === search) return;
    const timer = setTimeout(() => {
      onSearchChange(debounced);
    }, 400);
    return () => clearTimeout(timer);
  }, [debounced, search, onSearchChange]);

  const applyFilters = () => {
    onFiltersChange({
      tanggalFrom: localFilters.tanggalFrom || undefined,
      tanggalTo: localFilters.tanggalTo || undefined,
      bulan: localFilters.bulan ? Number(localFilters.bulan) : undefined,
      tahun: localFilters.tahun ? Number(localFilters.tahun) : undefined,
    });
  };

  const resetFilters = () => {
    setLocalFilters({
      tanggalFrom: "",
      tanggalTo: "",
      bulan: "",
      tahun: "",
    });
    onFiltersChange({});
  };

  const hasActiveFilters =
    Boolean(localFilters.tanggalFrom) ||
    Boolean(localFilters.tanggalTo) ||
    Boolean(localFilters.bulan) ||
    Boolean(localFilters.tahun);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 4 + i);

  return (
    <div className="space-y-3 rounded-lg border bg-card p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nomor surat, perihal, atau tujuan..."
            value={debounced}
            onChange={(e) => setDebounced(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={applyFilters}
            className="flex-1 lg:flex-none"
          >
            <Filter className="size-4" />
            Terapkan Filter
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={resetFilters} className="lg:flex-none">
              <X className="size-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {showDateFilter && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label className="text-xs text-muted-foreground">Tanggal Dari</Label>
            <Input
              type="date"
              value={localFilters.tanggalFrom}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  tanggalFrom: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Tanggal Sampai</Label>
            <Input
              type="date"
              value={localFilters.tanggalTo}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  tanggalTo: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Bulan</Label>
            <Select
              value={localFilters.bulan}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, bulan: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua bulan</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {new Date(0, i).toLocaleDateString("id-ID", {
                      month: "long",
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Tahun</Label>
            <Select
              value={localFilters.tahun}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, tahun: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua tahun</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
