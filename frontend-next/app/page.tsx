"use client";

import { ArrowRight, PlusIcon, MinusCircle } from "lucide-react";
import Link from "next/link";
import { TopNavigation } from "../components/top-navigation";
import { Button, Card } from "@radix-ui/themes";
import { RecentMyFlow } from "../components/recent-my-flow";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your warehouse budgeting and petty cash expenses
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <MinusCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-foreground">
                        Add Expense
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Record a new petty cash expense
                      </p>
                    </div>
                  </div>
                  <Link href="/expense">
                    <Button className="mt-4 w-full gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 flex items-center">
                      <span className="flex-1">Go to Expense form</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <PlusIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-foreground">
                        Add Revenue
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Record a new petty cash revenue
                      </p>
                    </div>
                  </div>
                  <Link href="/revenue">
                    <Button className="mt-4 w-full gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 flex items-center">
                      <span className="flex-1">Go to Revenue Form</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
            <RecentMyFlow expenses={[]} />
          </div>
        </div>
      </main>
    </div>
  );
}
