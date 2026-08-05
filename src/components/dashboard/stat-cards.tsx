"use client";

import Link from "next/link";
import { Inbox, Send, Archive, ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuratCounts } from "@/hooks/use-surat";

const cards = [
  {
    title: "Total Surat Masuk",
    key: "masuk" as const,
    href: "/surat-masuk",
    icon: Inbox,
    description: "Surat masuk terkelola",
    color: "bg-primary text-primary-foreground",
  },
  {
    title: "Total Surat Keluar",
    key: "keluar" as const,
    href: "/surat-keluar",
    icon: Send,
    description: "Surat keluar terkirim",
    color: "bg-emerald-600 text-white",
  },
  {
    title: "Total Arsip Surat",
    key: "total" as const,
    href: "/arsip",
    icon: Archive,
    description: "Keseluruhan arsip surat",
    color: "bg-amber-500 text-white",
  },
];

export function StatCards() {
  const { data, isLoading, isError } = useSuratCounts();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.key} href={card.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  {card.title}
                </CardTitle>
                <div
                  className={`flex size-10 items-center justify-center rounded-lg ${card.color}`}
                >
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-9 w-20" />
                ) : isError ? (
                  <p className="text-3xl font-bold">-</p>
                ) : (
                  <p className="text-3xl font-bold tracking-tight">
                    {data?.[card.key] ?? 0}
                  </p>
                )}
                <CardDescription className="mt-1 flex items-center gap-1 text-xs">
                  {card.description}
                  <ArrowUpRight className="size-3" />
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
