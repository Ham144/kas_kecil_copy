"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { Button } from "@radix-ui/themes";
import type { Warehouse } from "@/types/warehouse";

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; location?: string; description?: string }) => void;
  initialName?: string;
  initialWarehouse?: Warehouse | null;
}

export function WarehouseModal({
  isOpen,
  onClose,
  onSave,
  initialName,
  initialWarehouse,
}: WarehouseModalProps) {
  const [formData, setFormData] = useState({
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
          location: initialWarehouse.location || "",
          description: initialWarehouse.description || "",
        });
      } else {
        setFormData({
          name: initialName || "",
          location: "",
          description: "",
        });
      }
      setError("");
    }
  }, [isOpen, initialName, initialWarehouse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Warehouse name is required");
      return;
    }

    onSave(formData);
    setFormData({ name: "", location: "", description: "" });
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white p-3  shadow-md border rounded-lg absolute w-full mx-auto container flex flex-col justify-center  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <DialogTitle>
          {initialName ? "Edit Warehouse" : "Add Warehouse"}
        </DialogTitle>
        <DialogDescription>
          {initialName
            ? "Update the warehouse name"
            : "Create a new warehouse location"}
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">
              Warehouse Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setError("");
              }}
              placeholder="e.g., Warehouse A - Jakarta"
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => {
                setFormData({ ...formData, location: e.target.value });
              }}
              placeholder="e.g., Jakarta"
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
              }}
              placeholder="Warehouse description..."
              rows={3}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="soft"
              onClick={onClose}
              className="flex-1 rounded-xl bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {initialWarehouse || initialName ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
