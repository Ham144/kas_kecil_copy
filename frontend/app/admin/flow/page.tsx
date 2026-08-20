"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpCircle,
  Download,
  FileText,
  FileWarningIcon,
  Filter,
  ImageIcon,
  Receipt,
  Search,
} from "lucide-react";
import { TopNavigation } from "../../../components/top-navigation";
import { useQuery } from "@tanstack/react-query";
import { FlowLogApi } from "@/api/flowLog.api";
import {
  FlowLog,
  FlowLogType,
  PaginatedFlowLogs,
  RecentFlowLogsFilter,
} from "@/types/flowLog";
import { FlowCategoryResponse, ModePeriod } from "@/types/flowcategory.type";
import { FlowLogCategoryApi } from "@/api/category.api";
import { WarehouseApi } from "@/api/warehouse";
import { useUserInfo } from "@/components/UserContext";
import { toast } from "sonner";
import { getAttachmentUrl } from "@/lib/attachment";
import { FlowLogDetailDialog } from "@/components/flow-log-detail-dialog";
import { Role } from "@/types/role.type";

export default function CashFlow() {
  const { userInfo } = useUserInfo();
  const isKasir = userInfo?.role === Role.KASIR;
  const [modePeriod, setModePeriod] = useState<ModePeriod>(ModePeriod.MONTH);
  const [selectedLog, setSelectedLog] = useState<FlowLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const initialFilter: RecentFlowLogsFilter = {
    category: "all",
    searchKey: "",
    selectedDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
    type: FlowLogType.ALL,
    page: 1,
    limit: 20,
    warehouse: userInfo?.warehouseId,
    lightMode: false,
  };

  const [filter, setFilter] = useState<RecentFlowLogsFilter>(initialFilter);

  const { data: categories = [] } = useQuery<FlowCategoryResponse[]>({
    queryKey: ["flow-log-category", filter.warehouse],
    queryFn: () =>
      FlowLogCategoryApi.showAll({
        searchKey: "",
        selectedWarehouseId: filter?.warehouse || "",
      }),
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => WarehouseApi.getWarehouses(),
    enabled: !isKasir,
  });

  const {
    data: flows,
    isError: isErrorFlow,
    error: errorFlow,
  } = useQuery<PaginatedFlowLogs>({
    queryKey: ["flowLogs", filter],
    queryFn: () => FlowLogApi.getRecentFlowLogs(filter),
    enabled: !!userInfo?.warehouseId,
  });

  useEffect(() => {
    if (!userInfo?.warehouseId) return;
    if (isKasir) {
      setFilter((prev) => ({ ...prev, warehouse: userInfo.warehouseId }));
    }
  }, [userInfo?.warehouseId, isKasir]);

  useEffect(() => {
    if (modePeriod === ModePeriod.DATE) {
      setFilter((prev) => ({
        ...prev,
        selectedDate: new Date().toISOString().split("T")[0],
      }));
    } else if (modePeriod === ModePeriod.MONTH) {
      setFilter((prev) => ({
        ...prev,
        selectedDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
      }));
    }
  }, [modePeriod]);

  const resetFilter = () => {
    setFilter({
      ...initialFilter,
      warehouse: isKasir ? userInfo?.warehouseId : "all",
      page: 1,
    });
  };

  const handleExportCSV = async () => {
    try {
      const downloadURL = await FlowLogApi.getRecentFlowLogs({
        ...filter,
        isDownload: true,
      });
      if (!downloadURL?.url) {
        toast.error("File tidak tersedia");
        return;
      }
      const fullUrl = getAttachmentUrl(downloadURL.url);
      const newTab = window.open(fullUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => {
        if (!newTab?.closed) newTab?.close();
      }, 5000);
    } catch {
      toast.error("Gagal mengunduh file CSV");
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const openDetail = (log: FlowLog) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <TopNavigation />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Hero header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Cash Flow Ledger
              </h1>
              <p className="text-sm text-muted-foreground">
                {flows?.total ?? 0} total transaksi · halaman {filter.page} dari{" "}
                {flows?.totalPages ?? 1}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Filters panel */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-4">
            <Filter className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Filter & Pencarian</h2>
          </div>
          <div className="space-y-4 p-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={filter.searchKey}
                onChange={(e) =>
                  setFilter({ ...filter, searchKey: e.target.value, page: 1 })
                }
                placeholder="Cari judul transaksi..."
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Periode
                </label>
                <select
                  value={modePeriod}
                  onChange={(e) =>
                    setModePeriod(e.target.value as ModePeriod)
                  }
                  className={inputClass}
                >
                  {Object.values(ModePeriod).map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Tanggal / Bulan
                </label>
                <input
                  type={modePeriod}
                  value={filter.selectedDate}
                  onChange={(e) =>
                    setFilter({ ...filter, selectedDate: e.target.value, page: 1 })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Warehouse
                </label>
                <select
                  value={filter.warehouse}
                  disabled={isKasir}
                  onChange={(e) =>
                    setFilter({ ...filter, warehouse: e.target.value, page: 1 })
                  }
                  className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {isKasir ? (
                    userInfo?.warehouseId && (
                      <option value={userInfo.warehouseId}>
                        {userInfo.warehouse?.name || "Warehouse saya"}
                      </option>
                    )
                  ) : (
                    <>
                      <option value="all">Semua Warehouse</option>
                      {warehouses?.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Kategori
                </label>
                <select
                  value={filter.category}
                  onChange={(e) =>
                    setFilter({ ...filter, category: e.target.value, page: 1 })
                  }
                  className={inputClass}
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Tipe
                </label>
                <select
                  value={filter.type}
                  onChange={(e) =>
                    setFilter({
                      ...filter,
                      type: e.target.value as FlowLogType,
                      page: 1,
                    })
                  }
                  className={inputClass}
                >
                  <option value={FlowLogType.ALL}>Semua</option>
                  <option value={FlowLogType.IN}>Pemasukan</option>
                  <option value={FlowLogType.OUT}>Pengeluaran</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={resetFilter}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Results table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">
              Hasil{" "}
              <span className="font-normal text-muted-foreground">
                ({flows?.logs?.length ?? 0} ditampilkan)
              </span>
            </h2>
          </div>

          {isErrorFlow ? (
            <div className="flex items-center gap-3 p-6 text-destructive">
              <FileWarningIcon className="h-5 w-5 shrink-0" />
              <span className="text-sm">{(errorFlow as Error)?.message}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">Judul</th>
                    <th className="px-5 py-3">Kategori</th>
                    <th className="px-5 py-3">Warehouse</th>
                    <th className="px-5 py-3">Jumlah</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Tipe</th>
                    <th className="px-5 py-3">Lampiran</th>
                  </tr>
                </thead>
                <tbody>
                  {!flows?.logs?.length ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm text-muted-foreground"
                      >
                        Tidak ada transaksi sesuai filter
                      </td>
                    </tr>
                  ) : (
                    flows.logs.map((log) => {
                      const isIn = log.type === FlowLogType.IN;
                      return (
                        <tr
                          key={log.id}
                          onClick={() => openDetail(log)}
                          className="cursor-pointer border-b border-border transition-colors hover:bg-muted/30"
                        >
                          <td className="px-5 py-3.5 text-sm font-medium text-foreground">
                            {log.title}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-muted-foreground">
                            {log.category?.name ?? "-"}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-muted-foreground">
                            {log.warehouse?.name ?? "-"}
                          </td>
                          <td
                            className={`px-5 py-3.5 text-sm font-semibold ${
                              isIn ? "text-emerald-600" : "text-red-600"
                            }`}
                          >
                            {isIn ? "+" : "-"}
                            {formatCurrency(log.amount)}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-muted-foreground">
                            {formatDate(log.createdAt as string)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                isIn
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {isIn ? (
                                <ArrowUpCircle className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowDownCircle className="h-3.5 w-3.5" />
                              )}
                              {isIn ? "IN" : "OUT"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-muted-foreground">
                            {(log.attachments?.length ?? 0) > 0 ? (
                              <span className="inline-flex items-center gap-1 text-blue-600">
                                <ImageIcon className="h-3.5 w-3.5" />
                                {log.attachments!.length}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/50">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {flows && flows.totalPages > 0 && (
            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Halaman{" "}
                <span className="font-semibold text-foreground">
                  {filter.page}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-foreground">
                  {flows.totalPages}
                </span>
                {flows.total != null && (
                  <span className="ml-1">
                    ({flows.total.toLocaleString("id-ID")} data)
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={(filter.page as number) <= 1}
                  onClick={() =>
                    setFilter({
                      ...filter,
                      page: Math.max(1, (filter.page as number) - 1),
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={
                    !flows.totalPages ||
                    (filter.page as number) >= flows.totalPages
                  }
                  onClick={() =>
                    setFilter({
                      ...filter,
                      page: (filter.page as number) + 1,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <FlowLogDetailDialog
        log={selectedLog}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
