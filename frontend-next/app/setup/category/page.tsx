"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Button, Card } from "@radix-ui/themes";
import { TopNavigation } from "../../../components/top-navigation";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import type {
  FlowCategoryCreate,
  FlowCategoryResponse,
} from "@/types/flowcategory.type";

export default function CategorySetupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<FlowCategoryResponse | null>(null);
  const [formValues, setFormValues] = useState<FlowCategoryCreate>({
    name: "",
    description: "",
    no: "",
  });

  const resetForm = () => {
    setFormValues({ name: "", description: "", no: "" });
    setEditingCategory(null);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const {
    data: categories = [],
    isLoading,
    isFetching,
  } = useQuery<FlowCategoryResponse[]>({
    queryKey: ["flow-log-category"],
    queryFn: async () => {
      const res = await axiosInstance.get<FlowCategoryResponse[]>(
        "/flow-log-category"
      );
      return res.data;
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (body: FlowCategoryCreate) => {
      const res = await axiosInstance.post<FlowCategoryResponse>(
        "/flow-log-category",
        body
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["flow-log-category"] });
      handleDialogChange(false);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ??
        error.message ??
        "Gagal membuat category";
      toast.error(errorMessage);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: FlowCategoryCreate;
    }) => {
      const res = await axiosInstance.patch<FlowCategoryResponse>(
        `/flow-log-category/${id}`,
        body
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["flow-log-category"] });
      handleDialogChange(false);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ??
        error.message ??
        "Gagal mengupdate category";
      toast.error(errorMessage);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/flow-log-category/${id}`);
    },
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["flow-log-category"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ??
        error.message ??
        "Gagal menghapus category";
      toast.error(errorMessage);
    },
  });

  const isSubmitting =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;

  const handleSubmitCategory = () => {
    if (!formValues.no.trim() || !formValues.name.trim()) {
      toast.error("No dan nama category wajib diisi");
      return;
    }

    const payload: FlowCategoryCreate = {
      name: formValues.name.trim(),
      no: formValues.no.trim(),
      description: formValues.description?.trim()
        ? formValues.description.trim()
        : undefined,
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, body: payload });
    } else {
      createCategoryMutation.mutate(payload);
    }
  };

  const handleEditCategory = (category: FlowCategoryResponse) => {
    setEditingCategory(category);
    setFormValues({
      name: category.name ?? "",
      no: category.no ?? "",
      description: category.description ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (category: FlowCategoryResponse) => {
    const confirmed = window.confirm(`Hapus category "${category.name}"?`);
    if (!confirmed) return;
    deleteCategoryMutation.mutate(category.id);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className="cursor-pointer"
                onClick={() => {
                  router.push("/setup");
                }}
              >
                Setup
              </span>
              <span>/</span>
              <span className="font-medium text-foreground">category</span>
            </div>
            <h1 className="text-3xl font-semibold text-foreground">
              Expense Category Setup
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create and manage expense categories for your warehouse
            </p>
          </div>
          <Button
            onClick={handleOpenCreateDialog}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        <Card className="shadow-lg">
          <div className="divide-y divide-border">
            {isLoading || isFetching ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">
                  No categories yet. Create one to get started.
                </p>
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {category.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {category.no}
                    </span>
                    {category.description ? (
                      <span className="text-sm text-muted-foreground">
                        {category.description}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="2"
                      onClick={() => handleEditCategory(category)}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="2"
                      onClick={() => handleDeleteCategory(category)}
                      className="gap-2 text-destructive hover:bg-destructive/10"
                      disabled={deleteCategoryMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Dialog.Root open={isDialogOpen} onOpenChange={handleDialogChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {editingCategory
                ? "Update the category details"
                : "Enter a new expense category"}
            </Dialog.Description>

            <div className="mt-6 space-y-4">
              <input
                type="text"
                value={formValues.no}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, no: e.target.value }))
                }
                placeholder="Category number"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />

              <input
                type="text"
                value={formValues.name}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Category name"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />

              <textarea
                value={formValues.description ?? ""}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Description (optional)"
                className="min-h-[120px] w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmitCategory}
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-primary py-2 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {editingCategory ? "Update" : "Add"}
                </Button>
                <Button
                  onClick={() => handleDialogChange(false)}
                  variant="outline"
                  className="flex-1 rounded-lg bg-transparent py-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
