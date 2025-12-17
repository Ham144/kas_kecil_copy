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
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <nav className="border-b border-border bg-card shadow-sm sticky top-0 z-20">
      <div className="mx-auto flex max-w-7xl  items-center justify-between px-4 py-4 md:px-6">
        {/* Logo/Title */}
        <div className="flex items-center gap-3 max-md:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Warehouse className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Warehouse Budgeting
            </h1>
            <p className="text-xs text-muted-foreground">
              Petty Cash Management
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname.startsWith(item.href) && item.href !== "/";
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  className={`flex  items-center gap-2 rounded-lg border border-transparent px-4 py-2 text-sm font-medium hover:shadow-md ${
                    isActive ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="max-md:hidden">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Popover.Root
              open={isUserPopoverOpen}
              onOpenChange={setIsUserPopoverOpen}
            >
              <Popover.Trigger asChild>
                <button className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-right transition-colors hover:bg-muted">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <User className="h-4 w-4" />
                      {userInfo?.username}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Warehouse className="h-3 w-3" />
                      {userInfo?.warehouse?.name || "No warehouse"}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </Popover.Trigger>
              <Popover.Content
                className="w-64 rounded-lg border border-border bg-card p-4 shadow-lg"
                side="bottom"
                align="end"
              >
                <div className="space-y-3">
                  <div className="border-b border-border pb-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      User Information
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Username</p>
                      <p className="text-sm font-medium text-foreground">
                        {userInfo?.username}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Description
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {userInfo?.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Office</p>
                      <p className="text-sm font-medium text-foreground">
                        {userInfo?.warehouse?.name || "No warehouse"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Role</p>
                      <p className="text-sm font-medium text-foreground">
                        {Role[userInfo?.role]}
                      </p>
                    </div>
                  </div>
                </div>
              </Popover.Content>
            </Popover.Root>
          </div>
          <Button
            variant="ghost"
            className="gap-2 flex items-center"
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
