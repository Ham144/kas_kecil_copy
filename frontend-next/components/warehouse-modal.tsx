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

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
}

export function WarehouseModal({
  isOpen,
  onClose,
  onSave,
  initialName,
}: WarehouseModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(initialName || "");
      setError("");
    }
  }, [isOpen, initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Warehouse name is required");
      return;
    }

    onSave(name);
    setName("");
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
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g., Warehouse A - Jakarta"
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
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
              {initialName ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
