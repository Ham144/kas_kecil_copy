"use client";

import type React from "react";
import { useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button, Card } from "@radix-ui/themes";

const EXPENSE_CATEGORIES = [
  "Fuel",
  "Maintenance",
  "Office Supplies",
  "Utilities",
  "Transportation",
  "Equipment",
  "Other",
];

// Simple UUID generator function
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function RevenueForm({
  onSubmit,
}: {
  onSubmit: (expense: any) => void;
}) {
  const [formData, setFormData] = useState({
    title: "", // Changed from 'category' to 'title' to match Expense model
    category: "", // Added category field for ExpenseCategory relation
    warehouseId: "warehouse-1", // Added warehouseId field
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userInfo = {
    username: "John Doe",
    warehouse: "Warehouse A - Jakarta",
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...attachments, ...files].slice(0, 5);
    setAttachments(newFiles);

    // Generate previews
    const newPreviews: string[] = [];
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newFiles.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.amount) {
      toast("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newExpense = {
        id: generateUUID(),
        title: formData.title,
        category: formData.category,
        warehouseId: formData.warehouseId,
        amount: Number.parseFloat(formData.amount),
        date: formData.date,
        note: formData.note,
        attachments: previews,
      };

      onSubmit(newExpense);

      toast("Expense submitted successfully");

      // Reset form
      setFormData({
        title: "",
        category: "",
        warehouseId: "warehouse-1",
        amount: "",
        note: "",
        date: new Date().toISOString().split("T")[0],
      });
      setAttachments([]);
      setPreviews([]);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Card className="shadow-lg">
      <div className="border-b border-border bg-card p-6">
        <h2 className="text-2xl font-semibold text-foreground">Add Revenue</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Record a new petty cash expense for your warehouse
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Revenue Title <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Fuel for delivery truck"
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Category <span className="text-destructive">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select a category</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Username (Disabled) */}
        <div>
          <label className="block text-sm font-medium text-foreground">
            Username
          </label>
          <input
            type="text"
            value={userInfo.username}
            disabled
            className="mt-2 w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-foreground opacity-60"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-foreground">
            Amount <span className="text-destructive">*</span>
          </label>
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground">
              Rp
            </span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0"
              className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-foreground">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Warehouse (Disabled) */}
        <div>
          <label className="block text-sm font-medium text-foreground">
            Warehouse
          </label>
          <input
            type="text"
            value={userInfo.warehouse}
            disabled
            className="mt-2 w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-foreground opacity-60"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-foreground">
            Note
          </label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            placeholder="Add any additional details about this expense..."
            rows={4}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-foreground">
            Attachments
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload up to 5 images (receipts, invoices, etc.)
          </p>

          {/* Upload Area */}
          <div className="mt-3 rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or drag and drop
                  </p>
                </div>
              </div>
            </label>
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-full rounded-lg border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 gap-2 rounded-xl bg-primary py-2.5 text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl py-2.5 bg-transparent"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
