import { Calendar, Tag, DollarSign } from "lucide-react";
import { FlowLog, FlowLogType } from "@/types/flowLog";

export function RecentMyFlow({ logs }: { logs: FlowLog[] }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-lg">
      <div className="border-b border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Flow </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Last 3 submitted records
        </p>
      </div>

      <div className="divide-y divide-border">
        {logs?.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No logs yet</p>
          </div>
        ) : (
          logs?.map((expense) => (
            <div
              key={expense.id}
              className="p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-foreground"></p>
                  </div>
                  {expense.category && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {typeof expense.category === "object"
                        ? expense.category.name
                        : expense.category}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(expense.createdAt)}
                  </div>
                  {expense.note && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {expense.note}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-semibold text-primary">
                    <span className="text-sm">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
