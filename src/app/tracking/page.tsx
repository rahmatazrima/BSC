"use client";

import React, { useEffect, useMemo, useState } from "react";
import NavbarCustomer from "@/components/NavbarCustomer";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type StatusService = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface TrackingStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  timestamp?: string;
}

interface TrackingEntry {
  serviceId: string;
  status: StatusService;
  tempat: string;
  alamat: string | null; // Alamat lengkap pelanggan (opsional)
  tanggalPesan: string;
  createdAt: string;
  updatedAt: string;
  handphone: {
    brand: string;
    tipe: string;
  };
  // Array semua kendala yang dipilih user untuk service ini
  issues: {
    id: string;
    topikMasalah: string;
  }[];
  waktu: {
    namaShift: string;
    jamMulai: string;
    jamSelesai: string;
  } | null;
  steps: TrackingStep[];
}

const statusBadge = (status: StatusService) => {
  switch (status) {
    case "PENDING":
      return {
        className:
          "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        label: "Sedang dalam antrian",
      };
    case "IN_PROGRESS":
      return {
        className: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        label: "Sedang dalam perbaikan",
      };
    case "COMPLETED":
      return {
        className: "bg-green-500/20 text-green-400 border border-green-500/30",
        label: "Selesai",
      };
    case "CANCELLED":
      return {
        className: "bg-red-500/20 text-red-400 border border-red-500/30",
        label: "Dibatalkan",
      };
    default:
      return {
        className: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
        label: status,
      };
  }
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateShort = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatOrderLabel = (entry: TrackingEntry) => {
  const deviceName = `${entry.handphone.brand} ${entry.handphone.tipe}`;
  const statusInfo = statusBadge(entry.status);
  return `${deviceName} - ${statusInfo.label}`;
};

export default function TrackingPage() {
  const searchParams = useSearchParams();
  const requestedOrder = searchParams?.get("order");

  const [entries, setEntries] = useState<TrackingEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/service/getMyTracking", {
          credentials: "include",
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.message || "Gagal memuat data tracking");
        }

        const items: TrackingEntry[] = json.content ?? [];
        setEntries(items);

        if (items.length === 0) {
          setSelectedId(null);
          return;
        }

        if (requestedOrder && items.some((item) => item.serviceId === requestedOrder)) {
          setSelectedId(requestedOrder);
        } else {
          setSelectedId(items[0].serviceId);
        }
      } catch (err: unknown) {
        console.error("Fetch tracking error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat tracking"
        );
        setEntries([]);
        setSelectedId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.serviceId === selectedId) ?? null,
    [entries, selectedId]
  );

  const currentStepIndex = useMemo(() => {
    if (!selectedEntry) return 0;
    const index = selectedEntry.steps.findIndex((step) => !step.completed);
    return index === -1 ? selectedEntry.steps.length - 1 : index;
  }, [selectedEntry]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      <NavbarCustomer />

      <div className="mx-auto max-w-4xl px-6 py-8">
        {loading && (
          <div className="mb-6 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-gray-200">
            Memuat data tracking...
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
            {error}
          </div>
        )}

        {entries.length > 0 && selectedEntry ? (
          <>
            <div className="mb-8">
              <label className="mb-3 block text-sm font-medium text-gray-300">
                Pilih Pesanan untuk Dilacak
              </label>
              <select
                value={selectedEntry.serviceId}
                onChange={(event) => setSelectedId(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none transition-all backdrop-blur-sm focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              >
                {entries.map((entry) => (
                  <option key={entry.serviceId} value={entry.serviceId} className="bg-gray-800 text-white">
                    {formatOrderLabel(entry)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
              <div className="flex items-center space-x-6">
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <Image
                    src="/galaksi.png"
                    alt="Device"
                    width={80}
                    height={80}
                    className="opacity-70"
                    unoptimized={true}
                  />
                </div>

                <div className="flex-1">
                  <h2 className="mb-2 text-2xl font-bold text-white">
                    {selectedEntry.handphone.brand} {selectedEntry.handphone.tipe}
                  </h2>
                  <div className="mb-4 flex items-center space-x-3">
                    <span className="text-lg text-blue-400">🔧</span>
                    <span
                      className={`border px-3 py-1 text-sm font-medium ${statusBadge(selectedEntry.status).className}`}
                    >
                      {statusBadge(selectedEntry.status).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-1 text-sm text-gray-400">Uraian Masalah</h4>
                    {selectedEntry.issues && selectedEntry.issues.length > 0 ? (
                      <div className="space-y-2">
                        {selectedEntry.issues.map((issue, index) => (
                          <p key={issue.id} className="font-medium text-white">
                            {index + 1}. {issue.topikMasalah}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="font-medium text-white">-</p>
                    )}
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm text-gray-400">Shift</h4>
                    <p className="text-white">
                      {selectedEntry.waktu
                        ? `${selectedEntry.waktu.namaShift} (${selectedEntry.waktu.jamMulai} - ${selectedEntry.waktu.jamSelesai})`
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-1 text-sm text-gray-400">Waktu Pemesanan</h4>
                    <p className="text-white">{formatDate(selectedEntry.tanggalPesan)}</p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm text-gray-400">Lokasi Layanan</h4>
                    <p className="text-white">{selectedEntry.tempat}</p>
                    {selectedEntry.alamat && (
                      <>
                        <h4 className="mb-1 text-sm text-gray-400 mt-3">Alamat Lengkap</h4>
                        <p className="text-white break-words">{selectedEntry.alamat}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
              <h3 className="mb-8 text-xl font-bold text-white">Status Pengerjaan</h3>

              <div className="space-y-8">
                {selectedEntry.steps.map((step, index) => {
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div key={step.id} className="flex items-start space-x-6">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                            step.completed
                              ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                              : isCurrent
                              ? "border-blue-500 bg-blue-500/20 text-blue-400 animate-pulse"
                              : "border-gray-600 bg-gray-700 text-gray-400"
                          }`}
                        >
                          {step.completed ? (
                            <span className="text-lg">✓</span>
                          ) : isCurrent ? (
                            <div className="h-3 w-3 rounded-full bg-blue-400 animate-pulse" />
                          ) : (
                            <span className="text-sm font-bold">{step.id}</span>
                          )}
                        </div>

                        {index < selectedEntry.steps.length - 1 && (
                          <div
                            className={`mt-4 h-16 w-0.5 transition-colors duration-300 ${
                              step.completed ? "bg-blue-600" : "bg-gray-700"
                            }`}
                          />
                        )}
                      </div>

                      <div className="flex-1 pb-8">
                        <div className="mb-2 flex items-center justify-between">
                          <h4
                            className={`text-lg font-semibold ${
                              step.completed
                                ? "text-white"
                                : isCurrent
                                ? "text-blue-400"
                                : "text-gray-400"
                            }`}
                          >
                            {step.title}
                          </h4>
                          {step.timestamp && (
                            <span className="text-sm text-gray-400">
                              {formatDateTime(step.timestamp)}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            step.completed
                              ? "text-gray-300"
                              : isCurrent
                              ? "text-gray-300"
                              : "text-gray-500"
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/history"
                className="flex-1 rounded-xl bg-white/10 px-6 py-4 text-center font-medium text-white transition-all duration-300 hover:bg-white/20"
              >
                Lihat Riwayat Lengkap
              </Link>
              <div className="flex-1 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-center text-sm text-gray-300">
                Terakhir diperbarui: {formatDateTime(selectedEntry.updatedAt)}
              </div>
            </div>
          </>
        ) : (
          !loading &&
          !error && (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center text-gray-300">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                <span className="text-3xl">📱</span>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-white">
                Belum ada pesanan yang bisa dilacak
              </h2>
              <p className="mb-6 max-w-md text-gray-400">
                Setelah Anda membuat pemesanan dan terjadwal, status perjalanannya akan muncul di halaman ini.
              </p>
              <Link
                href="/booking"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:from-blue-700 hover:to-cyan-700"
              >
                Buat Pesanan Baru
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}