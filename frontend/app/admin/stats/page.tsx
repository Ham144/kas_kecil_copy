"use client";

import { useState, useEffect, type ComponentType, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  FileWarningIcon,
  Filter,
  PiggyBank,
  Tag,
  TrendingUp,
  Wallet,
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
import { WarehouseApi } from "@/api/warehouse";
import { Warehouse } from "@/types/warehouse";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function KpiCard({
  label,
  hint,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  hint?: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {hint && (
            <p className="mt-0.5 text-[11px] text-muted-foreground/80">{hint}</p>
          )}
          <p className="mt-2 truncate text-xl font-bold text-foreground sm:text-2xl">
            {value}
          </p>
        </div>
        <div className={`shrink-0 rounded-xl p-3 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${className}`}
    >
      <div className="border-b border-border bg-muted/20 px-5 py-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center text-muted-foreground">
      <BarChart3 className="mb-2 h-8 w-8 opacity-40" />
      <p className="text-sm">Belum ada data</p>
    </div>
  );
}

export default function StatsPage() {
  const [isErrorAnalytic, setIsErrorAnalytic] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { userInfo } = useUserInfo();
  const isKasir = userInfo?.role === Role.KASIR;
  const [modePeriod, setModePeriod] = useState<ModePeriod>(ModePeriod.MONTH);
  const [filter, setFilter] = useState<GetAnalyticFilter>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return {
      selectedDate: `${year}-${month}-${day}`,
      selectedWarehouseId: "all",
    };
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => await WarehouseApi.getWarehouses(""),
  });

  const { data: analytic } = useQuery({
    queryKey: ["flow-logs", filter, userInfo?.warehouseId, modePeriod],
    queryFn: async () => {
      try {
        setIsErrorAnalytic(false);
        return await FlowLogApi.getAnalytic(filter);
      } catch (error: any) {
        setIsErrorAnalytic(true);
        setErrors([error.response?.data?.message || "Gagal memuat analitik"]);
        return null;
      }
    },
    enabled: !!userInfo,
  });

  useEffect(() => {
    if (isKasir && userInfo?.warehouseId) {
      setFilter((prev) => ({
        ...prev,
        selectedWarehouseId: userInfo.warehouseId,
      }));
    }
  }, [isKasir, userInfo?.warehouseId]);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const localDate = `${year}-${month}-${day}`;
    const localMonth = `${year}-${month}`;

    if (modePeriod === ModePeriod.DATE) {
      setFilter((prev) => ({
        ...prev,
        selectedDate: localDate,
      }));
    } else if (modePeriod === ModePeriod.MONTH) {
      setFilter((prev) => ({
        ...prev,
        selectedDate: localMonth,
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        selectedDate: localDate,
      }));
    }
  }, [modePeriod]);

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  const kasBalance = (analytic?.totalInflow ?? 0) - (analytic?.totalOutflow ?? 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <TopNavigation />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Hero */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-md">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Ringkasan kas kecil per warehouse & periode
            </p>
          </div>
        </div>

        {isErrorAnalytic && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
            <FileWarningIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="text-sm">{errors.join(", ")}</div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-4">
            <Filter className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Filter Periode</h2>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Mode Periode
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
                  setFilter((prev) => ({
                    ...prev,
                    selectedDate: e.target.value,
                  }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Warehouse
              </label>
              <select
                value={filter.selectedWarehouseId}
                disabled={isKasir}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    selectedWarehouseId: e.target.value,
                  }))
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
                    {warehouses?.map((w: Warehouse) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <KpiCard
            label="Saldo Kas"
            hint="Pemasukan − Pengeluaran"
            value={formatCurrency(kasBalance)}
            icon={Wallet}
            accent="bg-blue-100 text-blue-600"
          />
          <KpiCard
            label="Sisa Budget"
            hint={`dari ${formatCurrency(analytic?.currentMonthBudget ?? 0)}`}
            value={formatCurrency(analytic?.budgetRemaining ?? 0)}
            icon={PiggyBank}
            accent={
              (analytic?.budgetRemaining ?? 0) >= 0
                ? "bg-emerald-100 text-emerald-600"
                : "bg-red-100 text-red-600"
            }
          />
          <KpiCard
            label="Top Kategori"
            value={(analytic?.topCategories?.[0] as any)?.name || "—"}
            icon={Tag}
            accent="bg-purple-100 text-purple-600"
          />
          <KpiCard
            label="Total Pemasukan"
            hint={`Periode ${modePeriod}`}
            value={formatCurrency(analytic?.totalInflow ?? 0)}
            icon={ArrowDownLeft}
            accent="bg-emerald-100 text-emerald-600"
          />
          <KpiCard
            label="Total Pengeluaran"
            hint={`Periode ${modePeriod}`}
            value={formatCurrency(analytic?.totalOutflow ?? 0)}
            icon={ArrowUpRight}
            accent="bg-red-100 text-red-600"
          />
        </div>

        {/* Budget breakdown */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/20 px-5 py-4">
            <h2 className="font-semibold text-foreground">
              Realisasi Budget per Kategori
            </h2>
            <p className="text-xs text-muted-foreground">
              Perbandingan pengeluaran vs alokasi budget
            </p>
          </div>
          <div className="space-y-4 p-5">
            {analytic?.categoriesToBudget?.length ? (
              analytic.categoriesToBudget.map((item, index) => {
                const spentPct =
                  item.budget > 0
                    ? Math.min(
                        100,
                        (Math.abs(item.totalSpent) / item.budget) * 100,
                      )
                    : 0;
                const isOver = spentPct > 100;

                return (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(Math.abs(item.totalSpent))}
                        <span className="mx-1">/</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(item.budget)}
                        </span>
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver
                            ? "bg-gradient-to-r from-red-500 to-orange-500"
                            : "bg-gradient-to-r from-blue-500 to-indigo-500"
                        }`}
                        style={{ width: `${Math.min(spentPct, 100)}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>Terpakai {Math.round(spentPct)}%</span>
                      <span>
                        Sisa {formatCurrency(item.budgetRemaining)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Belum ada data budget untuk periode ini
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard
            title="Distribusi Pengeluaran"
            subtitle="Persentase per kategori"
          >
            {analytic?.topCategories?.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analytic.topCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    dataKey="value"
                  >
                    {analytic.topCategories.map((_: unknown, i: number) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatCurrency(v as number)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>

          <ChartCard title="Nominal per Kategori" subtitle="Bar chart">
            {analytic?.topCategories?.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytic.topCategories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(v as number)} />
                  <Bar
                    dataKey="amount"
                    fill="hsl(var(--chart-1))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>

          <ChartCard
            title="Arus Kas Over Time"
            subtitle="Pemasukan vs pengeluaran harian"
            className="md:col-span-2"
          >
            {analytic?.flowOverTime?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytic.flowOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(d) =>
                      new Date(d).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                      })
                    }
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v)}
                    labelFormatter={(d) =>
                      new Date(d).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="IN"
                    stroke="#16a34a"
                    strokeWidth={2}
                    name="Pemasukan"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="OUT"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Pengeluaran"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>

          <ChartCard
            title="Top 5 Kategori Pengeluaran"
            className="md:col-span-2"
          >
            {analytic?.topCategories?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analytic.topCategories}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(v) => formatCurrency(v as number)} />
                  <Bar
                    dataKey="amount"
                    fill="hsl(var(--chart-3))"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>

          <ChartCard
            title="Top 5 Warehouse Pengeluaran"
            className="md:col-span-2"
          >
            {analytic?.topWarehouses?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analytic.topWarehouses}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(v) => formatCurrency(v as number)} />
                  <Bar
                    dataKey="total"
                    fill="hsl(var(--chart-2))"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>
        </div>
      </main>
    </div>
  );
}
