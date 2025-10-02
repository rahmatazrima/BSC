"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Types
interface HistoryOrder {
  id: string;
  device: string;
  problem: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  serviceType: string;
  scheduledDate: string;
  price: number;
  completedDate?: string;
  rating?: number;
  review?: string;
  createdAt: string;
}

// Dummy Data for History
const historyOrders: HistoryOrder[] = [
  {
    id: "ORD-001",
    device: "Samsung Galaxy S25 Ultra",
    problem: "Ganti Baterai",
    status: "completed",
    serviceType: "On-Site Service : Warkop Plut Kupie, Lampineung",
    scheduledDate: "24 Februari 2025 pukul 00:43",
    price: 75000,
    completedDate: "25 Februari 2025",
    rating: 5,
    review: "Pelayanan sangat memuaskan, teknisi datang tepat waktu",
    createdAt: "2025-02-23"
  },
  {
    id: "ORD-002",
    device: "iPhone 14 Pro",
    problem: "Layar Depan Retak", 
    status: "in-progress",
    serviceType: "Datang ke Bukhari Service Center",
    scheduledDate: "28 Februari 2025 pukul 10:00",
    price: 150000,
    createdAt: "2025-02-27"
  },
  {
    id: "ORD-003",
    device: "Xiaomi Redmi Note 12",
    problem: "Install Ulang",
    status: "completed",
    serviceType: "Datang ke Bukhari Service Center",
    scheduledDate: "20 Februari 2025 pukul 14:00",
    price: 75000,
    completedDate: "20 Februari 2025",
    rating: 4,
    review: "Bagus, cepat selesai",
    createdAt: "2025-02-19"
  },
  {
    id: "ORD-004",
    device: "Samsung Galaxy A54",
    problem: "Speaker atau Mikrofon Bermasalah",
    status: "pending",
    serviceType: "On-Site Service : Jl. Teuku Umar No. 123",
    scheduledDate: "2 Maret 2025 pukul 09:00",
    price: 125000,
    createdAt: "2025-03-01"
  }
];

export default function HistoryPage() {
  const [orders] = useState<HistoryOrder[]>(historyOrders);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<HistoryOrder | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'in-progress': return 'Sedang dalam perbaikan';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Bukhari Service Center"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h1 className="font-bold text-xl text-white">Riwayat Pemesanan</h1>
              <p className="text-sm text-gray-300">Bukhari Service Center</p>
            </div>
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {[
              { value: 'all', label: 'Semua' },
              { value: 'pending', label: 'Menunggu' },
              { value: 'in-progress', label: 'Sedang Dikerjakan' },
              { value: 'completed', label: 'Selesai' },
              { value: 'cancelled', label: 'Dibatalkan' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filterStatus === filter.value
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              {/* Device Info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{order.device}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Uraian Masalah:</span>
                  <span className="text-white font-medium">{order.problem}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Waktu Dijadwalkan:</span>
                  <span className="text-white">{order.scheduledDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Layanan Service:</span>
                  <span className="text-white text-right text-sm">{order.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Harga:</span>
                  <span className="text-white font-bold">Rp {order.price.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Rating & Review for completed orders */}
              {order.status === 'completed' && order.rating && (
                <div className="border-t border-white/10 pt-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-gray-400">Ulasan saya:</span>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < order.rating! ? 'text-yellow-400' : 'text-gray-600'}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  {order.review && (
                    <p className="text-gray-300 text-sm italic">"{order.review}"</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {order.status === 'in-progress' && (
                  <Link
                    href={`/tracking?order=${order.id}`}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium text-center hover:bg-blue-700 transition-all duration-300"
                  >
                    Pantau Tindakan Mekanik
                  </Link>
                )}
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  Detail
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Tidak Ada Riwayat</h3>
            <p className="text-gray-400 mb-6">Anda belum memiliki riwayat pemesanan untuk filter ini</p>
            <Link
              href="/booking"
              className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
            >
              Buat Pesanan Baru
            </Link>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Detail Pesanan</h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-gray-400">ID Pesanan:</span>
                <span className="text-blue-400 font-mono ml-2">{selectedOrder.id}</span>
              </div>
              <div>
                <span className="text-gray-400">Perangkat:</span>
                <span className="text-white ml-2">{selectedOrder.device}</span>
              </div>
              <div>
                <span className="text-gray-400">Masalah:</span>
                <span className="text-white ml-2">{selectedOrder.problem}</span>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Tanggal Dibuat:</span>
                <span className="text-white ml-2">{new Date(selectedOrder.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
              {selectedOrder.completedDate && (
                <div>
                  <span className="text-gray-400">Tanggal Selesai:</span>
                  <span className="text-white ml-2">{new Date(selectedOrder.completedDate).toLocaleDateString('id-ID')}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}