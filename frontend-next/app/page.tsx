"use client";

import {
  ArrowRight,
  PlusIcon,
  MinusCircle,
  Download,
  Settings,
  HelpCircle,
  Warehouse,
  ChartBarIcon,
} from "lucide-react";
import Link from "next/link";
import { TopNavigation } from "../components/top-navigation";
import { Button, Card } from "@radix-ui/themes";
import { RecentMyFlow } from "../components/recent-my-flow";
import { useQuery } from "@tanstack/react-query";
import { FlowLogApi } from "@/api/flowLog.api";
import { useRouter } from "next/navigation";
import { useUserInfo } from "@/components/UserContext";
import { FlowLogType } from "@/types/flowLog";

export default function Home() {
  const router = useRouter();
  const { userInfo } = useUserInfo();
  const { data: recentFlowLogs } = useQuery({
    queryKey: ["flowLogs"],
    queryFn: async () =>
      await FlowLogApi.getRecentFlowLogs({
        page: 1,
        warehouse: userInfo?.warehouseId,
        lightMode: true,
      }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <TopNavigation />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg mb-6">
              <Warehouse className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Warehouse Budgeting
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Petty cash management
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Add Expense Card */}
            <Card className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200/60">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                    <MinusCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Catat Pengeluaran
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      Tambahkan pengeluaran kas kecil untuk operasional gudang
                    </p>
                  </div>
                </div>
                <Link href="/expense">
                  <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <span className="flex items-center justify-center gap-3">
                      Ke Form Pengeluaran
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Add Revenue Card */}
            <Card className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200/60">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <PlusIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Catat Pemasukan
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      Tambahkan pemasukan kas kecil dari berbagai sumber
                    </p>
                  </div>
                </div>
                <Link href="/revenue">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <span className="flex items-center justify-center gap-3">
                      Ke Form Pemasukan
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Card className="bg-white rounded-2xl shadow-sm border border-gray-200/60">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Aktivitas Terbaru
                    </h3>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/admin/flow")}
                      className="rounded-lg border-gray-300 hover:bg-gray-50"
                    >
                      Lihat Semua
                    </Button>
                  </div>
                  <RecentMyFlow
                    logs={recentFlowLogs?.logs}
                    type={FlowLogType.ALL}
                  />
                </div>
              </Card>
            </div>

            {/* Quick Links Sidebar */}
            <div className="space-y-6">
              <Card className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Akses Cepat
                </h4>
                <div className="space-y-3 ">
                  <Button
                    onClick={() => router.push("/admin/stats")}
                    variant="outline"
                    className="w-full justify-start gap-3 rounded-lg py-3 flex items-center"
                  >
                    <ChartBarIcon className="h-5 w-5" />
                    Simple Analytic
                  </Button>
                  <Button
                    onClick={() => router.push("/setup")}
                    variant="outline"
                    className="w-full justify-start gap-3 rounded-lg py-3 flex items-center"
                  >
                    <Settings className="h-5 w-5" />
                    Pengaturan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/admin/flow")}
                    className="w-full justify-start gap-3 rounded-lg py-3 flex items-center"
                  >
                    <Download className="h-5 w-5" />
                    Export Data
                  </Button>
                </div>
              </Card>

              {/* Help Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200/50 p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <HelpCircle className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Butuh Bantuan?
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Panduan penggunaan sistem kas kecil
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-lg border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    Buka Panduan
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
