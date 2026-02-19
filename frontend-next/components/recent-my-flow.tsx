import {
  ArrowDownRight,
  ArrowUpRight,
  Building,
  Calendar,
  CreditCard,
  FileText,
  ImageIcon,
  MoreVertical,
  Tag,
  User,
} from "lucide-react";
import { FlowLog, FlowLogType } from "@/types/flowLog";
import { formatDateTime } from "@/lib/formatDate";

export function RecentMyFlow({ logs }: { logs: FlowLog[]; type: FlowLogType }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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

  if (!logs?.length) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Belum Ada Transaksi
        </h3>
        <p className="text-gray-500 text-sm">
          Transaksi finansial akan muncul di sini
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Riwayat Transaksi
              </h2>
              <p className="text-sm text-gray-600">
                {logs.length} transaksi ditemukan
              </p>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-gray-100">
        {logs.map((expense: FlowLog) => {
          const isIncome = expense.type === "IN";

          return (
            <div
              key={expense.id}
              className="p-5 hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="flex items-start gap-4">
                {/* Icon & Type Indicator */}
                <div
                  className={`p-3 rounded-xl ${
                    isIncome
                      ? "bg-gradient-to-br from-green-100 to-green-50 border border-green-200"
                      : "bg-gradient-to-br from-red-100 to-red-50 border border-red-200"
                  }`}
                >
                  {isIncome ? (
                    <ArrowDownRight className="w-6 h-6 text-green-600" />
                  ) : (
                    <ArrowUpRight className="w-6 h-6 text-red-600" />
                  )}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1">
                      {/* Title & Category */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {expense.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isIncome
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {isIncome ? "PEMASUKAN" : "PENGELUARAN"}
                        </span>
                      </div>

                      {/* Category & Warehouse */}
                      <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                        {expense.category?.name && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span>{expense.category.name}</span>
                          </div>
                        )}

                        {expense.warehouse?.name && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span>{expense.warehouse.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {expense.note && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700">
                              {expense.note}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{expense.createdBy.username}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(expense.date)}</span>
                        </div>

                        {expense.attachments?.length > 0 && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <ImageIcon className="w-4 h-4" />
                            <span>{expense.attachments.length} lampiran</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <div
                        className={`text-right ${
                          isIncome ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        <div className="text-2xl font-bold">
                          {isIncome ? "+" : "-"}{" "}
                          {formatCurrency(expense.amount)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Dibuat: {formatDateTime(expense.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Total Pemasukan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">Total Pengeluaran</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium text-gray-900">
              {formatCurrency(
                logs.reduce(
                  (sum, log) =>
                    sum + (log.type === "IN" ? log.amount : -log.amount),
                  0,
                ),
              )}
            </div>
            <div className="text-xs text-gray-500">Saldo Bersih</div>
          </div>
        </div>
      </div>
    </div>
  );
}
