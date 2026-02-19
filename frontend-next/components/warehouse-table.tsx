"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Card } from "@radix-ui/themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Warehouse } from "@/types/warehouse";
import { WarehouseApi } from "@/api/warehouse";
import { UserInfo } from "@/types/auth";

interface WarehouseTableProps {
  warehouses: Warehouse[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdd: () => void;
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (id: string) => void;
}
export function WarehouseTable({
  warehouses,
  searchQuery,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
}: WarehouseTableProps) {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteWarehouseMutation = useMutation({
    mutationFn: async (id: string) => await WarehouseApi.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Gudang berhasil dihapus");
      setDeleteId(null);
      const dialog = document.getElementById(
        "delete-warehouse-confirm",
      ) as HTMLDialogElement;
      dialog?.close();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menghapus gudang";
      toast.error(errorMessage);
    },
  });

  const handleDeleteWarehouseConfirm = async () => {
    if (deleteId) {
      deleteWarehouseMutation.mutate(deleteId);
    }
  };

  return (
    <>
      <Card className="shadow-lg">
        {/* Header */}
        <div className="border-b border-border bg-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Warehouses
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {warehouses.length} warehouse
                {warehouses.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <Button
              onClick={onAdd}
              className="gap-2 flex items-center rounded-xl bg-primary px-4 py-2.5 text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Warehouse
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search warehouses..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Warehouse Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {warehouses.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-sm text-muted-foreground"
                  >
                    No warehouses found
                  </td>
                </tr>
              ) : (
                warehouses.map((warehouse) => (
                  <React.Fragment key={warehouse.id}>
                    <tr className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {warehouse.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {warehouse.members.length || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="1"
                            onClick={() => {
                              setExpandedId(
                                expandedId === warehouse.id
                                  ? null
                                  : warehouse.id,
                              );
                            }}
                            className="gap-1"
                          >
                            {expandedId === warehouse.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline text-xs">
                              Details
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="1"
                            onClick={() => onEdit(warehouse)}
                            className="gap-1"
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="hidden sm:inline text-xs">
                              Edit
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="1"
                            onClick={() => {
                              setDeleteId(warehouse.id);
                              const dialog = document.getElementById(
                                "delete-warehouse-confirm",
                              ) as HTMLDialogElement;
                              dialog?.showModal();
                            }}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline text-xs">
                              Delete
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === warehouse.id && (
                      <tr className="border-b border-border bg-muted/10">
                        <td colSpan={3} className="px-6 py-4">
                          <div className="space-y-3">
                            <div className="flex flex-col gap-2 text-sm">
                              {warehouse.description && (
                                <div>
                                  <span className="font-medium text-foreground">
                                    Description:
                                  </span>
                                  <p className="text-muted-foreground mt-1">
                                    {warehouse.description}
                                  </p>
                                </div>
                              )}

                              <div className="flex justify-between px-3">
                                {warehouse.members &&
                                  warehouse.members.length > 0 && (
                                    <div>
                                      <span className="font-medium text-foreground">
                                        Members:
                                      </span>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {warehouse.members.map(
                                          (member, index) => (
                                            <span
                                              key={index}
                                              className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                            >
                                              {member}
                                            </span>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>

                              {!warehouse.description &&
                                (!warehouse.members ||
                                  warehouse.members.length === 0) && (
                                  <p className="text-sm text-muted-foreground text-center py-2">
                                    No additional information available
                                  </p>
                                )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Dialog */}
        <dialog id="delete-warehouse-confirm" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Hapus Warehouse</h3>
            <p className="py-4">
              Apakah Anda yakin ingin menghapus warehouse ini? Tindakan ini
              tidak dapat dibatalkan.
            </p>
            <div className="modal-action">
              <form method="dialog" className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const dialog = document.getElementById(
                      "delete-warehouse-confirm",
                    ) as HTMLDialogElement;
                    dialog?.close();
                    setDeleteId(null);
                  }}
                  className="btn btn-outline"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteWarehouseConfirm}
                  disabled={deleteWarehouseMutation.isPending}
                  className="btn btn-error text-white"
                >
                  {deleteWarehouseMutation.isPending ? "Menghapus..." : "Hapus"}
                </button>
              </form>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button
              type="button"
              onClick={() => {
                setDeleteId(null);
              }}
            >
              close
            </button>
          </form>
        </dialog>
      </Card>
    </>
  );
}
