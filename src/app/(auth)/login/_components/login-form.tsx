"use client";

import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { schema, TLoginRequest } from "./data/type";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<TLoginRequest>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (value) => {
    try {
      setIsLoading(true);
      setError(""); // Clear previous errors

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(value),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error statuses
        if (response.status === 401) {
          setError("Email atau kata sandi salah. Silakan coba lagi.");
        } else if (response.status === 400) {
          setError(data.message || "Data yang dimasukkan tidak valid.");
        } else if (response.status === 500) {
          setError("Terjadi kesalahan server. Silakan coba lagi nanti.");
        } else {
          setError(data.message || "Login gagal. Silakan coba lagi.");
        }
        setIsLoading(false);
        return;
      }

      // Success - redirect
      const redirectUrl = data.data?.redirectUrl || "/";
      typeof window !== "undefined" && window.location.replace(redirectUrl);
    } catch (error) {
      console.error("Login error:", error);
      setError("Kesalahan jaringan. Periksa koneksi internet Anda.");
      setIsLoading(false);
    }
  });

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
      </div>
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur-lg opacity-30"></div>
              <Image
                src="/logoo.png"
                alt="Bukhari Service Center"
                width={80}
                height={80}
                className="relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Bukhari Service Center
          </h1>
          <p className="text-gray-400 mt-2">Masuk ke akun Anda</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 animate-shake">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Glass morphism form */}
        <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>

          <div className="relative z-10">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Email */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-300 text-sm font-medium">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        {...field}
                        type="email"
                        placeholder="Masukkan email Anda"
                        className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm"
                        required
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                      {error && (
                        <div className="text-red-400 text-sm mt-1">
                          {error.message}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-300 text-sm font-medium">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <input
                        {...field}
                        type="password"
                        placeholder="Masukkan kata sandi Anda"
                        className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm"
                        required
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                      {error && (
                        <div className="text-red-400 text-sm mt-1">
                          {error.message}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              />

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/20 bg-white/10 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-300">
                    Ingat saya
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Lupa Kata Sandi?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="relative z-10">
                  {isLoading ? "Sedang Masuk..." : "Masuk"}
                </span>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-gray-400 text-sm">atau</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Sign Up link */}
            <div className="text-center">
              <p className="text-gray-400">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Daftar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
