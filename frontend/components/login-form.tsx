"use client";

import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Lock, User, Warehouse } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { AuthApi } from "@/api/auth";
import { useUserInfo } from "./UserContext";

export function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const { userInfo, setUserInfo } = useUserInfo();
  if (userInfo) {
    const redirectCount: number =
      Number(localStorage.getItem("redirectCount")) || 1;
    if (Number(redirectCount) > 2) {
      localStorage.removeItem("redirectCount");
      setTimeout(() => {
        setUserInfo(null);
      }, 2000);
    }

    localStorage.setItem("redirectCount", (redirectCount + 1).toString());
    redirect("/");
  }

  const { mutateAsync: handleLogin, isPending: isLoading } = useMutation({
    mutationKey: ["login"],
    mutationFn: AuthApi.loginUserLdap,
    onSuccess: () => {
      localStorage.removeItem("redirectCount");
      window.location.reload();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(formData);
  };

  const inputClass =
    "w-full rounded-xl border border-input bg-white px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="relative mx-auto mb-4 h-28 w-28">
          <Image
            src="/csi-logo.png"
            alt="CSI Logo"
            className="object-contain"
            fill
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Petty Cash CSI</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Warehouse Budgeting System
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl shadow-blue-500/5">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <Warehouse className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Masuk ke Sistem</p>
              <p className="text-xs text-blue-100">
                Kredensial Active Directory perusahaan
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="h-4 w-4 text-primary" />
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="username AD"
              className={inputClass}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Lock className="h-4 w-4 text-primary" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={inputClass}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition-opacity"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Sistem Catatan Kas Petty Cash Gudang — CSI
      </p>
    </div>
  );
}
