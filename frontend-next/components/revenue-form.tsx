"use client";

import type React from "react";
import { useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button, Card } from "@radix-ui/themes";
import { CreateFlowLogDto, FlowLog, FlowLogType } from "@/types/flowLog";
import { useUserInfo } from "./UserContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlowLogApi } from "@/api/flowLog.api";
import axiosInstance from "@/lib/axios";
import { FlowCategoryResponse } from "@/types/flowcategory.type";
import { useRouter } from "next/navigation";
import { WarehouseApi } from "@/api/warehouse";
import { Role } from "@/types/role.type";
import { Warehouse } from "@/types/warehouse";

export function RevenueForm({}: {}) {
  const { userInfo } = useUserInfo();

  let initialFormData: CreateFlowLogDto = {
    title: "",
    category: "",
    warehouseId: (userInfo as any)?.warehouseId || "",
    amount: 0,
    note: "",
    attachments: [],
    type: FlowLogType.IN,
    date: new Date().toISOString().split("T")[0],
  };
  const [formData, setFormData] = useState<CreateFlowLogDto>(initialFormData);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => await WarehouseApi.getWarehouses(""),
    enabled: userInfo?.role != Role.KASIR,
  });

  // Fetch categories from backend
  const { data: categories = [] } = useQuery<FlowCategoryResponse[]>({
    queryKey: ["flow-log-category"],
    queryFn: async () => {
      const res =
        await axiosInstance.get<FlowCategoryResponse[]>("/flow-log-category");
      return res.data;
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "amount"
          ? value === ""
            ? "" // biarkan kosong kalau user hapus semua angka
            : Number(value.replace(/^0+/, "") || "0") // hapus nol depan
          : value,
    }));
  };

  // Create revenue mutation with proper error handling
  const { mutateAsync: createRevenue, isPending: isCreatingRevenue } =
    useMutation({
      mutationKey: ["createRevenue"],
      mutationFn: async (data: CreateFlowLogDto & { files?: File[] }) => {
        // Upload files first if any
        let filePaths: string[] = [];
        if (data.files && data.files.length > 0) {
          const uploadResponse = await FlowLogApi.uploadFiles(data.files);
          if (!uploadResponse.success) {
            throw new Error(uploadResponse.message || "Failed to upload files");
          }
          filePaths = uploadResponse.data || [];
        }

        // Create revenue with file paths
        const revenueData: CreateFlowLogDto = {
          ...data,
          attachments: filePaths,
        };

        const response = await FlowLogApi.createNew(revenueData);

        if (!response.success) {
          throw new Error(response.message || "Failed to create revenue");
        }

        return response.data as FlowLog;
      },
      onSuccess: (data) => {
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: ["recentOutflows"] });
        queryClient.invalidateQueries({ queryKey: ["flowLogs"] });

        toast.success("success", {
          description: `${data.title} - Rp ${data.amount.toLocaleString(
            "id-ID",
          )}`,
        });

        // Reset form
        setFormData(initialFormData);
        setPreviews([]);
        setUploadedFiles([]);
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create revenue");
      },
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxFiles = 5;
    const maxFileSizeMB = 5; // 5MB per file (matching backend limit)

    // Validate file sizes
    const invalidFiles = files.filter((file) => {
      const sizeMB = file.size / (1024 * 1024);
      return sizeMB > maxFileSizeMB;
    });

    if (invalidFiles.length > 0) {
      toast.error(
        `Some files are too large. Maximum size: ${maxFileSizeMB}MB per file`,
      );
      return;
    }

    const filesToAdd = files.slice(0, maxFiles - uploadedFiles.length);

    if (filesToAdd.length === 0) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Add files to state
    const newFiles = [...uploadedFiles, ...filesToAdd].slice(0, maxFiles);
    setUploadedFiles(newFiles);

    // Generate previews for display
    const previewPromises = filesToAdd.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises)
      .then((newPreviews) => {
        setPreviews([...previews, ...newPreviews].slice(0, maxFiles));
        toast.success(`Added ${filesToAdd.length} file(s)`);
      })
      .catch(() => {
        toast.error("Failed to generate previews");
      });
  };

  const removeAttachment = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(formData);
    // Validate required fields
    if (
      !formData.title ||
      !formData.amount ||
      !formData.warehouseId ||
      !formData.category
    ) {
      toast.error("Tolong isi semua field yang diperlukan");
      return;
    }

    if (formData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      await createRevenue({
        ...formData,
        note: formData.note || "",
        attachments: [], // Will be set after file upload
        files: uploadedFiles, // Pass files for upload
      });
    } catch (error) {
      // Error is already handled in mutation onError
    }
  };

  return (
    <Card className="shadow-lg">
      <div className="border-b border-border bg-card p-6">
        <h2 className="text-2xl font-semibold text-foreground">Add Revenue</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Record a new petty cash revenue for your warehouse
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6 p-6">
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
          <label className=" text-sm font-medium text-foreground flex justify-between">
            <div className="flex">
              <span>Category</span>
              <span className="text-destructive">*</span>
            </div>
            <button
              onClick={() => router.push("/setup/category")}
              className="link font-light text-xs"
            >
              new category
            </button>
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
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
            value={userInfo?.username}
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

        {/* Warehouse (Disabled) */}
        <div className="w-full border p-2 rounded-md">
          <label className="block text-sm font-medium text-foreground">
            Warehouse
          </label>
          <select
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                warehouseId: e.target.value,
              }))
            }
            className="select w-full "
          >
            {warehouses?.length &&
              warehouses.map((warehouse: Warehouse) => (
                <option value={warehouse.id}>{warehouse.name}</option>
              ))}
          </select>
        </div>

        {/* Date (Disabled) */}
        <div className="w-full  border p-2 rounded-md ">
          <label className="block text-sm font-medium text-foreground">
            Date
          </label>

          <input
            type="date"
            className="input w-full "
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                date: e.target.value, // ⬅️ LANGSUNG STRING
              }))
            }
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
            placeholder="Add any additional details about this revenue..."
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
            Upload up to 5 images (max 5MB per file). Files will be stored on
            the server.
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
            disabled={isCreatingRevenue}
            className="flex-1 gap-2 rounded-xl bg-primary py-2.5 text-primary-foreground hover:bg-primary/90"
          >
            {isCreatingRevenue ? "Submitting..." : "Submit"}
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
