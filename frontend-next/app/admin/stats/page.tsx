"use client";

import { useState, useMemo, useEffect } from "react";

import { Card } from "@radix-ui/themes";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileWarningIcon,
  Filter,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TopNavigation } from "../../../components/top-navigation";
import { useQuery } from "@tanstack/react-query";
import { FlowLogApi } from "@/api/flowLog.api";
import { GetAnalyticFilter } from "@/types/flowLog";
import { useUserInfo } from "@/components/UserContext";
import { ModePeriod } from "@/types/flowcategory.type";
import { Role } from "@/types/role.type";

export default function StatsPage() {
  const [isErrorAnalytic, setIsErrorAnalytic] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { userInfo } = useUserInfo();
  const [modePeriod, setModePeriod] = useState<ModePeriod>(ModePeriod.MONTH);
  const [filter, setFilter] = useState<GetAnalyticFilter>({
    selectedDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
    selectedWarehouseId: userInfo?.warehouseId,
  });

  const { data: analytic } = useQuery({
    queryKey: ["flow-logs", filter, userInfo?.warehouseId, modePeriod],
    queryFn: async () => {
      try {
        const res = await FlowLogApi.getAnalytic(filter);
        return res;
      } catch (error: any) {
        setIsErrorAnalytic(true);
        console.log(error);
        setErrors((prevErrors) => [...prevErrors, error.response.data.message]);
        return null;
      }
    },
    enabled: !!userInfo?.warehouseId,
  });

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      selectedWarehouseId: userInfo?.warehouseId,
    }));
  }, [userInfo?.warehouseId]);

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

  console.log(filter.selectedDate);
  if (isErrorAnalytic) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div role="alert" className="alert alert-error">
          <FileWarningIcon />
          <div className="flex flex-col gap-3">
            {errors.map((error, index) => (
              <span key={index}>{error}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {/* Total Spent Widget */}
            <Card className="shadow-lg border border-border">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Jumlah Kas saat ini
                    </p>
                    <p className="font-medium text-muted-foreground text-xs">
                      "total out-flow" - "total in-flow"
                    </p>

                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {formatCurrency(analytic?.budgetSpent || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
            </Card>
            {/* Budget Remaining Widget */}
            <Card className="shadow-lg border border-border">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      sisa terhadapat pencapaian
                    </p>
                    <p className="font-medium text-muted-foreground text-xs">
                      "current month budget" - "budget spent"
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {formatCurrency(analytic?.budgetRemaining || 0)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      dari budget{" "}
                      <span className="badge font-bold">
                        {analytic?.currentMonthBudget == 0
                          ? "tentukan warehouse"
                          : "Rp. " +
                            formatCurrency(analytic?.currentMonthBudget || 0)}
                      </span>
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      analytic && analytic.budgetRemaining > 0
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    <div
                      className={`h-6 w-6 ${
                        analytic && analytic?.budgetRemaining > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {analytic && analytic?.budgetRemaining > 0 ? "✓" : "✕"}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            {/* Top Category Widget */}
            <Card className="shadow-lg border border-border">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Top Expense Category
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {(analytic?.topCategories?.[0] as any)?.name || "-"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-3">
                    <div className="h-6 w-6 text-blue-600">📊</div>
                  </div>
                </div>
              </div>
            </Card>{" "}
            {/* total inFlow Widget */}
            <Card className="shadow-lg border border-border">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total in-flow This {modePeriod}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {formatCurrency(analytic?.totalInflow || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-3">
                    <ArrowDownLeft />
                  </div>
                </div>
              </div>
            </Card>
            {/* total outflow Widget */}
            <Card className="shadow-lg border border-border">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total out-flow This {[modePeriod]}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {formatCurrency(analytic?.totalOutflow || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-100 p-3">
                    <ArrowUpRight />
                  </div>
                </div>
              </div>
            </Card>
          </div>

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
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        selectedDate: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Warehouse Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Warehouse
                  </label>
                  <select
                    value={filter.selectedWarehouseId}
                    disabled={userInfo?.role != Role.ADMIN}
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        selectedWarehouseId: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Warehouses</option>
                    {analytic?.topWarehouses &&
                      analytic?.topWarehouses.map((warehouse: any) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Pie Chart */}
            <Card className="shadow-lg">
              <div className="border-b border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Expenses by Category
                </h3>
              </div>
              <div className="p-6">
                {analytic?.topCategories &&
                analytic?.topCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytic?.topCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytic?.topCategories.map(
                          (entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </Card>
            {/* Bar Chart */}
            <Card className="shadow-lg">
              <div className="border-b border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Amount by Category
                </h3>
              </div>
              <div className="p-6">
                {analytic?.topCategories &&
                analytic?.topCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytic?.topCategories}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </Card>
            <Card className="shadow-lg md:col-span-2">
              <div className="border-b border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Flow Over Time (current month)
                </h3>
              </div>
              <div className="p-6">
                {analytic?.flowOverTime && analytic.flowOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytic.flowOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                          })
                        }
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(date) =>
                          new Date(date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                          })
                        }
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="IN"
                        stroke="#22c55e"
                        name="Pemasukan"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="OUT"
                        stroke="#ef4444"
                        name="Pengeluaran"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </Card>
            {/* Rank category Chart */}
            <Card className="shadow-lg md:col-span-2">
              <div className="border-b border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Top 5 Categories expenses
                </h3>
              </div>
              <div className="p-6">
                {analytic?.topCategories &&
                analytic?.topCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={analytic?.topCategories}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={190} />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--chart-3))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </Card>{" "}
            {/* Rank category Chart */}
            <Card className="shadow-lg md:col-span-2">
              <div className="border-b border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Top 5 warehouses expenses
                </h3>
              </div>
              <div className="p-6">
                {analytic?.topWarehouses &&
                analytic?.topWarehouses.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={analytic?.topWarehouses}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={190} />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Bar dataKey="total" fill="hsl(var(--chart-3))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
