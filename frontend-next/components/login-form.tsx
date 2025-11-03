"use client";

import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Lock, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { AuthApi } from "@/api/auth";
import { useUserInfo } from "./UserContext";

export function LoginForm() {
  const [formData, setFormData] = useState({
    username: "yafizham",
    password: "Catur2025!",
  });
  const { userInfo } = useUserInfo();

  if (userInfo) {
    redirect("/");
  }

  const { mutateAsync: handleLogin, isPending: isLoading } = useMutation({
    mutationKey: ["login"],
    mutationFn: AuthApi.loginUserLdap,
    onSuccess: (data) => {
      window.location.reload();
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Gagal login. Periksa kembali username dan password Anda.";
      toast.error(errorMessage);
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

  return (
    <div className="space-y-8">
      {/* Logo */}
      <div className="flex justify-center">
        <div className="relative w-32 h-32">
          <Image
            src="/csi-logo.png"
            alt="Logo"
            className="object-contain"
            fill
            priority
          />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Helper Text */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              masukkan kredensial Active Directory anda
            </p>
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="ham"
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>

      {/* Footer Text */}
      <div className="text-center text-xs text-muted-foreground">
        <p>Sistem Catatan Kas Petty Cash Gudang</p>
      </div>
    </div>
  );
}
