"use client";

import { TopNavigation } from "../../components/top-navigation";
import { RecentMyFlow } from "../../components/recent-my-flow";
import { useQuery } from "@tanstack/react-query";
import { FlowLog, FlowLogType } from "@/types/flowLog";
import { FlowLogApi } from "@/api/flowLog.api";
import { AlertCircle, Loader2, PlusIcon } from "lucide-react";
import { RevenueForm } from "@/components/revenue-form";

export default function RevenuePage() {
  const {
    data: recentInflows,
    isLoading: isLoadingRevenue,
    isError: isRevenueError,
    error: revenueError,
    refetch: refetchRevenue,
  } = useQuery({
    queryKey: ["recentInflows", FlowLogType.IN],
    queryFn: async () => {
      const response = await FlowLogApi.getRecentFlowLogs({
        page: 1,
        type: FlowLogType.IN,
      });

      if (!response?.totalPages) {
        throw new Error(response.message || "Failed to fetch revenue");
      }

      return response.logs as FlowLog[];
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <TopNavigation />
      <main className="container mx-auto grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100/80 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md">
              <PlusIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Add Revenue
              </h2>
              <p className="text-sm text-muted-foreground">
                Catat pemasukan kas kecil gudang
              </p>
            </div>
          </div>
          <RevenueForm />
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
          {isLoadingRevenue ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isRevenueError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="mt-2 text-sm text-destructive">
                {(revenueError as Error)?.message || "Failed to load revenue"}
              </p>
              <button
                onClick={() => refetchRevenue()}
                className="mt-4 text-sm font-medium text-primary hover:underline"
              >
                Coba lagi
              </button>
            </div>
          ) : (
            <RecentMyFlow type={FlowLogType.IN} logs={recentInflows || []} />
          )}
        </div>
      </main>
    </div>
  );
}
