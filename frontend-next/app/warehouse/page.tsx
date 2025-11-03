"use client";

import { useMemo, useState } from "react";
import { TopNavigation } from "../../components/top-navigation";
import { toast } from "sonner";
import { WarehouseModal } from "../../components/warehouse-modal";
import { WarehouseTable } from "../../components/warehouse-table";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WarehouseApi } from "@/api/warehouse";
import type {
  Warehouse,
  WarehouseCreateDto,
  WarehouseUpdateDto,
} from "@/types/warehouse";

export default function WarehousePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: warehouses = [],
    isLoading,
    isFetching,
    error: fetchError,
  } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => WarehouseApi.getWarehouses(),
    retry: 1,
    staleTime: 30000, // 30 seconds
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
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal membuat warehouse";
      toast.error(errorMessage);
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
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal mengupdate warehouse";
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await WarehouseApi.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse berhasil dihapus");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menghapus warehouse";
      toast.error(errorMessage);
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
    if (
      window.confirm(
        "Are you sure you want to delete this warehouse? This action cannot be undone."
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const handleSaveWarehouse = (data: WarehouseCreateDto) => {
    if (!data.name.trim()) {
      toast.error("Warehouse name is required");
      return;
    }

    const payload: WarehouseCreateDto = {
      name: data.name.trim(),
      location: data.location?.trim() || undefined,
      description: data.description?.trim() || undefined,
    };

    if (editingWarehouse) {
      const updatePayload: WarehouseUpdateDto = {
        id: editingWarehouse.id,
        name: payload.name,
        location: payload.location,
        description: payload.description,
      };
      updateMutation.mutate(updatePayload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredWarehouses = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return warehouses;

    return warehouses.filter((warehouse) =>
      [warehouse.name, warehouse.location, warehouse.description]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(keyword))
    );
  }, [warehouses, searchQuery]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span
                className="cursor-pointer "
                onClick={() => {
                  router.push("/setup");
                }}
              >
                Setup
              </span>
              <span>/</span>
              <span className="text-foreground font-medium">Warehouse</span>
            </div>
            <h1 className="text-3xl font-semibold text-foreground">
              Warehouse Setup
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your warehouse locations and budgets
            </p>
          </div>

          <WarehouseTable
            warehouses={filteredWarehouses}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAddWarehouse}
            onEdit={handleEditWarehouse}
            onDelete={handleDeleteWarehouse}
          />

          {isLoading && (
            <div className="mt-4 flex items-center justify-center py-8">
              <span className="text-sm text-muted-foreground">
                Loading warehouses...
              </span>
            </div>
          )}

          {fetchError && (
            <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                {fetchError instanceof Error
                  ? fetchError.message
                  : "Failed to load warehouses. Please try again."}
              </p>
            </div>
          )}
        </div>
      </main>

      <WarehouseModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsModalOpen(false);
          }
        }}
        onSave={handleSaveWarehouse}
        initialWarehouse={editingWarehouse}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
