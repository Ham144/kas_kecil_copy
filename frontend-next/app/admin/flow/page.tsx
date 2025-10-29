"use client";

import { useState, useMemo } from "react";

import {
  Search,
  Filter,
  ArrowUpCircle,
  ArrowDownCircle,
  Download,
  FileText,
} from "lucide-react";
import { TopNavigation } from "../../../components/top-navigation";
import { Card } from "@radix-ui/themes";

export default function CashFlow() {
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [selectedWarehouse, setSelectedWarehouse] = useState("warehouse-1");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Mock data - replace with actual API call
  const allExpenses = [
    {
      id: "1",
      title: "Fuel",
      category: "Fuel",
      amount: 250000,
      date: "2025-10-20",
      warehouse: "warehouse-1",
      warehouseName: "Warehouse A - Jakarta",
      type: "in",
    },
    {
      id: "2",
      title: "Maintenance",
      category: "Maintenance",
      amount: 500000,
      date: "2025-10-19",
      warehouse: "warehouse-1",
      warehouseName: "Warehouse A - Jakarta",
      type: "in",
    },
    {
      id: "3",
      title: "Office Supplies",
      category: "Office Supplies",
      amount: 150000,
      date: "2025-10-18",
      warehouse: "warehouse-2",
      warehouseName: "Warehouse B - Surabaya",
      type: "out",
    },
    {
      id: "4",
      title: "Utilities",
      category: "Utilities",
      amount: 300000,
      date: "2025-10-15",
      warehouse: "warehouse-1",
      warehouseName: "Warehouse A - Jakarta",
      type: "out",
    },
  ];

  const categories = [
    "Fuel",
    "Maintenance",
    "Office Supplies",
    "Utilities",
    "Transportation",
    "Equipment",
    "Other",
  ];
  const warehouses = [
    { id: "warehouse-1", name: "Warehouse A - Jakarta" },
    { id: "warehouse-2", name: "Warehouse B - Surabaya" },
  ];

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((expense) => {
      const expenseMonth = expense.date.slice(0, 7);
      const matchesTitle = expense.title
        .toLowerCase()
        .includes(searchTitle.toLowerCase());
      const matchesMonth = expenseMonth === selectedMonth;
      const matchesWarehouse =
        selectedWarehouse === "all" || expense.warehouse === selectedWarehouse;
      const matchesCategory =
        selectedCategory === "all" || expense.category === selectedCategory;

      return (
        matchesTitle && matchesMonth && matchesWarehouse && matchesCategory
      );
    });
  }, [searchTitle, selectedMonth, selectedWarehouse, selectedCategory]);

  const handleResetFilters = () => {
    setSearchTitle("");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setSelectedWarehouse("warehouse-1");
    setSelectedCategory("all");
  };

  const handleExportPDF = () => {
    const reportData = filteredExpenses.map((expense) => ({
      Title: expense.title,
      Category: expense.category,
      Warehouse: expense.warehouseName,
      Amount: formatCurrency(expense.amount),
      Date: formatDate(expense.date),
      Type: expense.type === "in" ? "Flow In" : "Flow Out",
    }));

    const csvContent = [
      Object.keys(reportData[0] || {}).join(","),
      ...reportData.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-report-${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
                  Total Records: {filteredExpenses.length}
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
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="Search by expense title..."
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Filters Grid */}
              <div className="grid gap-4 md:grid-cols-3">
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

                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Expense Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Type filter
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Type</option>
                    <option key={"in"} value={"in"}>
                      Flow In
                    </option>
                    <option key={"out"} value={"out"}>
                      Flow Out
                    </option>
                  </select>
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex justify-end pt-2">
                <button className="btn rounded-md bg-primary text-white p-2">
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
                  ({filteredExpenses.length})
                </span>
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
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
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          No expenses found matching your filters
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {expense.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {expense.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {expense.warehouseName}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-primary">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              expense.type === "in"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {expense.type == "in" ? (
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
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
