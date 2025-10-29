"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { AlertDialog, Button, Card } from "@radix-ui/themes";

interface Warehouse {
  id: string;
  name: string;
  budgets: number;
}

interface WarehouseTableProps {
  warehouses: Warehouse[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdd: () => void;
  onEdit: (warehouse: { id: string; name: string }) => void;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(
    null
  );
  const [budgetForm, setBudgetForm] = useState({
    month: 10,
    year: 2025,
    amount: "",
  });

  const mockBudgets = {
    "1": [
      { month: 10, year: 2025, amount: 5000000 },
      { month: 9, year: 2025, amount: 4500000 },
      { month: 8, year: 2025, amount: 6000000 },
    ],
    "2": [
      { month: 10, year: 2025, amount: 3000000 },
      { month: 9, year: 2025, amount: 3500000 },
    ],
    "3": [
      { month: 10, year: 2025, amount: 7000000 },
      { month: 9, year: 2025, amount: 6500000 },
      { month: 8, year: 2025, amount: 5500000 },
      { month: 7, year: 2025, amount: 6000000 },
      { month: 6, year: 2025, amount: 5800000 },
    ],
  };

  const handleAddBudget = () => {
    if (!budgetForm.amount) {
      toast.error("Please enter an amount");
      return;
    }
    toast.success(
      `Budget added for ${new Date(budgetForm.year, budgetForm.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
    );
    setBudgetDialogOpen(false);
    setBudgetForm({ month: 10, year: 2025, amount: "" });
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
                  Number of Budgets
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
                  <>
                    <tr
                      key={warehouse.id}
                      className="border-b border-border hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {warehouse.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {warehouse.budgets} budget
                        {warehouse.budgets !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedId(
                                expandedId === warehouse.id
                                  ? null
                                  : warehouse.id
                              )
                            }
                            className="gap-1"
                          >
                            {expandedId === warehouse.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline text-xs">
                              View
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onEdit({ id: warehouse.id, name: warehouse.name })
                            }
                            className="gap-1"
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="hidden sm:inline text-xs">
                              Edit
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(warehouse.id)}
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
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-foreground">
                                Budgets
                              </h4>
                              <Dialog.Root
                                open={
                                  budgetDialogOpen &&
                                  selectedWarehouseId === warehouse.id
                                }
                                onOpenChange={(open) => {
                                  setBudgetDialogOpen(open);
                                  if (open)
                                    setSelectedWarehouseId(warehouse.id);
                                }}
                              >
                                <Dialog.Trigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 bg-slate-800 flex items-center rounded-lg text-xs  text-white p-3 hover:bg-primary/10"
                                    onClick={() => {
                                      setSelectedWarehouseId(warehouse.id);
                                      setBudgetDialogOpen(true);
                                    }}
                                  >
                                    <Plus className="h-3 w-3" />
                                    Add Budget
                                  </Button>
                                </Dialog.Trigger>
                                <Dialog.Portal>
                                  <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
                                  <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
                                    <Dialog.Title className="text-lg font-semibold text-foreground">
                                      Add Budget
                                    </Dialog.Title>
                                    <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                                      Add a new budget for {warehouse.name}
                                    </Dialog.Description>

                                    <div className="mt-6 space-y-4">
                                      <div>
                                        <label className="text-sm font-medium text-foreground">
                                          Month
                                        </label>
                                        <select
                                          value={budgetForm.month}
                                          onChange={(e) =>
                                            setBudgetForm({
                                              ...budgetForm,
                                              month: Number.parseInt(
                                                e.target.value
                                              ),
                                            })
                                          }
                                          className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                          {Array.from(
                                            { length: 12 },
                                            (_, i) => i + 1
                                          ).map((month) => (
                                            <option key={month} value={month}>
                                              {new Date(
                                                2025,
                                                month - 1
                                              ).toLocaleDateString("en-US", {
                                                month: "long",
                                              })}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium text-foreground">
                                          Year
                                        </label>
                                        <select
                                          value={budgetForm.year}
                                          onChange={(e) =>
                                            setBudgetForm({
                                              ...budgetForm,
                                              year: Number.parseInt(
                                                e.target.value
                                              ),
                                            })
                                          }
                                          className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                          {Array.from(
                                            { length: 5 },
                                            (_, i) => 2025 - i
                                          ).map((year) => (
                                            <option key={year} value={year}>
                                              {year}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium text-foreground">
                                          Amount (Rp)
                                        </label>
                                        <input
                                          type="number"
                                          value={budgetForm.amount}
                                          onChange={(e) =>
                                            setBudgetForm({
                                              ...budgetForm,
                                              amount: e.target.value,
                                            })
                                          }
                                          placeholder="Enter amount"
                                          className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                      </div>
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                      <Dialog.Close asChild>
                                        <Button
                                          variant="outline"
                                          className="flex-1 rounded-lg bg-transparent"
                                        >
                                          Cancel
                                        </Button>
                                      </Dialog.Close>
                                      <Button
                                        onClick={handleAddBudget}
                                        className="flex-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                                      >
                                        Add Budget
                                      </Button>
                                    </div>
                                  </Dialog.Content>
                                </Dialog.Portal>
                              </Dialog.Root>
                            </div>
                            <div className="space-y-2">
                              {mockBudgets[
                                warehouse.id as keyof typeof mockBudgets
                              ]?.map((budget, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm"
                                >
                                  <span className="text-muted-foreground">
                                    {new Date(
                                      budget.year,
                                      budget.month - 1
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </span>
                                  <span className="font-medium text-foreground">
                                    Rp {budget.amount.toLocaleString("id-ID")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root
        open={deleteId !== null}
        onOpenChange={(open: boolean) => !open && setDeleteId(null)}
      >
        <AlertDialog.Content className="rounded-xl">
          <AlertDialog.Title>Delete Warehouse</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete this warehouse? This action cannot
            be undone.
          </AlertDialog.Description>
          <div className="flex gap-3 mt-4">
            <AlertDialog.Cancel className="rounded-lg">
              Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
              }}
              className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
