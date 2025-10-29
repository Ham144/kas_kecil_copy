"use client";

import { Card } from "@radix-ui/themes";
import { TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import { TopNavigation } from "../../components/top-navigation";

export default function AdminHub() {
  const adminOptions = [
    {
      title: "Flow",
      description: "View and manage expense cash flow",
      icon: TrendingUp,
      href: "/admin/flow",
      color: "bg-blue-50 dark:bg-blue-950",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Stats",
      description: "View expense statistics and analytics",
      icon: BarChart3,
      href: "/admin/stats",
      color: "bg-purple-50 dark:bg-purple-950",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Administrator
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your warehouse expenses and view analytics
            </p>
          </div>

          {/* Admin Options Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {adminOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Link key={option.href} href={option.href}>
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-lg ${option.color}`}
                  >
                    <div className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white dark:bg-slate-900">
                        <Icon className={`h-6 w-6 ${option.iconColor}`} />
                      </div>
                      <h2 className="text-xl font-semibold text-foreground">
                        {option.title}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
