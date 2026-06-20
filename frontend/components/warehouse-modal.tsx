"use client";

import type React from "react";
import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Building2, X } from "lucide-react";
import type { WarehouseCreateDto, Warehouse } from "@/types/warehouse";

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WarehouseCreateDto) => void;
  initialWarehouse?: Warehouse | null;
  isSubmitting?: boolean;
}

export function WarehouseModal({
  isOpen,
  onClose,
  onSave,
  initialWarehouse,
  isSubmitting = false,
}: WarehouseModalProps) {
  const [formData, setFormData] = useState<WarehouseCreateDto>({
    name: "",
    location: "",
    description: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialWarehouse) {
        setFormData({
          name: initialWarehouse.name || "",
          description: initialWarehouse.description || "",
        });
      } else {
        setFormData({ name: "", location: "", description: "" });
      }
      setError("");
    }
  }, [isOpen, initialWarehouse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError("Nama warehouse wajib diisi");
      return;
    }
    onSave(formData);
  };

  const isEditMode = Boolean(initialWarehouse);
  const inputClass =
    "mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <Dialog.Root open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <Dialog.Title className="font-bold">
                    {isEditMode ? "Edit Warehouse" : "Tambah Warehouse"}
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-white/80">
                    {isEditMode
                      ? "Perbarui informasi warehouse"
                      : "Buat lokasi warehouse baru"}
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="rounded-lg p-2 hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div>
              <label className="text-sm font-medium text-foreground">
                Nama Warehouse <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setError("");
                }}
                placeholder="e.g., Mangga Dua"
                className={inputClass}
                disabled={isSubmitting}
              />
              {error && (
                <p className="mt-1 text-xs text-destructive">{error}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Deskripsi
              </label>
              <textarea
                value={formData.description ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Keterangan warehouse (opsional)..."
                rows={3}
                className={inputClass}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : isEditMode
                    ? "Update"
                    : "Simpan"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
