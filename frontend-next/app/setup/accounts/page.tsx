"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Shield } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Button, Card } from "@radix-ui/themes";
import { TopNavigation } from "../../../components/top-navigation";
import { useRouter } from "next/navigation";

interface Account {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user" | "viewer";
  status: "active" | "inactive";
}

const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "1",
    username: "John Doe",
    email: "john@warehouse.com",
    role: "admin",
    status: "active",
  },
  {
    id: "2",
    username: "Jane Smith",
    email: "jane@warehouse.com",
    role: "user",
    status: "active",
  },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "user" as const,
  });
  const router = useRouter();

  const handleAddAccount = () => {
    if (!formData.username.trim() || !formData.email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (editingId) {
      setAccounts(
        accounts.map((acc) =>
          acc.id === editingId
            ? {
                ...acc,
                username: formData.username,
                email: formData.email,
                role: formData.role,
              }
            : acc
        )
      );
      toast.success("Account updated successfully");
    } else {
      const newAccount: Account = {
        id: crypto.randomUUID(),
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: "active",
      };
      setAccounts([...accounts, newAccount]);
      toast.success("Account created successfully");
    }

    setFormData({ username: "", email: "", role: "user" });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEditAccount = (account: Account) => {
    setFormData({
      username: account.username,
      email: account.email,
      role: account.role,
    });
    setEditingId(account.id);
    setIsDialogOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(accounts.filter((acc) => acc.id !== id));
    toast.success("Account deleted successfully");
  };

  const handleOpenDialog = () => {
    setFormData({ username: "", email: "", role: "user" });
    setEditingId(null);
    setIsDialogOpen(true);
  };

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
              <span className="text-foreground font-medium">Warehouse</span>
            </div>
            <h1 className="text-3xl font-semibold text-foreground">
              Account Setup
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage accounts and permissions
            </p>
          </div>
          <Button
            onClick={handleOpenDialog}
            className="gap-2 rounded-lg bg-primary px-4 flex items-center  py-2 text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
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
                    key={account.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="px-6 py-4 text-sm text-foreground">
                      {account.username}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getRoleColor(account.role)}`}
                      >
                        <Shield className="h-3 w-3" />
                        {account.role.charAt(0).toUpperCase() +
                          account.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${account.status === "active" ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}`}
                      >
                        {account.status.charAt(0).toUpperCase() +
                          account.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAccount(account)}
                          className="gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                          className="gap-2 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
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
              {editingId ? "Edit Account" : "Add New Account"}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {editingId
                ? "Update account details"
                : "Create a new user account"}
            </Dialog.Description>

            <div className="mt-6 space-y-4">
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Username"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Email"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "admin" | "user" | "viewer",
                  })
                }
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="viewer">Viewer</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddAccount}
                  className="flex-1 rounded-lg bg-primary py-2 text-primary-foreground hover:bg-primary/90"
                >
                  {editingId ? "Update" : "Create"}
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
