"use client";

import { useState } from "react";
import { TopNavigation } from "../../components/top-navigation";
import { RecentMyFlow } from "../../components/recent-my-flow";
import { RevenueForm } from "../../components/revenue-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function RevenuePage() {
  const [revenues, setRevenues] = useState([
    {
      id: "1",
      title: "Fuel",
      amount: 250000,
      date: "2025-10-20",
      note: "Fuel for delivery truck",
      category: "Fuel",
    },
    {
      id: "2",
      title: "Maintenance",
      amount: 500000,
      date: "2025-10-19",
      note: "Forklift maintenance",
      category: "Maintenance",
    },
    {
      id: "3",
      title: "Office Supplies",
      amount: 150000,
      date: "2025-10-18",
      note: "Printer paper and ink",
      category: "Office Supplies",
    },
  ]);

  const { mutateAsync: handleSubmitRevenue } = useMutation({
    mutationKey: ["revenues"],
    mutationFn: async () => {},
    onSuccess: () => {
      toast.success("Expense submitted successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal membuat catatan";
      toast.error(errorMessage);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Expense Form */}
            <div className="lg:col-span-2">
              <RevenueForm onSubmit={handleSubmitRevenue} />
            </div>

            {/* Recent revenues */}
            <div className="lg:col-span-1">
              <RecentMyFlow logs={revenues} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
