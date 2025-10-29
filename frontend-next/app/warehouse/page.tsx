"use client";

import { useState } from "react";
import { TopNavigation } from "../../components/top-navigation";
import { toast } from "sonner";
import { WarehouseModal } from "../../components/warehouse-modal";
import { WarehouseTable } from "../../components/warehouse-table";
import { useRouter } from "next/navigation";

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState([
    { id: "1", name: "Warehouse A - Jakarta", budgets: 3 },
    { id: "2", name: "Warehouse B - Surabaya", budgets: 2 },
    { id: "3", name: "Warehouse C - Bandung", budgets: 5 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleAddWarehouse = () => {
    setEditingWarehouse(null);
    setIsModalOpen(true);
  };

  const handleEditWarehouse = (warehouse: { id: string; name: string }) => {
    setEditingWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleDeleteWarehouse = (id: string) => {
    setWarehouses((prev) => prev.filter((w) => w.id !== id));
    toast("Warehouse deleted successfully");
  };

  const handleSaveWarehouse = (name: string) => {
    if (editingWarehouse) {
      // Edit mode
      setWarehouses((prev) =>
        prev.map((w) => (w.id === editingWarehouse.id ? { ...w, name } : w))
      );
      toast("Warehouse updated successfully");
    } else {
      // Create mode
      const newWarehouse = {
        id: Date.now().toString(),
        name,
        budgets: 0,
      };
      setWarehouses((prev) => [newWarehouse, ...prev]);
      toast("Warehouse created successfully");
    }
    setIsModalOpen(false);
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
        initialName={editingWarehouse?.name}
      />
    </div>
  );
}
