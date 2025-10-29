import { Calendar, Tag, DollarSign } from "lucide-react";

interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string;
  note: string;
  category: string;
}

export function RecentMyFlow({ expenses }: { expenses: Expense[] }) {
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
    <div className="rounded-lg border border-border bg-card shadow-lg">
      <div className="border-b border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Flow </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Last 3 submitted records
        </p>
      </div>

      <div className="divide-y divide-border">
        {expenses.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No expenses yet</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-foreground">
                      {expense.category}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(expense.date)}
                  </div>
                  {expense.note && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {expense.note}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-semibold text-primary">
                    <DollarSign className="h-4 w-4" />
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
