"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { SuratTable } from "@/components/surat/surat-table";
import { SuratFormDialog } from "@/components/surat/surat-form-dialog";
import { SuratDetailDialog } from "@/components/surat/surat-detail-dialog";
import { DeleteSuratDialog } from "@/components/surat/delete-surat-dialog";
import { PdfPreviewDialog } from "@/components/surat/pdf-preview-dialog";
import { SuratFilterBar, type SuratFilterValues } from "@/components/surat/surat-filter-bar";
import { useSuratQuery, useDeleteSurat } from "@/hooks/use-surat";
import { useGlobalSearch } from "@/components/providers/search-provider";
import { PAGE_SIZE } from "@/lib/constants";
import { toast } from "sonner";
import type { JenisSurat, Surat } from "@/lib/types";

interface SuratListPageProps {
  title: string;
  description: string;
  jenis: JenisSurat;
}

export function SuratListPage({ title, description, jenis }: SuratListPageProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<SuratFilterValues>({});

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Surat | null>(null);
  const [detail, setDetail] = useState<Surat | null>(null);
  const [preview, setPreview] = useState<Surat | null>(null);
  const [deleting, setDeleting] = useState<Surat | null>(null);

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
      jenis,
      ...filters,
    }),
    [page, search, filters, jenis]
  );

  const { data, isFetching } = useSuratQuery(query);
  const deleteMutation = useDeleteSurat();

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (surat: Surat) => {
    setEditing(surat);
    setFormOpen(true);
  };

  const handleView = (surat: Surat) => {
    setDetail(surat);
  };

  const handlePreview = (surat: Surat) => {
    setPreview(surat);
  };

  const handleDelete = async (surat: Surat) => {
    const result = await deleteMutation.mutateAsync(surat.id);
    if (result.success) {
      toast.success("Surat berhasil dihapus.");
      setDeleting(null);
    } else {
      toast.error(result.error ?? "Gagal menghapus surat.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description}>
        <Button onClick={handleCreate}>
          <Plus className="size-4" />
          Tambah Surat
        </Button>
      </PageHeader>

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
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPreview={handlePreview}
        showJenis={false}
      />

      <SuratFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        jenis={jenis}
        surat={editing}
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

      <DeleteSuratDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        surat={deleting}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
