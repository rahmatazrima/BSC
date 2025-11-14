"use client";

import React, { useEffect, useMemo, useState } from "react";
import NavbarCustomer from "@/components/NavbarCustomer";
import Image from "next/image";
import Link from "next/link";

type StatusService = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface HistoryOrder {
  serviceId: string;
  status: StatusService;
  tempat: string;
  tanggalPesan: string;
  createdAt: string;
  updatedAt: string;
  estimasiBiaya: number;
  handphone: {
    brand: string;
    tipe: string;
  };
  issue: {
    topikMasalah: string;
  } | null;
  waktu: {
    namaShift: string;
    jamMulai: string;
    jamSelesai: string;
  } | null;
}

const STATUS_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "in_progress", label: "Sedang Dikerjakan" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
] as const;

export default function HistoryPage() {
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<HistoryOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/service/getMyHistory", {
          credentials: "include",
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.message || "Gagal memuat riwayat pemesanan");
        }

        setOrders(json.content ?? []);
      } catch (err: unknown) {
        console.error("Fetch history error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat riwayat"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatCurrency = (value: number) =>
    value > 0 ? `Rp ${value.toLocaleString("id-ID")}` : "Belum tersedia";

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: StatusService | string) => {
    const normalized = status.toString().toLowerCase();
    switch (normalized) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusText = (status: StatusService | string) => {
    const normalized = status.toString().toLowerCase();
    switch (normalized) {
      case "pending":
        return "Menunggu";
      case "in_progress":
        return "Sedang dalam perbaikan";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const filteredOrders = useMemo(() => {
    if (filterStatus === "all") {
      return orders;
    }

    return orders.filter(
      (order) => order.status.toLowerCase() === filterStatus
    );
  }, [filterStatus, orders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      <NavbarCustomer />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading && (
          <div className="mb-6 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-gray-200">
            Memuat riwayat pemesanan...
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
            {error}
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filterStatus === filter.value
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredOrders.map((order) => (
            <div
              key={order.serviceId}
              className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md transition-all duration-300 hover:bg-white/15"
            >
              <div className="mb-6 flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10">
                  <span className="text-2xl">📱</span>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-bold text-white">
                    {order.handphone.brand} {order.handphone.tipe}
                  </h3>
                  <span
                    className={`border px-3 py-1 text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              <div className="mb-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Uraian Masalah:</span>
                  <span className="text-right text-white">
                    {order.issue?.topikMasalah ?? "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shift:</span>
                  <span className="text-right text-white">
                    {order.waktu
                      ? `${order.waktu.namaShift} (${order.waktu.jamMulai} - ${order.waktu.jamSelesai})`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lokasi:</span>
                  <span className="text-right text-sm text-white">
                    {order.tempat}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimasi Biaya:</span>
                  <span className="text-right text-white font-bold">
                    {formatCurrency(order.estimasiBiaya)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dibuat:</span>
                  <span className="text-right text-sm text-white">
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                {order.status === "IN_PROGRESS" && (
                  <Link
                    href={`/tracking?order=${order.serviceId}`}
                    className="flex-1 rounded-xl bg-blue-600 py-3 text-center font-medium text-white transition-all duration-300 hover:bg-blue-700"
                  >
                    Pantau Tindakan Mekanik
                  </Link>
                )}
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="rounded-xl bg-white/10 px-6 py-3 text-white transition-all duration-300 hover:bg-white/20"
                >
                  Detail
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && !loading && !error && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">
              Tidak Ada Riwayat
            </h3>
            <p className="mb-6 text-gray-400">
              Anda belum memiliki riwayat pemesanan untuk filter ini
            </p>
            <Link
              href="/booking"
              className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 font-medium text-white transition-all duration-300 hover:from-blue-700 hover:to-cyan-700"
            >
              Buat Pesanan Baru
            </Link>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-gray-900/95 p-8 backdrop-blur-md">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Detail Pesanan</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-400 transition-colors hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-gray-400">ID Pesanan:</span>
                <span className="ml-2 font-mono text-blue-400">
                  {selectedOrder.serviceId}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Perangkat:</span>
                <span className="ml-2 text-white">
                  {selectedOrder.handphone.brand} {selectedOrder.handphone.tipe}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Masalah:</span>
                <span className="ml-2 text-white">
                  {selectedOrder.issue?.topikMasalah ?? "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <span
                  className={`ml-2 rounded px-2 py-1 text-xs ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Tanggal Dibuat:</span>
                <span className="ml-2 text-white">
                  {formatDateTime(selectedOrder.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Terakhir Diperbarui:</span>
                <span className="ml-2 text-white">
                  {formatDateTime(selectedOrder.updatedAt)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Lokasi:</span>
                <span className="ml-2 text-white">{selectedOrder.tempat}</span>
              </div>
              <div>
                <span className="text-gray-400">Shift:</span>
                <span className="ml-2 text-white">
                  {selectedOrder.waktu
                    ? `${selectedOrder.waktu.namaShift} (${selectedOrder.waktu.jamMulai} - ${selectedOrder.waktu.jamSelesai})`
                    : "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Estimasi Biaya:</span>
                <span className="ml-2 text-white font-medium">
                  {formatCurrency(selectedOrder.estimasiBiaya)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}