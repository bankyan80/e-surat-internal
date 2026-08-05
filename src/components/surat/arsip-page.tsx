"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { SuratTable } from "@/components/surat/surat-table";
import { SuratDetailDialog } from "@/components/surat/surat-detail-dialog";
import { PdfPreviewDialog } from "@/components/surat/pdf-preview-dialog";
import {
  SuratFilterBar,
  type SuratFilterValues,
} from "@/components/surat/surat-filter-bar";
import { useSuratQuery } from "@/hooks/use-surat";
import { useGlobalSearch } from "@/components/providers/search-provider";
import { PAGE_SIZE } from "@/lib/constants";
import type { Surat } from "@/lib/types";

export function ArsipPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<SuratFilterValues>({});

  const [detail, setDetail] = useState<Surat | null>(null);
  const [preview, setPreview] = useState<Surat | null>(null);

  const globalSearch = useGlobalSearch();

  useEffect(() => {
    setSearch(globalSearch.search);
  }, [globalSearch.search]);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const query = useMemo<Parameters<typeof useSuratQuery>[0]>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search,
      jenis: undefined,
      ...filters,
    }),
    [page, search, filters]
  );

  const { data, isFetching } = useSuratQuery(query);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Arsip Surat"
        description="Seluruh arsip surat masuk dan surat keluar, diurutkan berdasarkan tanggal terbaru."
      />

      <SuratFilterBar
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <SuratTable
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        totalPages={data?.totalPages ?? 1}
        loading={isFetching}
        onPageChange={setPage}
        onView={(surat) => setDetail(surat)}
        onPreview={(surat) => setPreview(surat)}
        showJenis
      />

      <SuratDetailDialog
        open={Boolean(detail)}
        onOpenChange={(open) => !open && setDetail(null)}
        surat={detail}
      />

      <PdfPreviewDialog
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
        filePath={preview?.file_pdf ?? ""}
        title={preview?.nomor_surat}
      />
    </div>
  );
}
