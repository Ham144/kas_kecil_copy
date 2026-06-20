"use client";
import React from "react";
import { Lock, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      {/* Animated Icon */}
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl">
            <Lock className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full animate-bounce"></div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-red-300 rounded-full animate-pulse opacity-70"></div>
      </div>

      {/* Error Code */}
      <div className="text-center mb-6">
        <h1 className="text-8xl font-bold text-gray-800 mb-2">401</h1>
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full">
          <span className="font-semibold">UNAUTHORIZED</span>
        </div>
      </div>

      {/* Message */}
      <div className="text-center max-w-md mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Akses Dibatasi
        </h2>
        <p className="text-gray-600">
          Anda memerlukan otorisasi untuk mengakses halaman ini. Silakan login
          dengan akun yang memiliki hak akses yang sesuai.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Lock className="w-5 h-5" />
          Login Sekarang
        </Link>

        <div className="flex gap-2">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
          >
            <Home className="w-5 h-5" />
            Beranda
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
