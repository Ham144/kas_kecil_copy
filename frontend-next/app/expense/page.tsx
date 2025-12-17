"use client";

import { useCallback } from "react";
import { TopNavigation } from "../../components/top-navigation";
import { ExpenseForm } from "../../components/expense-form";
import { RecentMyFlow } from "../../components/recent-my-flow";
import { useQuery } from "@tanstack/react-query";
import { FlowLog, FlowLogType } from "@/types/flowLog";
import { FlowLogApi } from "@/api/flowLog.api";
import { Loader2, AlertCircle } from "lucide-react";

export default function ExpensePage() {
  // Fetch recent expenses with proper error handling and loading states
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

  // Handle refresh action
  const handleRefresh = useCallback(() => {
    refetchExpenses();
  }, [refetchExpenses]);

  // Loading state component
  const LoadingState = () => (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Loading expenses...
        </p>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = ({
    error,
    onRetry,
  }: {
    error: any;
    onRetry: () => void;
  }) => (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
        <p className="mt-2 text-sm text-destructive">
          {error?.message || "Failed to load expenses"}
        </p>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="grid grid-cols-2 mx-auto gap-3 container p-5">
        {/* Expense Form */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Add Expense</h2>
            </div>
            <ExpenseForm />
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="lg:col-span-1 ">
          <div className="bg-card rounded-lg border p-3">
            {isLoadingExpenses ? (
              <LoadingState />
            ) : isExpensesError ? (
              <ErrorState error={expensesError} onRetry={refetchExpenses} />
            ) : (
              <RecentMyFlow
                type={FlowLogType.OUT}
                logs={recentOutflows || []}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
