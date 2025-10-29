"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Button, Card } from "@radix-ui/themes";
import { TopNavigation } from "../../../components/top-navigation";
import { useRouter } from "next/navigation";

const DEFAULT_CATEGORIES = [
  "Fuel",
  "Maintenance",
  "Office Supplies",
  "Utilities",
  "Transportation",
  "Equipment",
  "Other",
];

export default function CategorySetupPage() {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const router = useRouter();

  const handleAddCategory = () => {
    if (!categoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    if (categories.includes(categoryName)) {
      toast.error("Category already exists");
      return;
    }

    if (editingIndex !== null) {
      const updatedCategories = [...categories];
      updatedCategories[editingIndex] = categoryName;
      setCategories(updatedCategories);
      toast.success("Category updated successfully");
    } else {
      setCategories([...categories, categoryName]);
      toast.success("Category added successfully");
    }

    setCategoryName("");
    setEditingIndex(null);
    setIsDialogOpen(false);
  };

  const handleEditCategory = (index: number) => {
    setCategoryName(categories[index]);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (index: number) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
    toast.success("Category deleted successfully");
  };

  const handleOpenDialog = () => {
    setCategoryName("");
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
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
              <span className="text-foreground font-medium">category</span>
            </div>
            <h1 className="text-3xl font-semibold text-foreground">
              Expense Category Setup
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create and manage expense categories for your warehouse
            </p>
          </div>
          <Button
            onClick={handleOpenDialog}
            className="gap-2 rounded-lg bg-primary flex items-center px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Categories List */}
        <Card className="shadow-lg">
          <div className="divide-y divide-border">
            {categories.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">
                  No categories yet. Create one to get started.
                </p>
              </div>
            ) : (
              categories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-muted/50"
                >
                  <span className="font-medium text-foreground">
                    {category}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCategory(index)}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(index)}
                      className="gap-2 text-destructive hover:bg-destructive/10"
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

      {/* Add/Edit Category Dialog */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {editingIndex !== null ? "Edit Category" : "Add New Category"}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {editingIndex !== null
                ? "Update the category name"
                : "Enter a new expense category name"}
            </Dialog.Description>

            <div className="mt-6 space-y-4">
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category name"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCategory();
                  }
                }}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddCategory}
                  className="flex-1 rounded-lg bg-primary py-2 text-primary-foreground hover:bg-primary/90"
                >
                  {editingIndex !== null ? "Update" : "Add"}
                </Button>
                <Button
                  onClick={() => setIsDialogOpen(false)}
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
