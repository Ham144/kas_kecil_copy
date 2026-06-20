"use client";

import { useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import type { Warehouse } from "@/types/warehouse";
interface WarehouseTableProps {
  warehouses: Warehouse[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdd: () => void;
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function WarehouseTable({
  warehouses,
  searchQuery,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
  isDeleting,
}: WarehouseTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
      (
        document.getElementById(
          "delete-warehouse-confirm",
        ) as HTMLDialogElement
      )?.close();
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Daftar Warehouse</h2>
            <p className="text-xs text-muted-foreground">
              {warehouses.length} warehouse ditemukan
            </p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Tambah Warehouse
          </button>
        </div>

        <div className="border-b border-border px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari warehouse..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {warehouses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-foreground">
              Tidak ada warehouse
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tambah warehouse pertama untuk memulai
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {warehouses.map((warehouse) => (
              <div key={warehouse.id}>
                <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {warehouse.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {warehouse.members?.length ?? 0} anggota
                        {warehouse.description &&
                          ` · ${warehouse.description}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(
                          expandedId === warehouse.id ? null : warehouse.id,
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      {expandedId === warehouse.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(warehouse)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteId(warehouse.id);
                        (
                          document.getElementById(
                            "delete-warehouse-confirm",
                          ) as HTMLDialogElement
                        )?.showModal();
                      }}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </button>
                  </div>
                </div>

                {expandedId === warehouse.id && (
                  <div className="border-t border-border bg-muted/20 px-5 py-4">
                    {warehouse.description && (
                      <p className="mb-3 text-sm text-muted-foreground">
                        {warehouse.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      Anggota
                    </div>
                    {warehouse.members?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {warehouse.members.map((member, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Belum ada anggota terdaftar
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <dialog id="delete-warehouse-confirm" className="modal">
        <div className="modal-box max-w-md rounded-2xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Hapus Warehouse?
          </h3>
          <p className="py-3 text-sm text-muted-foreground">
            Tindakan ini tidak dapat dibatalkan. Semua relasi terkait warehouse
            ini mungkin terpengaruh.
          </p>
          <div className="modal-action mt-2">
            <form method="dialog" className="flex w-full gap-3">
              <button
                type="button"
                onClick={() => {
                  (
                    document.getElementById(
                      "delete-warehouse-confirm",
                    ) as HTMLDialogElement
                  )?.close();
                  setDeleteId(null);
                }}
                className="btn btn-outline flex-1 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="btn btn-error flex-1 rounded-xl text-white"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={() => setDeleteId(null)}>
            close
          </button>
        </form>
      </dialog>
    </>
  );
}
