"use client";
import { useEffect, useState } from "react";
import {
  Search,
  X,
  Calendar,
  User,
  Building,
  Tag,
  CreditCard,
  FileText,
  FileWarningIcon,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Hash,
  Clock,
  CheckCircle,
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ImageIcon,
  ExternalLink,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { TopNavigation } from "../../../components/top-navigation";
import { Card } from "@radix-ui/themes";
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
import { BASE_URL } from "@/lib/constant";
import { formatDateTime } from "@/lib/formatDate";

export default function CashFlow() {
  const { userInfo } = useUserInfo();
  const [modePeriod, setModePeriod] = useState<ModePeriod>(ModePeriod.MONTH);
  const [selectedLog, setSelectedLog] = useState<FlowLog | null>(null);
  const isIncome = selectedLog?.type === FlowLogType.IN;

  const initiatFilter: RecentFlowLogsFilter = {
    category: "all",
    searchKey: "",
    selectedDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
    type: FlowLogType.ALL,
    page: 1,
    limit: 20,
    warehouse: userInfo?.warehouseId,
    lightMode: false,
  };

  const [filter, setFilter] = useState<RecentFlowLogsFilter>(initiatFilter);
  // Fetch categories from backend
  const { data: categories = [] } = useQuery<FlowCategoryResponse[]>({
    queryKey: ["flow-log-category"],
    queryFn: () =>
      FlowLogCategoryApi.showAll({
        searchKey: "",
        selectedWarehouseId: userInfo?.warehouseId || "",
      }),
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => WarehouseApi.getWarehouses(),
  });

  //GET utama
  const {
    data: flows,
    isError: isErrorFlow,
    error: errorFlow,
  } = useQuery<PaginatedFlowLogs>({
    queryKey: ["flowLogs", filter],
    queryFn: () => FlowLogApi.getRecentFlowLogs(filter),
    enabled: !!userInfo?.warehouseId,
  });

  const handleExportPDF = async () => {
    try {
      const downloadURL = await FlowLogApi.getRecentFlowLogs({
        ...filter,
        isDownload: true,
      });
      if (!downloadURL?.url) {
        toast.error("File tidak tersedia");
        return;
      }
      // Normalize URL: remove trailing slash from BASE_URL and leading slash from path
      const baseUrl = (BASE_URL || "").replace(/\/+$/, "");
      const urlPart = (downloadURL?.url || "").replace(/^\/+/, "");
      const fullUrl = `${baseUrl}/${urlPart}`.trim();

      const newTab = window.open(fullUrl, "_blank", "noopener,noreferrer");

      // tutup otomatis setelah 5 detik sebagai fallback (kalau script server tidak jalan)
      setTimeout(() => {
        if (!newTab?.closed) newTab?.close();
      }, 5000);
    } catch (error) {
      toast.error("Gagal mengunduh file CSV");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAttachmentUrl = (attachmentPath: string) => {
    if (!attachmentPath) return "";
    // If already a full URL, return as is
    if (
      attachmentPath.startsWith("http://") ||
      attachmentPath.startsWith("https://")
    ) {
      return attachmentPath;
    }
    // Normalize BASE_URL: remove trailing slash
    const baseUrl = (BASE_URL || "").replace(/\/+$/, "");
    // Normalize path: ensure it starts with /
    const path = attachmentPath.startsWith("/")
      ? attachmentPath
      : `/${attachmentPath}`;
    return `${baseUrl}${path}`;
  };

  useEffect(() => {
    if (modePeriod == ModePeriod.DATE) {
      setFilter((prevFilter) => ({
        ...prevFilter,
        selectedDate: new Date().toISOString().split("T")[0],
      }));
    } else if (modePeriod == ModePeriod.MONTH) {
      setFilter((prevFilter) => ({
        ...prevFilter,
        selectedDate: `${new Date().getFullYear()}-${
          new Date().getMonth() + 1
        }`,
      }));
    }
  }, [modePeriod]);
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          {/* Export Report Card */}
          <Card className="mb-6 shadow-lg border border-border">
            <div className="border-b border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Export Report
                </h2>
              </div>
            </div>

            <div className="p-6">
              <p className="mb-4 text-sm text-muted-foreground">
                Export filtered expenses as CSV file for further analysis
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportPDF}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Export as CSV
                </button>
                <span className="text-xs text-muted-foreground pt-2.5">
                  Total Records: {flows?.total || 0}
                </span>
              </div>
            </div>
          </Card>
          {/* Filters Card */}
          <Card className="mb-6 shadow-lg">
            <div className="border-b border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Filters
                </h2>
              </div>
            </div>

            <div className="space-y-4 p-6">
              {/* Search Title */}
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Search Title
                </label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={filter.searchKey}
                    onChange={(e) =>
                      setFilter({ ...filter, searchKey: e.target.value })
                    }
                    placeholder="Search by expense title..."
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Filters Grid */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* mode period  */}
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Periode Mode
                  </label>
                  <select
                    value={modePeriod}
                    onChange={(e) =>
                      setModePeriod(e.target.value as ModePeriod)
                    }
                    className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {Object.values(ModePeriod).map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Month Picker */}
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Month
                  </label>
                  <input
                    type={modePeriod}
                    value={filter.selectedDate}
                    onChange={(e) => {
                      setFilter({
                        ...filter,
                        selectedDate: e.target.value,
                      });
                    }}
                    className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Warehouse Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Warehouse
                  </label>
                  <select
                    value={filter.warehouse}
                    onChange={(e) => {
                      setFilter((prev) => ({
                        ...prev,
                        warehouse: e.target.value,
                      }));
                    }}
                    className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Warehouses</option>
                    {warehouses &&
                      warehouses?.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Expense Category
                  </label>
                  <select
                    value={filter.category}
                    onChange={(e) => {
                      setFilter((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }));
                    }}
                    className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Type filter
                  </label>
                  <select
                    value={filter.type}
                    onChange={(e) => {
                      setFilter((prev) => ({
                        ...prev,
                        type: FlowLogType[e.target.value as FlowLogType],
                      }));
                    }}
                    className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value={FlowLogType.ALL}>All Type</option>
                    <option key={FlowLogType.IN} value={FlowLogType.IN}>
                      Flow In
                    </option>
                    <option key={FlowLogType.OUT} value={FlowLogType.OUT}>
                      Flow Out
                    </option>
                  </select>
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setFilter(initiatFilter);
                  }}
                  className="btn rounded-md bg-primary text-white p-2"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </Card>
          {/* Results */}
          <Card className="shadow-lg">
            <div className="border-b border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Results{" "}
                <span className="text-sm text-muted-foreground">
                  ({flows?.logs.length || 0})
                </span>
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isErrorFlow ? (
                <div role="alert" className="alert alert-error">
                  <FileWarningIcon />
                  <span>{errorFlow.message}.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Warehouse
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {flows?.logs.length === 0 ? (
                      <div className="text-center text-lg font-semibold text-muted-foreground">
                        No expenses found matching your filters
                      </div>
                    ) : (
                      flows?.logs &&
                      flows?.logs.length > 0 &&
                      flows?.logs.map((log: FlowLog) => {
                        return (
                          <tr
                            key={log.id}
                            className="border-b cursor-pointer   border-border hover:bg-muted/30 transition-colors"
                            onClick={() => {
                              setSelectedLog(log);
                              (
                                document.getElementById(
                                  "log-modal-detail",
                                ) as HTMLDialogElement
                              )?.showModal();
                            }}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-foreground">
                              {log.title}
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground">
                              {log.category?.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground">
                              {log.warehouse?.name}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-primary">
                              {formatCurrency(log.amount)}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {formatDate(log.createdAt as string)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                  log.type === FlowLogType.IN
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {log.type == FlowLogType.IN ? (
                                  <ArrowUpCircle />
                                ) : (
                                  <ArrowDownCircle />
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
          <div className="flex mt-3 items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Info Halaman */}
            <div className="flex-1 text-sm text-gray-600">
              Menampilkan halaman{" "}
              <span className="font-semibold text-gray-900">{filter.page}</span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-900">
                {flows?.totalPages}
              </span>
              {flows?.total && (
                <span className="ml-2">
                  ({flows.total.toLocaleString()} total data)
                </span>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  (filter.page as number) <= 1
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                }`}
                disabled={(filter.page as number) <= 1}
                onClick={() =>
                  setFilter({
                    ...filter,
                    page: (typeof filter?.page === "number"
                      ? filter?.page - 1
                      : 1) as number,
                  })
                }
                aria-label="Halaman Sebelumnya"
              >
                <ArrowLeft />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {/* First Page */}
                {flows?.totalPages && flows.totalPages > 1 && (
                  <button
                    className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg border text-sm font-medium transition-all duration-200 ${
                      filter.page === 1
                        ? "bg-primary border-primary text-white shadow-sm"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setFilter({ ...filter, page: 1 })}
                  >
                    1
                  </button>
                )}

                {/* Ellipsis before current page */}
                {(filter.page as number) > 3 &&
                  flows?.totalPages &&
                  flows.totalPages > 4 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}

                {/* Previous page */}
                {(filter.page as number) > 2 && flows?.totalPages && (
                  <button
                    className="min-w-[40px] h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all duration-200"
                    onClick={() =>
                      setFilter({
                        ...filter,
                        page: (filter.page as number) - 1,
                      })
                    }
                  >
                    {(filter.page as number) - 1}
                  </button>
                )}

                {/* Current Page (if not first or last) */}
                {filter.page !== 1 &&
                  flows?.totalPages &&
                  filter.page !== flows.totalPages && (
                    <button className="min-w-[40px] h-10 flex items-center justify-center rounded-lg bg-primary border-primary text-white text-sm font-medium shadow-sm transition-all duration-200">
                      {filter.page}
                    </button>
                  )}

                {/* Next page */}
                {flows?.totalPages &&
                  (filter.page as number) < flows.totalPages - 1 && (
                    <button
                      className="min-w-[40px] h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all duration-200"
                      onClick={() =>
                        setFilter({
                          ...filter,
                          page: (filter.page as number) + 1,
                        })
                      }
                    >
                      {(filter.page as number) + 1}
                    </button>
                  )}

                {/* Ellipsis after current page */}
                {flows?.totalPages &&
                  (filter.page as number) < flows.totalPages - 2 &&
                  flows.totalPages > 4 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}

                {/* Last Page */}
                {flows?.totalPages && flows.totalPages > 1 && (
                  <button
                    className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg border text-sm font-medium transition-all duration-200 ${
                      filter.page === flows.totalPages
                        ? "bg-primary border-primary text-white shadow-sm"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      setFilter({ ...filter, page: flows.totalPages })
                    }
                  >
                    {flows.totalPages}
                  </button>
                )}
              </div>

              {/* Next Button */}
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  typeof filter.page === "number" &&
                  flows?.totalPages !== undefined
                    ? filter.page >= flows.totalPages
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={
                  typeof filter.page === "number" &&
                  flows?.totalPages !== undefined
                    ? filter.page >= flows.totalPages
                    : true
                }
                onClick={() =>
                  typeof filter.page === "number"
                    ? setFilter({ ...filter, page: filter.page + 1 })
                    : undefined
                }
                aria-label="Halaman Selanjutnya"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      </main>
      {/* // dialog modal */}
      <dialog id="log-modal-detail" className="modal modal-middle">
        <div className="modal-box max-w-4xl p-0 overflow-hidden bg-white border border-gray-200 shadow-2xl ">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Receipt className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl">
                    Detail Transaksi Finansial
                  </h3>
                  <p className="text-gray-300 text-sm mt-1">
                    Informasi lengkap transaksi keuangan
                  </p>
                </div>
              </div>
              <form method="dialog">
                <button className="btn btn-ghost btn-circle btn-sm text-white hover:bg-white/20 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </form>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[90vh] overflow-y-auto pb-36">
            {/* Title & Amount Section */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isIncome
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isIncome ? (
                        <TrendingDown className="w-6 h-6" />
                      ) : (
                        <TrendingUp className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">
                        {selectedLog?.title || "Tidak ada judul"}
                      </h4>
                      <div
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                          isIncome
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {isIncome ? (
                          <>
                            <TrendingDown className="w-3.5 h-3.5" />
                            PENDAPATAN
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-3.5 h-3.5" />
                            PENGELUARAN
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedLog?.note && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Catatan:
                          </p>
                          <p className="text-gray-800">{selectedLog.note}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Amount Card */}
                <div
                  className={`lg:w-64 p-5 rounded-xl border-2 ${
                    isIncome
                      ? "border-green-200 bg-gradient-to-br from-green-50 to-white"
                      : "border-red-200 bg-gradient-to-br from-red-50 to-white"
                  }`}
                >
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Jumlah Transaksi
                    </p>
                    <div
                      className={`text-3xl font-bold ${
                        isIncome ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {isIncome ? "+" : "-"}{" "}
                      {formatCurrency(selectedLog?.amount || 0)}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Transaksi {isIncome ? "masuk" : "keluar"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Created By */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Dibuat Oleh</p>
                    <p className="font-semibold text-gray-900">
                      {selectedLog?.createdBy?.displayName ||
                        selectedLog?.createdBy.username}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      @
                      {selectedLog?.createdBy?.username ||
                        selectedLog?.createdBy.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warehouse */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Gudang</p>
                    <p className="font-semibold text-gray-900">
                      {selectedLog?.warehouse?.name || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Tag className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Kategori</p>
                    <p className="font-semibold text-gray-900">
                      {selectedLog?.category?.name || "-"}
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {isIncome ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">
                      Tanggal Transaksi
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedLog?.date
                        ? formatDate(selectedLog.date as unknown as string)
                        : "-"}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDateTime(selectedLog?.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Dibuat: {formatDate(selectedLog?.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            {selectedLog?.attachments && selectedLog.attachments.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Bukti Transaksi
                        </h4>
                        <p className="text-sm text-gray-600">
                          {selectedLog.attachments.length} file lampiran
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Klik untuk memperbesar
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedLog.attachments.map((attachment, index) => {
                      const attachmentUrl = getAttachmentUrl(attachment);
                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(
                        attachment,
                      );

                      return (
                        <div
                          key={index}
                          className="group relative overflow-hidden rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-300"
                        >
                          {/* Image Preview */}
                          {isImage ? (
                            <div className="aspect-square overflow-hidden bg-gray-100">
                              <img
                                src={attachmentUrl}
                                alt={`Bukti transaksi ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="aspect-square flex items-center justify-center bg-gray-50">
                              <FileText className="w-12 h-12 text-gray-400" />
                            </div>
                          )}

                          {/* Overlay Actions */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              <a
                                href={attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                                title="Lihat full size"
                              >
                                <ExternalLink className="w-5 h-5 text-gray-700" />
                              </a>
                              <a
                                href={attachmentUrl}
                                download
                                className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                                title="Download file"
                              >
                                <Download className="w-5 h-5 text-gray-700" />
                              </a>
                            </div>
                          </div>

                          {/* File Info */}
                          <div className="p-3 bg-white border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 truncate">
                                Bukti {index + 1}
                              </span>
                              <span className="text-xs text-gray-500">
                                {attachment.split("/").pop()?.substring(0, 10)}
                                ...
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Metadata */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Transaction ID */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Hash className="w-5 h-5 text-gray-600" />
                  <h5 className="font-semibold text-gray-800">ID Transaksi</h5>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-300">
                  <code className="text-sm text-gray-700 break-all font-mono">
                    {selectedLog?.id}
                  </code>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Gunakan ID ini untuk referensi administrasi
                </p>
              </div>

              {/* Transaction Summary */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                  <h5 className="font-semibold text-gray-800">Ringkasan</h5>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Status</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        isIncome
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isIncome ? "✓ Selesai" : "✓ Tercatat"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Tipe</span>
                    <span className="font-medium text-gray-900">
                      {isIncome ? "Pemasukan" : "Pengeluaran"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Tanggal Input</span>
                    <span className="font-medium text-gray-900">
                      {selectedLog?.createdAt
                        ? formatDate(selectedLog.createdAt as string)
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="text-sm text-gray-600">
                Transaksi ini dicatat pada sistem keuangan gudang
              </div>
              <div className="flex gap-3">
                <form method="dialog">
                  <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium">
                    Tutup
                  </button>
                </form>
                <button className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium">
                  Cetak Laporan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Backdrop */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
