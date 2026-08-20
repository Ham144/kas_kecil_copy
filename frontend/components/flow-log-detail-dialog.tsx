"use client";

import type { ComponentType, FormEvent } from "react";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building,
  Calendar,
  Clock,
  Hash,
  Loader2,
  Pencil,
  Receipt,
  Save,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { FlowLogApi } from "@/api/flowLog.api";
import { FlowLogCategoryApi } from "@/api/category.api";
import { FlowLog, FlowLogType, UpdateFlowLogDto } from "@/types/flowLog";
import { formatDateTime } from "@/lib/formatDate";
import { AttachmentGallery } from "./attachment-gallery";
import { useUserInfo } from "./UserContext";
import { Role } from "@/types/role.type";

interface FlowLogDetailDialogProps {
  log: FlowLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString?: string | Date) {
  if (!dateString) return "-";
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("id-ID", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toInputDate(value?: string | Date) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function FlowLogDetailDialog({
  log,
  open,
  onOpenChange,
}: FlowLogDetailDialogProps) {
  const queryClient = useQueryClient();
  const { userInfo } = useUserInfo();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateFlowLogDto>({
    note: "",
    date: "",
    category: "",
  });

  const isIncome = log?.type === FlowLogType.IN;
  const isPrivileged =
    userInfo?.role === Role.ADMIN || userInfo?.role === Role.IT;
  const canManage =
    !!log &&
    !!userInfo &&
    (isPrivileged || log.createdBy?.username === userInfo.username);

  const { data: categories = [] } = useQuery({
    queryKey: ["flow-log-category", log?.warehouse?.id],
    queryFn: () =>
      FlowLogCategoryApi.showAll({
        searchKey: "",
        selectedWarehouseId: log?.warehouse?.id || "",
      }),
    enabled: open && !!log?.warehouse?.id && isEditing,
  });

  useEffect(() => {
    if (!log) return;

    setIsEditing(false);
    setFormData({
      note: log.note || "",
      date: toInputDate(log.date),
      category: log.category?.id || "",
    });
  }, [log?.id, open]);

  const invalidateFlowQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["flowLogs"] }),
      queryClient.invalidateQueries({ queryKey: ["flow-logs"] }),
      queryClient.invalidateQueries({ queryKey: ["recentOutflows"] }),
      queryClient.invalidateQueries({ queryKey: ["recentInflows"] }),
    ]);
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!log) {
        throw new Error("Transaksi tidak ditemukan");
      }

      const response = await FlowLogApi.updateFlow(log.id, formData);
      if (!response || response.statusCode >= 400) {
        throw new Error(response?.message || "Gagal memperbarui transaksi");
      }

      return response;
    },
    onSuccess: async () => {
      await invalidateFlowQueries();
      toast.success("Transaksi berhasil diperbarui");
      setIsEditing(false);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui transaksi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!log) {
        throw new Error("Transaksi tidak ditemukan");
      }

      const response = await FlowLogApi.deleteFlow(log.id);
      if (!response || response.statusCode >= 400) {
        throw new Error(response?.message || "Gagal menghapus transaksi");
      }

      return response;
    },
    onSuccess: async () => {
      await invalidateFlowQueries();
      toast.success("Transaksi berhasil dihapus");
      setIsEditing(false);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus transaksi");
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.date) {
      toast.error("Tanggal transaksi wajib diisi");
      return;
    }

    if (!formData.category) {
      toast.error("Kategori wajib dipilih");
      return;
    }

    await updateMutation.mutateAsync();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.",
    );

    if (!confirmed) return;

    await deleteMutation.mutateAsync();
  };

  if (!log) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[95vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div
            className={`shrink-0 px-6 py-5 text-white ${
              isIncome
                ? "bg-gradient-to-r from-emerald-600 to-green-500"
                : "bg-gradient-to-r from-red-600 to-orange-500"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-bold">
                    Detail Transaksi
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-white/80">
                    {isIncome ? "Pemasukan kas kecil" : "Pengeluaran kas kecil"}
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg p-2 transition-colors hover:bg-white/20"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {isIncome ? (
                      <TrendingDown className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-red-600" />
                    )}
                    <h3 className="text-xl font-bold text-foreground">
                      {log.title}
                    </h3>
                  </div>
                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      isIncome
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isIncome ? "PEMASUKAN" : "PENGELUARAN"}
                  </span>
                  {!isEditing && log.note && (
                    <p className="mt-3 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                      {log.note}
                    </p>
                  )}
                </div>
                <div
                  className={`rounded-xl border-2 px-5 py-4 text-center ${
                    isIncome
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <p className="text-xs text-muted-foreground">Jumlah</p>
                  <p
                    className={`text-2xl font-bold ${
                      isIncome ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {isIncome ? "+" : "-"} {formatCurrency(log.amount)}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={User}
                  label="Dibuat Oleh"
                  value={
                    log.createdBy?.displayName ||
                    log.createdBy?.username ||
                    "-"
                  }
                  sub={
                    log.createdBy?.username
                      ? `@${log.createdBy.username}`
                      : undefined
                  }
                  color="blue"
                />
                <DetailItem
                  icon={Building}
                  label="Warehouse"
                  value={log.warehouse?.name || "-"}
                  color="green"
                />
                <DetailItem
                  icon={Tag}
                  label="Kategori"
                  value={log.category?.name || "-"}
                  color="purple"
                />
                <DetailItem
                  icon={Calendar}
                  label="Tanggal Transaksi"
                  value={formatDate(log.date)}
                  sub={
                    log.createdAt
                      ? `Input: ${formatDateTime(log.createdAt)}`
                      : undefined
                  }
                  color="orange"
                />
              </div>

              {isEditing && canManage && (
                <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Edit Transaksi
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Ubah catatan, tanggal, atau kategori transaksi ini.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Catatan
                      </label>
                      <textarea
                        value={formData.note || ""}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            note: event.target.value,
                          }))
                        }
                        rows={4}
                        className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Tambahkan catatan transaksi"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Tanggal
                      </label>
                      <input
                        type="date"
                        value={formData.date || ""}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            date: event.target.value,
                          }))
                        }
                        className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Kategori
                      </label>
                      <select
                        value={formData.category || ""}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: event.target.value,
                          }))
                        }
                        className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Pilih kategori</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {!isEditing && <AttachmentGallery attachments={log.attachments} />}

              {!isEditing && (
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span className="font-medium">ID Transaksi</span>
                  </div>
                  <code className="mt-2 block break-all text-xs text-foreground">
                    {log.id}
                  </code>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-border bg-muted/20 px-6 py-4">
              {canManage ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              note: log.note || "",
                              date: toInputDate(log.date),
                              category: log.category?.id || "",
                            });
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={updateMutation.isPending}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updateMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Simpan
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>

                  {!isEditing && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleteMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Menghapus...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-border bg-background py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto sm:px-8"
                    onClick={() => setIsEditing(false)}
                  >
                    Tutup
                  </button>
                </Dialog.Close>
              )}
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
      <div className={`rounded-lg p-2.5 ${colors[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground">{value}</p>
        {sub && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
