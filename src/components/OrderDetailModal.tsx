"use client";

import React, { useEffect, useState } from 'react';
import { XMarkIcon, DevicePhoneMobileIcon, ClockIcon, CurrencyDollarIcon } from './icons';

interface KendalaHandphone {
  id: string;
  topikMasalah: string;
  pergantianBarang: Array<{
    id: string;
    namaBarang: string;
    harga: number;
  }>;
}

interface ServiceDetail {
  id: string;
  statusService: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  tempat: string;
  alamat: string | null;
  tanggalPesan: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  handphone: {
    id: string;
    brand: string;
    tipe: string;
  };
  waktu: {
    id: string;
    namaShift: string;
    jamMulai: string;
    jamSelesai: string;
  } | null;
  kendalaHandphone: KendalaHandphone[];
  serviceDetails?: {
    problems: Array<{
      id: string;
      topikMasalah: string;
      pergantianBarang: Array<{
        id: string;
        namaBarang: string;
        harga: number;
      }>;
    }>;
    totalPrice: number;
    deviceInfo: string;
    serviceLocation: string;
  };
}

interface OrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: () => void;
}

const SERVICE_FEE = 50000;

export default function OrderDetailModal({ 
  orderId, 
  isOpen, 
  onClose,
  onStatusUpdate 
}: OrderDetailModalProps) {
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchServiceDetail();
    } else {
      setService(null);
      setError("");
    }
  }, [isOpen, orderId]);

  const fetchServiceDetail = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/service/${orderId}`, {
        credentials: "include",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Gagal memuat detail pesanan");
      }

      if (json.status && json.content) {
        setService(json.content);
      }
    } catch (err: unknown) {
      console.error("Fetch service detail error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat detail pesanan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: ServiceDetail['statusService']) => {
    if (!orderId) return;

    try {
      setUpdatingStatus(true);
      const response = await fetch(`/api/service/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          statusService: newStatus,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Gagal mengupdate status");
      }

      // Refresh data
      await fetchServiceDetail();
      
      // Notify parent component
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (err: unknown) {
      console.error("Update status error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Gagal mengupdate status pesanan"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Menunggu';
      case 'IN_PROGRESS': return 'Sedang Dikerjakan';
      case 'COMPLETED': return 'Selesai';
      case 'CANCELLED': return 'Dibatalkan';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalPrice = () => {
    if (!service) {
      return SERVICE_FEE;
    }
    
    // Try to use serviceDetails first if available
    if (service.serviceDetails && service.serviceDetails.totalPrice !== undefined) {
      return service.serviceDetails.totalPrice + SERVICE_FEE;
    }
    
    // Fallback: calculate from kendalaHandphone
    if (service.kendalaHandphone && service.kendalaHandphone.length > 0) {
      const total = service.kendalaHandphone.reduce((sum, kendala) => {
        const kendalaPrice = kendala.pergantianBarang?.reduce(
          (itemSum, item) => itemSum + item.harga,
          0
        ) ?? 0;
        return sum + kendalaPrice;
      }, 0);
      return total + SERVICE_FEE;
    }
    
    return SERVICE_FEE;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 via-blue-900 to-black rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/5">
          <div>
            <h2 className="text-2xl font-bold text-white">Detail Pesanan</h2>
            {service && (
              <p className="text-sm text-gray-400 mt-1">
                ID: {service.id.slice(0, 8)}...
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Tutup"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              <p className="text-gray-400 mt-4">Memuat detail pesanan...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
              <button
                onClick={fetchServiceDetail}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : service ? (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(service.statusService)}`}>
                  {getStatusText(service.statusService)}
                </span>
                <select
                  value={service.statusService}
                  onChange={(e) => handleStatusUpdate(e.target.value as ServiceDetail['statusService'])}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:border-blue-500/50 outline-none hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  <option value="PENDING" className="bg-gray-800">Menunggu</option>
                  <option value="IN_PROGRESS" className="bg-gray-800">Sedang Dikerjakan</option>
                  <option value="COMPLETED" className="bg-gray-800">Selesai</option>
                  <option value="CANCELLED" className="bg-gray-800">Dibatalkan</option>
                </select>
              </div>

              {/* Informasi Perangkat */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <DevicePhoneMobileIcon className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Informasi Perangkat</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Merek</p>
                    <p className="text-white font-medium">{service.handphone.brand}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Tipe</p>
                    <p className="text-white font-medium">{service.handphone.tipe}</p>
                  </div>
                </div>
              </div>

              {/* Informasi Pelanggan */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Informasi Pelanggan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Nama</p>
                    <p className="text-white font-medium">{service.user.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Email</p>
                    <p className="text-white font-medium">{service.user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Telepon</p>
                    <p className="text-white font-medium">{service.user.phoneNumber}</p>
                  </div>
                  {service.alamat && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Alamat</p>
                      <p className="text-white font-medium">{service.alamat}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Jadwal */}
              {service.waktu && (
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <ClockIcon className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">Jadwal</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Tanggal</p>
                      <p className="text-white font-medium">{formatDate(service.tanggalPesan)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Shift</p>
                      <p className="text-white font-medium">
                        {service.waktu.namaShift} ({service.waktu.jamMulai} - {service.waktu.jamSelesai})
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Tempat</p>
                      <p className="text-white font-medium">{service.tempat}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Uraian Masalah & Sparepart */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Uraian Masalah & Sparepart</h3>
                {service.kendalaHandphone && service.kendalaHandphone.length > 0 ? (
                  <div className="space-y-4">
                    {service.kendalaHandphone.map((kendala, index) => {
                      const kendalaPrice = kendala.pergantianBarang?.reduce(
                        (sum, item) => sum + item.harga,
                        0
                      ) ?? 0;
                      
                      return (
                        <div
                          key={kendala.id}
                          className="bg-white/5 rounded-lg p-4 border border-blue-500/30"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="font-semibold text-white mb-2">
                                {index + 1}. {kendala.topikMasalah}
                              </p>
                              {kendala.pergantianBarang && kendala.pergantianBarang.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {kendala.pergantianBarang.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                      <span className="text-gray-300">• {item.namaBarang}</span>
                                      <span className="text-blue-400 font-medium">
                                        Rp {item.harga.toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xs text-gray-400 mb-1">Subtotal</p>
                              <p className="text-lg font-bold text-blue-400">
                                Rp {kendalaPrice.toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400">Tidak ada uraian masalah</p>
                )}
              </div>

              {/* Ringkasan Harga */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Ringkasan Harga</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal Sparepart</span>
                    <span>
                      Rp {
                        service.serviceDetails?.totalPrice 
                          ? service.serviceDetails.totalPrice.toLocaleString('id-ID')
                          : service.kendalaHandphone && service.kendalaHandphone.length > 0
                          ? service.kendalaHandphone.reduce((sum, kendala) => {
                              const kendalaPrice = kendala.pergantianBarang?.reduce(
                                (itemSum, item) => itemSum + item.harga,
                                0
                              ) ?? 0;
                              return sum + kendalaPrice;
                            }, 0).toLocaleString('id-ID')
                          : '0'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Biaya Service</span>
                    <span>Rp {SERVICE_FEE.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="border-t border-white/20 pt-3 flex justify-between">
                    <span className="text-white font-bold text-lg">Total</span>
                    <span className="text-green-400 font-bold text-lg">
                      Rp {calculateTotalPrice().toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 bg-white/5 flex items-center justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

