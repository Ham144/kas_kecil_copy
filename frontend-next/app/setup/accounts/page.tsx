"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Shield } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Button, Card } from "@radix-ui/themes";
import { TopNavigation } from "../../../components/top-navigation";
import { useRouter } from "next/navigation";
import { UserInfo } from "@/types/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthApi } from "@/api/auth";

export default function AccountsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [onEditingAccount, setOnEditingAccount] = useState<
    UserInfo | undefined
  >();
  const [formData, setFormData] = useState<UserInfo>();
  const [page, setPage] = useState(1);
  const [searchKey, setSearcKey] = useState("");

  const router = useRouter();

  const { mutateAsync: handleEditAccount } = useMutation({
    mutationKey: ["users", onEditingAccount],
    mutationFn: async () => {
      if (onEditingAccount) {
        return await AuthApi.updateAccount(onEditingAccount);
      }
    },
    onSuccess: () => {
      toast.success("Account berhasil diupdate");
      setIsDialogOpen(false);
    },
  });

  const { data: accounts = [] } = useQuery<UserInfo[]>({
    queryKey: ["users"],
    queryFn: async () => await AuthApi.getAllAccount(page, searchKey),
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-600";
      case "user":
        return "bg-blue-500/10 text-blue-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span
                className="cursor-pointer "
                onClick={() => {
                  router.push("/setup");
                }}
              >
                Setup
              </span>
              <span>/</span>
              <span className="text-foreground font-medium">accounts</span>
            </div>
            <h1 className="text-3xl font-semibold text-foreground">
              Account Setup
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage accounts and permissions
            </p>
          </div>
        </div>

        {/* Accounts Table */}
        <Card className="shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    displayName
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr
                    key={account.username}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="px-6 py-4 text-sm text-foreground">
                      {account.username}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {account.displayName}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getRoleColor(
                          account.description
                        )}`}
                      >
                        <Shield className="h-3 w-3" />
                        {account.description.charAt(0).toUpperCase() +
                          account.description.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span>{account.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => {
                            setOnEditingAccount(account);
                            setIsDialogOpen(true);
                          }}
                          variant="ghost"
                          className="gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add/Edit Account Dialog */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {onEditingAccount ? "Edit Account" : "Add New Account"}
            </Dialog.Title>

            <div className="mt-6 space-y-4">
              <span>Display Name</span>
              <input
                type="text"
                value={onEditingAccount?.displayName || ""}
                onChange={(e) => {
                  setOnEditingAccount((prev) =>
                    prev ? { ...prev, displayName: e.target.value } : undefined
                  );
                }}
                placeholder="display name"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="form-control">
                <label className="flex items-center gap-2">
                  <span className="label-text">User Aktif</span>
                  <input
                    type="checkbox"
                    checked={onEditingAccount?.isActive || false}
                    className="checkbox"
                    onChange={(e) => {
                      setOnEditingAccount((prev) =>
                        prev
                          ? { ...prev, isActive: e.target.checked }
                          : undefined
                      );
                    }}
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleEditAccount()}
                  className="flex-1 rounded-lg bg-primary py-2 text-primary-foreground hover:bg-primary/90"
                >
                  {onEditingAccount ? "Update" : "Create"}
                </Button>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  variant="outline"
                  className="flex-1 rounded-lg bg-transparent py-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
