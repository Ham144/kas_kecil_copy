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

export default function CashFlow() {
  const { userInfo } = useUserInfo();
  const [modePeriod, setModePeriod] = useState<ModePeriod>(ModePeriod.MONTH);
  const [selectedLog, setSelectedLog] = useState<FlowLog | null>(null);

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
    queryFn: FlowLogCategoryApi.showAll,
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
                      <div>No expenses found matching your filters</div>
                    ) : (
                      flows?.logs &&
                      flows?.logs.length > 0 &&
                      flows?.logs.map((log: FlowLog) => (
                        <tr
                          key={log.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                          onClick={() => {
                            setSelectedLog(log);
                            (
                              document.getElementById(
                                "log-modal-detail"
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
                      ))
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
      <dialog id="log-modal-detail" className="modal modal-middle ">
        <div className="modal-box max-w-2xl p-0 overflow-hidden bg-gradient-to-br from-white to-blue-50   border border-blue-200 dark:border-blue-800 shadow-2xl flex-col flex overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r bg-primary p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Detail Transaksi</h3>
                  <p className="text-blue-100 text-sm">
                    Informasi lengkap transaksi
                  </p>
                </div>
              </div>
              <form method="dialog">
                <button className="btn btn-ghost btn-circle btn-sm text-white hover:bg-white/20 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title & Amount Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-y-auto ">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                  {selectedLog?.title || "Tidak ada judul"}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {selectedLog?.note || "Tidak ada catatan"}
                </p>
              </div>

              {/* Amount Badge */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  selectedLog?.type === "OUT"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                    : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                }`}
              >
                {selectedLog?.type === "OUT" ? (
                  <ArrowUpCircle className="w-5 h-5" />
                ) : (
                  <ArrowDownCircle className="w-5 h-5" />
                )}
                <span className="text-lg font-bold">
                  {selectedLog?.type === "OUT" ? "-" : "+"}Rp{" "}
                  {selectedLog?.amount?.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Transaction Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Created By */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Dibuat Oleh
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {(selectedLog?.createdBy as any)?.username}
                  </p>
                </div>
              </div>

              {/* Warehouse */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Building className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Gudang
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {selectedLog?.warehouse?.name}
                  </p>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Kategori
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {selectedLog?.category?.name}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tanggal
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {new Date(selectedLog?.createdAt as any).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedLog?.createdAt &&
                      new Date(selectedLog?.createdAt).toLocaleTimeString(
                        "id-ID"
                      )}
                  </p>
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            {selectedLog?.attachments &&
              selectedLog?.attachments?.length > 0 && (
                <div className="space-y-3 ">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-semibold text-gray-800 dark:text-white">
                      Lampiran
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-col overflow-y-auto ">
                    {selectedLog?.attachments?.map((attachment, index) => {
                      const attachmentUrl = getAttachmentUrl(attachment);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex-col"
                        >
                          <img
                            src={attachmentUrl}
                            alt={`Attachment ${index + 1}`}
                            className="max-w-full h-auto rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Download attachment"
                          >
                            <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Transaction ID */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                ID Transaksi
              </p>
              <p className="text-sm font-mono text-gray-600 dark:text-gray-300 break-all">
                {selectedLog?.id}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-action p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <form method="dialog" className="w-full">
              <button className="w-full btn btn-outline border-gray-300 hover:border-gray-400 text-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-300 rounded-xl">
                Tutup
              </button>
            </form>
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
