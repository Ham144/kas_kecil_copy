"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Button } from "@radix-ui/themes";
import { TopNavigation } from "../../../components/top-navigation";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import type {
  FlowCategoryCreate,
  FlowCategoryResponse,
} from "@/types/flowcategory.type";
import { CategoryTable } from "@/components/CategoryTable";
import { FlowLogCategoryApi } from "@/api/category.api";

export default function CategorySetupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Deklarasikan state yang hilang
  const [searchQuery, setSearchQuery] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<FlowCategoryResponse | null>(null);
  const [formValues, setFormValues] = useState<FlowCategoryCreate>({
    name: "",
    description: "",
    no: "",
  });

  const { mutateAsync: handleCreateCategory, isPending: creatingCategory } =
    useMutation({
      mutationKey: ["flow-log-category"],
      mutationFn: async () => FlowLogCategoryApi.create(formValues),
      onError: (err: any) => {
        toast.error(err.response?.data?.message);
      },
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

  const { data: categories = [], isLoading } = useQuery<FlowCategoryResponse[]>(
    {
      queryKey: ["flow-log-category"],
      queryFn: async () => FlowLogCategoryApi.showAll(),
    },
  );

  const createCategoryMutation = useMutation({
    mutationFn: async (body: FlowCategoryCreate) => {
      const res = await axiosInstance.post<FlowCategoryResponse>(
        "/flow-log-category",
        body,
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
        body,
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
    mutationFn: async (id: string) => await FlowLogCategoryApi.delete(id),
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

  const handleEditCategory = (category: FlowCategoryResponse) => {
    setEditingCategory(category);
    setFormValues({
      name: category.name,
      no: category.no,
      description: category.description || "",
    });
    setIsDialogOpen(true);
  };

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

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
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
              Manage your warehouse locations and categories
            </p>
          </div>

          {creatingCategory ? (
            <span className="loading loading-ring loading-lg"></span>
          ) : (
            <CategoryTable
              categories={categories}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onEdit={handleEditCategory} // <-- GANTI dengan handleEditCategory
              onDelete={(id: string) => deleteCategoryMutation.mutate(id)}
              isOpenModalDialog={isDialogOpen}
              setIsOpenModalDialog={handleDialogChange}
              isCreating={isSubmitting}
            />
          )}

          {isLoading && (
            <div className="mt-4 flex items-center justify-center py-8">
              <span className="text-sm text-muted-foreground">
                Loading warehouses...
              </span>
            </div>
          )}
        </div>
      </main>

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
