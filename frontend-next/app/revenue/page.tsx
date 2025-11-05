"use client";

import { useCallback } from "react";
import { TopNavigation } from "../../components/top-navigation";
import { ExpenseForm } from "../../components/expense-form";
import { RecentMyFlow } from "../../components/recent-my-flow";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FlowLogType, PaginatedFlowLogs } from "@/types/flowLog";
import { FlowLogApi } from "@/api/flowLog.api";
import { Loader2, AlertCircle } from "lucide-react";
import { RevenueForm } from "@/components/revenue-form";

export default function RevenuePage() {
  const queryClient = useQueryClient();

  // Fetch recent revenue with proper error handling and loading states
  const {
    data: recentOutflows,
    isLoading: isLoadingRevenue,
    isError: isrevenueError,
    error: revenueError,
    refetch: refetchRevenue,
  } = useQuery({
    queryKey: ["recentOutflows", FlowLogType.IN],
    queryFn: async () => {
      const response = await FlowLogApi.getRecentFlowLogs({
        page: 1,
        type: FlowLogType.IN,
      });

      if (!response?.totalPages) {
        throw new Error(response.message || "Failed to fetch expenses");
      }

      return response.logs as PaginatedFlowLogs;
    },
  });

  // Handle refresh action
  const handleRefresh = useCallback(() => {
    refetchRevenue();
  }, [refetchRevenue]);

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
          onClick={() => refetchRevenue()}
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
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Expense Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Add Expense
                  </h2>
                </div>
                <RevenueForm />
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Recent Revenues</h2>
                  <button
                    onClick={handleRefresh}
                    disabled={isLoadingRevenue}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    Refresh
                  </button>
                </div>

                {isLoadingRevenue ? (
                  <LoadingState />
                ) : isrevenueError ? (
                  <ErrorState error={revenueError} onRetry={refetchRevenue} />
                ) : (
                  <RecentMyFlow logs={recentOutflows || []} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
