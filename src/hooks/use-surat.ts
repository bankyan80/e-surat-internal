"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  fetchSurat,
  fetchSuratCounts,
  fetchMonthlyData,
  fetchLatestSurat,
  fetchProfiles,
  fetchAuditLogs,
} from "@/lib/surat-service";
import { createSurat, updateSurat, deleteSurat } from "@/lib/surat-actions";
import type { SuratQuery } from "@/lib/types";

export const queryKeys = {
  surat: (query: SuratQuery) => ["surat", query] as const,
  suratList: ["surat-list"] as const,
  counts: ["surat-counts"] as const,
  monthly: (year: number) => ["surat-monthly", year] as const,
  latest: (limit: number) => ["surat-latest", limit] as const,
  profiles: ["profiles"] as const,
  auditLogs: ["audit-logs"] as const,
};

const prefixKeys = [
  "surat",
  "surat-list",
  "surat-counts",
  "surat-monthly",
  "surat-latest",
];

export function invalidateSuratQueries(
  queryClient: ReturnType<typeof useQueryClient>
) {
  for (const key of prefixKeys) {
    queryClient.invalidateQueries({ queryKey: [key] });
  }
}

export function useSuratQuery(query: SuratQuery) {
  return useQuery({
    queryKey: queryKeys.surat(query),
    queryFn: () => fetchSurat(query),
    placeholderData: (prev) => prev,
  });
}

export function useSuratCounts() {
  return useQuery({
    queryKey: queryKeys.counts,
    queryFn: fetchSuratCounts,
  });
}

export function useMonthlyData(year: number) {
  return useQuery({
    queryKey: queryKeys.monthly(year),
    queryFn: () => fetchMonthlyData(year),
  });
}

export function useLatestSurat(limit = 10) {
  return useQuery({
    queryKey: queryKeys.latest(limit),
    queryFn: () => fetchLatestSurat(limit),
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: queryKeys.profiles,
    queryFn: fetchProfiles,
  });
}

export function useAuditLogs(limit = 50) {
  return useQuery({
    queryKey: queryKeys.auditLogs,
    queryFn: () => fetchAuditLogs(limit),
  });
}

export function useCreateSurat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: unknown) => createSurat(input),
    onSuccess: () => invalidateSuratQueries(queryClient),
  });
}

export function useUpdateSurat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: unknown }) =>
      updateSurat(id, input),
    onSuccess: () => invalidateSuratQueries(queryClient),
  });
}

export function useDeleteSurat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSurat(id),
    onSuccess: () => invalidateSuratQueries(queryClient),
  });
}
