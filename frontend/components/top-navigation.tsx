"use client";

import {
  LogOut,
  Warehouse,
  User,
  Home,
  Settings,
  ChevronDown,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "@radix-ui/themes";
import { useMutation } from "@tanstack/react-query";
import { AuthApi } from "@/api/auth";
import { useUserInfo } from "./UserContext";
import { Role } from "@/types/role.type";

export function TopNavigation() {
  const pathname = usePathname();
  const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false);
  const { userInfo, loadingUser } = useUserInfo();

  const { mutateAsync: handleLogout } = useMutation({
    mutationKey: ["logout"],
    mutationFn: AuthApi.logout,
    onSuccess: () => {
      redirect("/login");
    },
  });

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/admin", label: "Administrator", icon: Crown },
    { href: "/setup", label: "Setup", icon: Settings },
  ];

  if (loadingUser) {
    return (
      <div className="flex h-16 items-center justify-center border-b border-border bg-white">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    );
  }

  return (
    <nav className="sticky top-0 z-20 border-b border-blue-100/80 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3 max-md:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-md">
            <Warehouse className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">
              Warehouse Budgeting
            </h1>
            <p className="text-xs text-muted-foreground">Petty Cash CSI</p>
          </div>
        </div>

        <div className="flex gap-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  className={`flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition-all hover:shadow-sm ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="max-md:hidden">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <Popover.Root
              open={isUserPopoverOpen}
              onOpenChange={setIsUserPopoverOpen}
            >
              <Popover.Trigger asChild>
                <button className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2 transition-colors hover:bg-blue-50">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 text-sm font-medium text-gray-900">
                      <User className="h-3.5 w-3.5 text-primary" />
                      {userInfo?.username}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                      <Warehouse className="h-3 w-3" />
                      {userInfo?.warehouse?.name || "No warehouse"}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </Popover.Trigger>
              <Popover.Content
                className="w-64 rounded-xl border border-border bg-white p-4 shadow-xl"
                side="bottom"
                align="end"
              >
                <div className="space-y-3">
                  <div className="border-b border-border pb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      User Information
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Username</p>
                      <p className="text-sm font-medium">{userInfo?.username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Description
                      </p>
                      <p className="text-sm font-medium">
                        {userInfo?.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Office</p>
                      <p className="text-sm font-medium">
                        {userInfo?.warehouse?.name || "No warehouse"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Role</p>
                      <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {Role[userInfo?.role as keyof typeof Role]}
                      </span>
                    </div>
                  </div>
                </div>
              </Popover.Content>
            </Popover.Root>
          </div>
          <Button
            variant="ghost"
            className="flex items-center gap-2 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600"
            onClick={() => handleLogout()}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
