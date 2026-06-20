"use client";

import type { ComponentType } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Building,
  Calendar,
  Clock,
  Hash,
  Receipt,
  Tag,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { FlowLog, FlowLogType } from "@/types/flowLog";
import { formatDateTime } from "@/lib/formatDate";
import { AttachmentGallery } from "./attachment-gallery";

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

export function FlowLogDetailDialog({
  log,
  open,
  onOpenChange,
}: FlowLogDetailDialogProps) {
  if (!log) return null;

  const isIncome = log.type === FlowLogType.IN;

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
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

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
                {log.note && (
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

            <AttachmentGallery attachments={log.attachments} />

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span className="font-medium">ID Transaksi</span>
              </div>
              <code className="mt-2 block break-all text-xs text-foreground">
                {log.id}
              </code>
            </div>
          </div>

          <div className="shrink-0 border-t border-border bg-muted/20 px-6 py-4">
            <Dialog.Close asChild>
              <button
                type="button"
                className="w-full rounded-xl border border-border bg-background py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto sm:px-8"
              >
                Tutup
              </button>
            </Dialog.Close>
          </div>
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
