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
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Button, Card } from "@radix-ui/themes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BudgetApi } from "@/api/budget.api";
import type { Budget, BudgetCreateDto, BudgetUpdateDto } from "@/types/budget";
import {
  FlowCategoryCreate,
  FlowCategoryResponse,
} from "@/types/flowcategory.type";
import Confirmation from "./Confirmation";

interface CategoryTableProps {
  categories: FlowCategoryResponse[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEdit: (category: FlowCategoryResponse) => void;
  onDelete: (id: string) => void;
  isOpenModalDialog: boolean;
  setIsOpenModalDialog: (isOpen: boolean) => void;
  isCreating: boolean;
}

export function CategoryTable({
  categories,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  setIsOpenModalDialog,
  isCreating,
}: CategoryTableProps) {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedcategoryId, setSelectedcategoryId] = useState<string | null>(
    null,
  );
  const [budgetForm, setBudgetForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: "",
  });

  // Fetch budgets for selected category
  const { data: budgets = [], isLoading: loadingBudgets } = useQuery<Budget[]>({
    queryKey: ["budgets", selectedcategoryId],
    queryFn: () =>
      selectedcategoryId
        ? BudgetApi.getBudgetsByCategory(selectedcategoryId)
        : Promise.resolve([]),
    enabled: !!selectedcategoryId && expandedId === selectedcategoryId,
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data: BudgetCreateDto) =>
      await BudgetApi.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["budgets", selectedcategoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Budget berhasil dibuat");
      setBudgetDialogOpen(false);
      setBudgetForm({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: "",
      });
      setEditingBudget(null);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal membuat budget";
      toast.error(errorMessage);
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async (data: BudgetUpdateDto) =>
      await BudgetApi.updateBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["budgets", selectedcategoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Budget berhasil diupdate");
      setBudgetDialogOpen(false);
      setBudgetForm({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: "",
      });
      setEditingBudget(null);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal mengupdate budget";
      toast.error(errorMessage);
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: string) => await BudgetApi.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["budgets", selectedcategoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Budget berhasil dihapus");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menghapus budget";
      toast.error(errorMessage);
    },
  });

  const handleAddBudget = () => {
    if (!budgetForm.amount || !selectedcategoryId) {
      toast.error("Please fill all required fields");
      return;
    }

    const amount = parseFloat(budgetForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }

    if (editingBudget) {
      const updatePayload: BudgetUpdateDto = {
        id: editingBudget.id,
        month: budgetForm.month,
        year: budgetForm.year,
        amount,
      };
      updateBudgetMutation.mutate(updatePayload);
    } else {
      const createPayload: BudgetCreateDto = {
        categoryId: selectedcategoryId,
        month: budgetForm.month,
        year: budgetForm.year,
        amount,
      };
      createBudgetMutation.mutate(createPayload);
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      month: budget.month,
      year: budget.year,
      amount: budget.amount.toString(),
    });
    setBudgetDialogOpen(true);
  };

  const handleDeleteBudget = (budgetId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this budget? This action cannot be undone.",
      )
    ) {
      deleteBudgetMutation.mutate(budgetId);
    }
  };

  const handleOpenBudgetDialog = (categoryId: string) => {
    setSelectedcategoryId(categoryId);
    setEditingBudget(null);
    setBudgetForm({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: "",
    });
    setBudgetDialogOpen(true);
  };

  const isSubmitting =
    createBudgetMutation.isPending || updateBudgetMutation.isPending;

  return (
    <>
      <Card className="shadow-lg">
        {/* Header */}
        <div className="border-b border-border bg-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                categories
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {categories.length} category
                {categories.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <Button
              disabled={isCreating}
              onClick={() => {
                setIsOpenModalDialog(true);
              }}
              className="gap-2 flex items-center rounded-xl bg-primary px-4 py-2.5 text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add category
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search categories..."
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
                  No
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Category Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-muted-foreground"
                  >
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <React.Fragment key={category.id}>
                    <tr className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {category.no}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {category.description || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="1"
                            onClick={() => {
                              const newExpandedId =
                                expandedId === category.id ? null : category.id;
                              setExpandedId(newExpandedId);
                              setSelectedcategoryId(category.id);
                            }}
                            className="gap-1"
                          >
                            {expandedId === category.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline text-xs">
                              Budgets
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="1"
                            onClick={() => onEdit(category)} // <-- LANGSUNG panggil onEdit dengan category
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
                              setDeleteId(category.id);
                              const dialog = document.getElementById(
                                "delete-category-confirm",
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

                    {expandedId === category.id && (
                      <tr className="border-b border-border bg-muted/10">
                        <td colSpan={4} className="px-6 py-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-foreground">
                                Budgets
                              </h4>
                              <Button
                                size="1"
                                variant="outline"
                                className="gap-1 bg-slate-800 flex items-center rounded-lg text-xs text-white p-3 hover:bg-primary/10"
                                onClick={() =>
                                  handleOpenBudgetDialog(category.id)
                                }
                              >
                                <Plus className="h-3 w-3" />
                                Add Budget
                              </Button>
                            </div>

                            {/* Budget List */}
                            <div className="space-y-2">
                              {loadingBudgets ? (
                                <div className="text-center py-4 text-sm text-muted-foreground">
                                  Loading budgets...
                                </div>
                              ) : budgets.length === 0 ? (
                                <div className="text-center py-4 text-sm text-muted-foreground">
                                  No budget yet. Add one to get started.
                                </div>
                              ) : (
                                budgets.map((budget) => (
                                  <div
                                    key={budget.id}
                                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm hover:bg-muted/50"
                                  >
                                    <div className="flex flex-col">
                                      <span className="text-muted-foreground">
                                        {new Date(
                                          budget.year,
                                          budget.month - 1,
                                        ).toLocaleDateString("en-US", {
                                          month: "long",
                                          year: "numeric",
                                        })}
                                      </span>
                                      <span className="font-medium text-foreground mt-1">
                                        Rp{" "}
                                        {budget.amount.toLocaleString("id-ID")}
                                      </span>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="1"
                                        onClick={() => handleEditBudget(budget)}
                                        className="gap-1 text-muted-foreground hover:text-foreground"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="1"
                                        onClick={() =>
                                          handleDeleteBudget(budget.id)
                                        }
                                        className="gap-1 text-destructive hover:bg-destructive/10"
                                        disabled={
                                          deleteBudgetMutation.isPending
                                        }
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))
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

          {/* Budget Dialog */}
          <Dialog.Root
            open={budgetDialogOpen && selectedcategoryId !== null}
            onOpenChange={(open) => {
              if (!open && !isSubmitting) {
                setBudgetDialogOpen(false);
                setEditingBudget(null);
                setSelectedcategoryId(null);
              }
            }}
          >
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
              <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
                <Dialog.Title className="text-lg font-semibold text-foreground">
                  {editingBudget ? "Edit Budget" : "Add Budget"}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                  {editingBudget
                    ? "Update the budget details"
                    : `Add a new budget for ${
                        categories.find((c) => c.id === selectedcategoryId)
                          ?.name || ""
                      }`}
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
                          month: Number.parseInt(e.target.value),
                        })
                      }
                      className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (month) => (
                          <option key={month} value={month}>
                            {new Date(
                              budgetForm.year,
                              month - 1,
                            ).toLocaleDateString("en-US", { month: "long" })}
                          </option>
                        ),
                      )}
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
                          year: Number.parseInt(e.target.value),
                        })
                      }
                      className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {Array.from(
                        { length: 10 },
                        (_, i) => new Date().getFullYear() + 2 - i,
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
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingBudget
                        ? "Update"
                        : "Add Budget"}
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </Card>

      <Confirmation
        handleDeletecategoryConfirm={() => {
          onDelete(deleteId);
          setIsOpenModalDialog(false);
          setDeleteId(null);
        }}
        id="delete-category-confirm"
        setDeleteId={setDeleteId}
      />
    </>
  );
}
