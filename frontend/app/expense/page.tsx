"use client";

import { TopNavigation } from "../../components/top-navigation";
import { ExpenseForm } from "../../components/expense-form";
import { RecentMyFlow } from "../../components/recent-my-flow";
import { useQuery } from "@tanstack/react-query";
import { FlowLog, FlowLogType } from "@/types/flowLog";
import { FlowLogApi } from "@/api/flowLog.api";
import { AlertCircle, Loader2, MinusCircle } from "lucide-react";

export default function ExpensePage() {
  const {
    data: recentOutflows,
    isLoading: isLoadingExpenses,
    isError: isExpensesError,
    error: expensesError,
    refetch: refetchExpenses,
  } = useQuery({
    queryKey: ["recentOutflows", FlowLogType.OUT],
    queryFn: async () => {
      const response = await FlowLogApi.getRecentFlowLogs({
        page: 1,
        type: FlowLogType.OUT,
      });

      if (!response?.totalPages) {
        throw new Error(response.message || "Failed to fetch expenses");
      }

      return response.logs as FlowLog[];
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30">
      <TopNavigation />
      <main className="container mx-auto grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-red-100/80 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-md">
              <MinusCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Add Expense
              </h2>
              <p className="text-sm text-muted-foreground">
                Catat pengeluaran kas kecil gudang
              </p>
            </div>
          </div>
          <ExpenseForm />
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
          {isLoadingExpenses ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isExpensesError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="mt-2 text-sm text-destructive">
                {(expensesError as Error)?.message || "Failed to load expenses"}
              </p>
              <button
                onClick={() => refetchExpenses()}
                className="mt-4 text-sm font-medium text-primary hover:underline"
              >
                Coba lagi
              </button>
            </div>
          ) : (
            <RecentMyFlow type={FlowLogType.OUT} logs={recentOutflows || []} />
          )}
        </div>
      </main>
    </div>
  );
}
