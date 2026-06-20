"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { MinusCircle, PlusIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@radix-ui/themes";
import { CreateFlowLogDto, FlowLog, FlowLogType } from "@/types/flowLog";
import { useUserInfo } from "./UserContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlowLogApi } from "@/api/flowLog.api";
import { FlowCategoryResponse } from "@/types/flowcategory.type";
import { useRouter } from "next/navigation";
import { FlowLogCategoryApi } from "@/api/category.api";
import { WarehouseApi } from "@/api/warehouse";
import { Role } from "@/types/role.type";
import { Warehouse } from "@/types/warehouse";

const todayString = () => new Date().toISOString().split("T")[0];

function createEmptyForm(type: FlowLogType): CreateFlowLogDto {
  return {
    title: "",
    category: "",
    warehouseId: "",
    amount: 0,
    note: "",
    date: todayString(),
    attachments: [],
    type,
  };
}

interface FlowLogFormProps {
  type: FlowLogType.IN | FlowLogType.OUT;
}

export function FlowLogForm({ type }: FlowLogFormProps) {
  const { userInfo } = useUserInfo();
  const isExpense = type === FlowLogType.OUT;
  const isKasir = userInfo?.role === Role.KASIR;

  const [formData, setFormData] = useState<CreateFlowLogDto>(() =>
    createEmptyForm(type),
  );
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!userInfo?.warehouseId) return;
    setFormData((prev) =>
      prev.warehouseId ? prev : { ...prev, warehouseId: userInfo.warehouseId! },
    );
  }, [userInfo?.warehouseId]);

  const { data: categories = [] } = useQuery<FlowCategoryResponse[]>({
    queryKey: ["flow-log-category", formData.warehouseId],
    queryFn: () =>
      FlowLogCategoryApi.showAll({
        searchKey: "",
        selectedWarehouseId: formData.warehouseId || "",
      }),
    enabled: !!formData.warehouseId,
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses", userInfo?.role],
    queryFn: async () => await WarehouseApi.getWarehouses(""),
    enabled: !isKasir,
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
            ? ""
            : Number(value.replace(/^0+/, "") || "0")
          : value,
    }));
  };

  const handleWarehouseChange = (warehouseId: string) => {
    setFormData((prev) => ({
      ...prev,
      warehouseId,
      category: "",
    }));
  };

  const resetAfterSubmit = () => {
    setFormData((prev) => ({
      ...prev,
      title: "",
      category: "",
      amount: 0,
      note: "",
      attachments: [],
    }));
    setPreviews([]);
    setUploadedFiles([]);
  };

  const { mutateAsync: createFlowLog, isPending: isSubmitting } = useMutation({
    mutationKey: [isExpense ? "createExpense" : "createRevenue"],
    mutationFn: async (data: CreateFlowLogDto & { files?: File[] }) => {
      let filePaths: string[] = [];
      if (data.files && data.files.length > 0) {
        const uploadResponse = await FlowLogApi.uploadFiles(data.files);
        if (!uploadResponse.success) {
          throw new Error(uploadResponse.message || "Failed to upload files");
        }
        filePaths = uploadResponse.data || [];
      }

      const response = await FlowLogApi.createNew({
        ...data,
        attachments: filePaths,
      });

      if (!response.success) {
        throw new Error(
          response.message ||
            `Failed to create ${isExpense ? "expense" : "revenue"}`,
        );
      }

      return response.data as FlowLog;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [isExpense ? "recentOutflows" : "recentInflows"],
      });
      queryClient.invalidateQueries({ queryKey: ["flowLogs"] });

      toast.success(
        isExpense ? "Pengeluaran berhasil dicatat" : "Pemasukan berhasil dicatat",
        {
          description: `${data.title} - Rp ${data.amount.toLocaleString("id-ID")}`,
        },
      );

      resetAfterSubmit();
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          `Failed to create ${isExpense ? "expense" : "revenue"}`,
      );
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxFiles = 5;
    const maxFileSizeMB = 5;

    const invalidFiles = files.filter(
      (file) => file.size / (1024 * 1024) > maxFileSizeMB,
    );

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

    const newFiles = [...uploadedFiles, ...filesToAdd].slice(0, maxFiles);
    setUploadedFiles(newFiles);

    Promise.all(
      filesToAdd.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((newPreviews) => {
        setPreviews((prev) => [...prev, ...newPreviews].slice(0, maxFiles));
        toast.success(`Added ${filesToAdd.length} file(s)`);
      })
      .catch(() => {
        toast.error("Failed to generate previews");
      });

    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("Judul (Title) tidak boleh kosong");
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      toast.error("Jumlah (Amount) harus diisi dan lebih dari 0");
      return;
    }
    if (!formData.warehouseId) {
      toast.error("Silakan pilih Gudang (Warehouse)");
      return;
    }
    if (!formData.category) {
      toast.error("Silakan pilih Kategori");
      return;
    }

    try {
      await createFlowLog({
        ...formData,
        type,
        note: formData.note || "",
        attachments: [],
        files: uploadedFiles,
      });
    } catch {
      // handled in onError
    }
  };

  const accentClass = isExpense
    ? "from-red-500 to-orange-500"
    : "from-emerald-500 to-green-600";
  const accentRing = isExpense ? "focus:ring-red-500/20" : "focus:ring-emerald-500/20";
  const accentBorder = isExpense ? "focus:border-red-500" : "focus:border-emerald-500";
  const Icon = isExpense ? MinusCircle : PlusIcon;
  const uploadId = isExpense ? "expense-file-upload" : "revenue-file-upload";

  const inputClass = `mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${accentRing} ${accentBorder}`;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      <div
        className={`flex items-center gap-3 rounded-xl bg-gradient-to-r ${accentClass} p-4 text-white shadow-md`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium opacity-90">
            {isExpense ? "Catat Pengeluaran" : "Catat Pemasukan"}
          </p>
          <p className="text-xs opacity-75">
            Warehouse & tanggal dipertahankan setelah submit
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          {isExpense ? "Expense" : "Revenue"} Title{" "}
          <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder={
            isExpense
              ? "e.g., BBM pengiriman"
              : "e.g., Top-up kas kecil"
          }
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          Warehouse <span className="text-destructive">*</span>
        </label>
        {isKasir ? (
          <input
            type="text"
            value={userInfo?.warehouse?.name || "—"}
            disabled
            className="mt-2 w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-foreground opacity-70"
          />
        ) : (
          <select
            name="warehouseId"
            value={formData.warehouseId}
            onChange={(e) => handleWarehouseChange(e.target.value)}
            className={inputClass}
          >
            <option value="">Pilih warehouse</option>
            {warehouses?.map((warehouse: Warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="flex justify-between text-sm font-medium text-foreground">
          <span>
            Category <span className="text-destructive">*</span>
          </span>
          <button
            type="button"
            onClick={() => router.push("/setup/category")}
            className="text-xs font-normal text-primary hover:underline"
          >
            + kategori baru
          </button>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          disabled={!formData.warehouseId}
          className={inputClass}
        >
          <option value="">
            {formData.warehouseId
              ? "Pilih kategori"
              : "Pilih warehouse terlebih dahulu"}
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          Username
        </label>
        <input
          type="text"
          value={userInfo?.username || ""}
          disabled
          className="mt-2 w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-foreground opacity-60"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          Amount <span className="text-destructive">*</span>
        </label>
        <div className="relative mt-2">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            Rp
          </span>
          <input
            type="number"
            name="amount"
            value={formData.amount || ""}
            onChange={handleInputChange}
            placeholder="0"
            className={`w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${accentRing} ${accentBorder}`}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, date: e.target.value }))
          }
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Note</label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleInputChange}
          placeholder="Detail tambahan (opsional)..."
          rows={3}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          Attachments
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          Maks. 5 gambar, 5MB per file
        </p>
        <div className="mt-3 rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/50">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={uploadId}
          />
          <label htmlFor={uploadId} className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Klik untuk upload
              </p>
            </div>
          </label>
        </div>
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

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 rounded-xl bg-gradient-to-r ${accentClass} py-2.5 text-white shadow-md hover:opacity-90`}
        >
          {isSubmitting ? "Menyimpan..." : "Submit"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-xl py-2.5"
          onClick={() => window.history.back()}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
