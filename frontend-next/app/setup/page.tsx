"use client";

import { Card } from "@radix-ui/themes";
import { Warehouse, Tag, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SetupPage() {
  const setupOptions = [
    {
      title: "Setup Warehouse",
      description: "Manage warehouse locations and configurations",
      icon: Warehouse,
      href: "/warehouse",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Setup Category",
      description: "Create and manage your warehouse's categories",
      icon: Tag,
      href: "/setup/category",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      title: "Manage Accounts",
      description: "Manage warehouse memebers and roles",
      icon: Users,
      href: "/setup/accounts",
      color: "bg-green-500/10 text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Setup & Configuration
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your warehouse budgeting system settings
          </p>
        </div>

        {/* Setup Options Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {setupOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Link key={option.href} href={option.href}>
                <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
                  <div className="p-6">
                    <div
                      className={`mb-4 inline-flex rounded-lg p-3 ${option.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {option.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {option.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-sm font-medium">Go to setup</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
