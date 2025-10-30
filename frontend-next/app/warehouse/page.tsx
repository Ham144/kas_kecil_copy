"use client";

import { useState } from "react";
import { TopNavigation } from "../../components/top-navigation";
import { toast } from "sonner";
import { WarehouseModal } from "../../components/warehouse-modal";
import { WarehouseTable } from "../../components/warehouse-table";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WarehouseApi } from "@/api/warehouse";
import type { Warehouse, WarehouseCreateDto, WarehouseUpdateDto } from "@/types/warehouse";

export default function WarehousePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch warehouses
  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: WarehouseApi.getWarehouses,
  });

  // Create warehouse mutation
  const createMutation = useMutation({
    mutationFn: WarehouseApi.createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success("Warehouse berhasil dibuat");
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Gagal membuat warehouse";
      toast.error(errorMessage);
    },
  });

  // Update warehouse mutation
  const updateMutation = useMutation({
    mutationFn: WarehouseApi.updateWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success("Warehouse berhasil diupdate");
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Gagal mengupdate warehouse";
      toast.error(errorMessage);
    },
  });

  // Delete warehouse mutation
  const deleteMutation = useMutation({
    mutationFn: WarehouseApi.deleteWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success("Warehouse berhasil dihapus");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Gagal menghapus warehouse";
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
    if (confirm("Apakah Anda yakin ingin menghapus warehouse ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSaveWarehouse = (data: { name: string; location?: string; description?: string }) => {
    if (editingWarehouse) {
      // Edit mode
      const updateData: WarehouseUpdateDto = {
        id: editingWarehouse.id,
        ...data,
      };
      updateMutation.mutate(updateData);
    } else {
      // Create mode
      const createData: WarehouseCreateDto = data;
      createMutation.mutate(createData);
    }
  };

  const filteredWarehouses = warehouses.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
          {/* Header */}
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

          {/* Table Section */}
          <WarehouseTable
            warehouses={filteredWarehouses}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAddWarehouse}
            onEdit={handleEditWarehouse}
            onDelete={handleDeleteWarehouse}
          />
        </div>
      </main>

      {/* Modal */}
      <WarehouseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWarehouse}
        initialWarehouse={editingWarehouse}
      />
    </div>
  );
}
