"use client";

import { useState, useMemo } from "react";

import { Card } from "@radix-ui/themes";
import { Filter, TrendingUp } from "lucide-react";
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

export default function StatsPage() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [selectedWarehouse, setSelectedWarehouse] = useState("warehouse-1");

  // Mock data
  const warehouses = [
    { id: "warehouse-1", name: "Warehouse A - Jakarta" },
    { id: "warehouse-2", name: "Warehouse B - Surabaya" },
  ];

  const allExpenses = [
    {
      id: "1",
      title: "Fuel",
      category: "Fuel",
      amount: 250000,
      date: "2025-10-20",
      warehouse: "warehouse-1",
    },
    {
      id: "2",
      title: "Maintenance",
      category: "Maintenance",
      amount: 500000,
      date: "2025-10-19",
      warehouse: "warehouse-1",
    },
    {
      id: "3",
      title: "Office Supplies",
      category: "Office Supplies",
      amount: 150000,
      date: "2025-10-18",
      warehouse: "warehouse-2",
    },
    {
      id: "4",
      title: "Utilities",
      category: "Utilities",
      amount: 300000,
      date: "2025-10-15",
      warehouse: "warehouse-1",
    },
    {
      id: "5",
      title: "Equipment",
      category: "Equipment",
      amount: 1000000,
      date: "2025-10-10",
      warehouse: "warehouse-1",
    },
  ];

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((expense) => {
      const expenseMonth = expense.date.slice(0, 7);
      const matchesMonth = expenseMonth === selectedMonth;
      const matchesWarehouse =
        selectedWarehouse === "all" || expense.warehouse === selectedWarehouse;
      return matchesMonth && matchesWarehouse;
    });
  }, [selectedMonth, selectedWarehouse]);

  // Pie Chart Data - By Category
  const pieData = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    filteredExpenses.forEach((expense) => {
      categoryMap[expense.category] =
        (categoryMap[expense.category] || 0) + expense.amount;
    });
    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredExpenses]);

  // Bar Chart Data - By Category
  const barData = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    filteredExpenses.forEach((expense) => {
      categoryMap[expense.category] =
        (categoryMap[expense.category] || 0) + expense.amount;
    });
    return Object.entries(categoryMap).map(([name, amount]) => ({
      name,
      amount,
    }));
  }, [filteredExpenses]);

  // Line Chart Data - By Date
  const lineData = useMemo(() => {
    const dateMap: { [key: string]: number } = {};
    filteredExpenses.forEach((expense) => {
      const date = expense.date;
      dateMap[date] = (dateMap[date] || 0) + expense.amount;
    });
    return Object.entries(dateMap)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString("id-ID", {
          month: "short",
          day: "numeric",
        }),
        amount,
      }));
  }, [filteredExpenses]);

  // Rank Chart Data - Top Categories
  const rankData = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    filteredExpenses.forEach((expense) => {
      categoryMap[expense.category] =
        (categoryMap[expense.category] || 0) + expense.amount;
    });
    return Object.entries(categoryMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredExpenses]);

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

  const totalSpent = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const topCategory = useMemo(() => {
    if (rankData.length === 0) return null;
    return rankData[0];
  }, [rankData]);

  const budgetLimit = 5000000; // Mock budget limit
  const budgetRemaining = Math.max(0, budgetLimit - totalSpent);

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
                      Total Spent This Month
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {formatCurrency(totalSpent)}
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
                      Budget Remaining
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {formatCurrency(budgetRemaining)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      of {formatCurrency(budgetLimit)}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-3 ${budgetRemaining > 0 ? "bg-green-100" : "bg-red-100"}`}
                  >
                    <div
                      className={`h-6 w-6 ${budgetRemaining > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {budgetRemaining > 0 ? "✓" : "✕"}
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
                      {topCategory?.name || "N/A"}
                    </p>
                    {topCategory && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatCurrency(topCategory.amount)}
                      </p>
                    )}
                  </div>
                  <div className="rounded-lg bg-blue-100 p-3">
                    <div className="h-6 w-6 text-blue-600">📊</div>
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
              <div className="grid gap-4 md:grid-cols-2">
                {/* Month Picker */}
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Month
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Warehouse Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Warehouse
                  </label>
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Warehouses</option>
                    {warehouses.map((warehouse) => (
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
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
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
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
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
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
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

            {/* Line Chart */}
            <Card className="shadow-lg md:col-span-2">
              <div className="border-b border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Expenses Over Time
                </h3>
              </div>
              <div className="p-6">
                {lineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--chart-2))"
                        name="Amount"
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

            {/* Rank Chart */}
            <Card className="shadow-lg md:col-span-2">
              <div className="border-b border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Top 5 Categories
                </h3>
              </div>
              <div className="p-6">
                {rankData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={rankData}
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
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
