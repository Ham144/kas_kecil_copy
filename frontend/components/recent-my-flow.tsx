"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building,
  Calendar,
  ChevronRight,
  CreditCard,
  FileText,
  ImageIcon,
  Tag,
  User,
} from "lucide-react";
import { FlowLog, FlowLogType } from "@/types/flowLog";
import { formatDateTime } from "@/lib/formatDate";
import { FlowLogDetailDialog } from "./flow-log-detail-dialog";

export function RecentMyFlow({
  logs,
  type: _type,
}: {
  logs: FlowLog[];
  type: FlowLogType;
}) {
  const [selectedLog, setSelectedLog] = useState<FlowLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const openDetail = (log: FlowLog) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  if (!logs?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <CreditCard className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">Belum Ada Transaksi</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Transaksi finansial akan muncul di sini
        </p>
      </div>
    );
  }

  const netBalance = logs.reduce(
    (sum, log) => sum + (log.type === "IN" ? log.amount : -log.amount),
    0,
  );

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-gradient-to-r from-blue-50/80 to-white px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Riwayat Transaksi</h2>
                <p className="text-xs text-muted-foreground">
                  {logs.length} transaksi · klik untuk detail
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Saldo bersih</p>
              <p
                className={`text-sm font-bold ${
                  netBalance >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatCurrency(netBalance)}
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {logs.map((log) => {
            const isIncome = log.type === FlowLogType.IN;
            return (
              <button
                key={log.id}
                type="button"
                onClick={() => openDetail(log)}
                className="group w-full p-4 text-left transition-colors hover:bg-muted/40 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`shrink-0 rounded-xl p-2.5 ${
                      isIncome
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownRight className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-foreground">
                        {log.title}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          isIncome
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isIncome ? "IN" : "OUT"}
                      </span>
                      {(log.attachments?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          <ImageIcon className="h-3 w-3" />
                          {log.attachments!.length}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {log.category?.name && (
                        <span className="inline-flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {log.category.name}
                        </span>
                      )}
                      {log.warehouse?.name && (
                        <span className="inline-flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {log.warehouse.name}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.createdBy?.username}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(log.date)}
                      </span>
                    </div>

                    {log.note && (
                      <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                        <FileText className="mr-1 inline h-3 w-3" />
                        {log.note}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p
                      className={`text-lg font-bold ${
                        isIncome ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(log.amount)}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </span>
                    <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <FlowLogDetailDialog
        log={selectedLog}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
