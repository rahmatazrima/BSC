"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Nama harus diisi";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Nama minimal 3 karakter";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email harus diisi";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Phone validation
    const sanitizedPhone = formData.phoneNumber.replace(/\D/g, "");
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Nomor telepon harus diisi";
    } else if (!phoneRegex.test(sanitizedPhone)) {
      newErrors.phoneNumber = "Nomor telepon harus 10-15 digit";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Kata sandi harus diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Kata sandi minimal 6 karakter";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi kata sandi Anda";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Kata sandi tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setError("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber.replace(/\D/g, ""),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // Handle different error statuses
        if (res.status === 400) {
          // Bad request - validation error atau email sudah terdaftar
          if (json.message?.toLowerCase().includes('email')) {
            setError("Email sudah terdaftar. Silakan gunakan email lain atau login.");
          } else {
            setError(json.message || "Data yang dimasukkan tidak valid.");
          }
        } else if (res.status === 409) {
          // Conflict - duplicate entry
          setError("Email atau nomor telepon sudah terdaftar.");
        } else if (res.status === 500) {
          setError("Terjadi kesalahan server. Silakan coba lagi nanti.");
        } else {
          setError(json.message || "Pendaftaran gagal. Silakan coba lagi.");
        }
        setLoading(false);
        return;
      }

      console.log("Registration successful!");
      console.log("User:", json.data?.user?.name);
      console.log("Redirecting to:", json.data?.redirectUrl);

      // Redirect berdasarkan role (default: / untuk USER)
      const redirectUrl = json.data?.redirectUrl || "/";
      router.push(redirectUrl);
      router.refresh();
    } catch (err) {
      console.error("Registration error:", err);
      setError("Kesalahan jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="group cursor-pointer">
            <div className="relative h-20 w-20 transition-transform duration-300 group-hover:scale-110">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <Image
                src="/logoo.png"
                alt="Logo"
                fill
                className="object-contain relative z-10"
                priority
                unoptimized={true}
              />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white">Buat Akun</h1>
          <p className="text-sm text-gray-400">
            Bergabunglah dengan kami dan mulai kelola perbaikan Anda
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 animate-shake">
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
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none"></div>
          {/* Register Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-300"
              >
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap Anda"
                disabled={loading}
                className={`rounded-lg border ${
                  errors.name ? "border-red-500/50" : "border-white/10"
                } bg-white/5 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-xl transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50`}
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300"
              >
                Email 
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                disabled={loading}
                className={`rounded-lg border ${
                  errors.email ? "border-red-500/50" : "border-white/10"
                } bg-white/5 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-xl transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50`}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="phoneNumber"
                className="text-sm font-medium text-gray-300"
              >
                Nomor Telepon
              </label>
              <input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="081234567890"
                disabled={loading}
                className={`rounded-lg border ${
                  errors.phoneNumber ? "border-red-500/50" : "border-white/10"
                } bg-white/5 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-xl transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50`}
              />
              {errors.phoneNumber && (
                <p className="text-xs text-red-400">{errors.phoneNumber}</p>
              )}
              <p className="text-xs text-gray-500">
                10-15 digit, hanya angka
              </p>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300"
              >
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className={`rounded-lg border ${
                  errors.password ? "border-red-500/50" : "border-white/10"
                } bg-white/5 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-xl transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50`}
              />
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500">Minimal 6 karakter</p>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-300"
              >
                Konfirmasi Kata Sandi
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className={`rounded-lg border ${
                  errors.confirmPassword
                    ? "border-red-500/50"
                    : "border-white/10"
                } bg-white/5 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-xl transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <svg
                    className="mr-2 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Membuat Akun...
                </>
              ) : (
                "Buat Akun"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-4 flex-shrink text-sm text-gray-400">atau</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Sign in link */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-400 transition-colors hover:text-blue-300 hover:underline"
              >
                Masuk
              </Link>
            </p>
          </div>


        </div>
      </div>
    </div>
  );
}
