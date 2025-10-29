"use client";

import type React from "react";

import { useState } from "react";
import { toast } from "sonner";
import * as Form from "@radix-ui/react-form";
import Image from "next/image";
import { Lock, User } from "lucide-react";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "yafizham",
    password: "Catur2025!",
  });

  console.log("aw")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("Mohon isi semua field");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      window.location.href = "/";

      toast.success("Login berhasil!");

      // TODO: Redirect to dashboard after successful login
    } catch (error) {
      console.log(error);
      toast.error("Login gagal. Silakan coba lagi.");
      console.error("[v0] Login error:", error);
    } finally {
      setIsLoading(false);
    }
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
          />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
        <Form.Root onSubmit={handleSubmit} className="space-y-6">
          {/* Helper Text */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              masukkan kredensial Active Directory anda
            </p>
          </div>

          {/* Username Field */}
          <Form.Field name="username" className="space-y-2">
            <Form.Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Username
            </Form.Label>
            <Form.Control asChild>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="ham"
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
                disabled={isLoading}
              />
            </Form.Control>
          </Form.Field>

          {/* Password Field */}
          <Form.Field name="password" className="space-y-2">
            <Form.Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              Password
            </Form.Label>
            <Form.Control asChild>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
                disabled={isLoading}
              />
            </Form.Control>
          </Form.Field>

          {/* Submit Button */}
          <Form.Submit asChild>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </Form.Submit>
        </Form.Root>
      </div>

      {/* Footer Text */}
      <div className="text-center text-xs text-muted-foreground">
        <p>Sistem Catatan Kas Petty Cash Gudang</p>
      </div>
    </div>
  );
}
