"use client";

import { useMemo, useState } from "react";
import { TopNavigation } from "../../components/top-navigation";
import { toast } from "sonner";
import { WarehouseModal } from "../../components/warehouse-modal";
import { WarehouseTable } from "../../components/warehouse-table";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WarehouseApi } from "@/api/warehouse";
import { Building2, Loader2 } from "lucide-react";
import type {
  Warehouse,
  WarehouseCreateDto,
  WarehouseUpdateDto,
} from "@/types/warehouse";

export default function WarehousePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: warehouses = [],
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => WarehouseApi.getWarehouses(),
    retry: 1,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (body: WarehouseCreateDto) =>
      await WarehouseApi.createWarehouse(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse berhasil dibuat");
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Gagal membuat warehouse",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (body: WarehouseUpdateDto) =>
      await WarehouseApi.updateWarehouse(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse berhasil diupdate");
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Gagal mengupdate warehouse",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await WarehouseApi.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Gagal menghapus warehouse",
      );
    },
  });

  const handleAddWarehouse = () => {
    setEditingWarehouse(null);
    setIsModalOpen(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleDeleteWarehouse = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSaveWarehouse = (data: WarehouseCreateDto) => {
    if (!data.name.trim()) {
      toast.error("Nama warehouse wajib diisi");
      return;
    }

    const payload: WarehouseCreateDto = {
      name: data.name.trim(),
      location: data.location?.trim() || undefined,
      description: data.description?.trim() || undefined,
    };

    if (editingWarehouse) {
      updateMutation.mutate({
        id: editingWarehouse.id,
        name: payload.name,
        location: payload.location,
        description: payload.description,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredWarehouses = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return warehouses;
    return warehouses.filter((w) =>
      [w.name, w.description]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(keyword)),
    );
  }, [warehouses, searchQuery]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <TopNavigation />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => router.push("/setup")}
              className="hover:text-primary"
            >
              Setup
            </button>
            <span>/</span>
            <span className="font-medium text-foreground">Warehouse</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Warehouse Setup
                </h1>
                <p className="text-sm text-muted-foreground">
                  {warehouses.length} warehouse terdaftar
                </p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Memuat warehouse...
            </span>
          </div>
        ) : fetchError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
            {fetchError instanceof Error
              ? fetchError.message
              : "Gagal memuat warehouse"}
          </div>
        ) : (
          <WarehouseTable
            warehouses={filteredWarehouses}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAddWarehouse}
            onEdit={handleEditWarehouse}
            onDelete={handleDeleteWarehouse}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </main>

      <WarehouseModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSubmitting) setIsModalOpen(false);
        }}
        onSave={handleSaveWarehouse}
        initialWarehouse={editingWarehouse}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
