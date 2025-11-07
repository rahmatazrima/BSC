"use client";

import React, { useState, useEffect } from 'react';
import NavbarCustomer from '@/components/NavbarCustomer';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Types
interface TrackingData {
  orderId: string;
  device: string;
  problem: string;
  status: 'pending' | 'in-progress' | 'completed';
  currentStep: number;
  steps: {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    timestamp?: string;
  }[];
  scheduledDate: string;
  serviceType: string;
  estimatedCompletion: string;
  technician?: {
    name: string;
    phone: string;
  };
}

// Dummy tracking data
const trackingData: { [key: string]: TrackingData } = {
  "ORD-001": {
    orderId: "ORD-001",
    device: "Samsung Galaxy S25 Ultra",
    problem: "Ganti Baterai", 
    status: "in-progress",
    currentStep: 2,
    scheduledDate: "24 Februari 2025 pukul 00:43",
    serviceType: "On-Site Service : Warkop Plut Kupie, Lampineung",
    estimatedCompletion: "24 Februari 2025 - 16:00",
    technician: {
      name: "Ahmad Teknisi",
      phone: "+62 822 1234 5678"
    },
    steps: [
      {
        id: 1,
        title: "Belum dikerjakan",
        description: "Pesanan Anda sedang dalam antrian",
        completed: true,
        timestamp: "24 Feb 2025 - 00:45"
      },
      {
        id: 2, 
        title: "Sedang dikerjakan",
        description: "Teknisi sedang mengerjakan perbaikan perangkat Anda",
        completed: true,
        timestamp: "24 Feb 2025 - 09:30"
      },
      {
        id: 3,
        title: "Selesai",
        description: "Perbaikan selesai dan perangkat siap digunakan",
        completed: false
      }
    ]
  },
  "ORD-002": {
    orderId: "ORD-002",
    device: "iPhone 14 Pro",
    problem: "Ganti LCD",
    status: "pending",
    currentStep: 1,
    scheduledDate: "28 Februari 2025 pukul 10:00",
    serviceType: "Datang ke Bukhari Service Center",
    estimatedCompletion: "28 Februari 2025 - 15:00",
    steps: [
      {
        id: 1,
        title: "Belum dikerjakan",
        description: "Pesanan Anda sedang dalam antrian",
        completed: true,
        timestamp: "27 Feb 2025 - 14:20"
      },
      {
        id: 2,
        title: "Sedang dikerjakan", 
        description: "Teknisi sedang mengerjakan perbaikan perangkat Anda",
        completed: false
      },
      {
        id: 3,
        title: "Selesai",
        description: "Perbaikan selesai dan perangkat siap digunakan",
        completed: false
      }
    ]
  }
};

export default function TrackingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('order') || 'ORD-001';
  const [data, setData] = useState<TrackingData | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState(orderId);

  useEffect(() => {
    const orderData = trackingData[selectedOrderId];
    if (orderData) {
      setData(orderData);
    }
  }, [selectedOrderId]);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📱</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-gray-400 mb-6">ID pesanan tidak valid atau tidak ditemukan</p>
          <Link href="/history" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Kembali ke Riwayat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      {/* Header */}
      <NavbarCustomer />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Order Selector */}
        <div className="mb-8">
          <label className="block text-gray-300 text-sm font-medium mb-3">Pilih Pesanan untuk Dilacak:</label>
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm"
          >
            {Object.keys(trackingData).map((id) => (
              <option key={id} value={id} className="bg-gray-800">
                {id} - {trackingData[id].device}
              </option>
            ))}
          </select>
        </div>

        {/* Device Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-6">
            {/* Device Image */}
            <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Image
                src="/galaksi.png"
                alt="Device"
                width={80}
                height={80}
                className="opacity-70"
              />
            </div>
            
            {/* Device Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{data.device}</h2>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-blue-400 text-lg">🔧</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  data.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                  {data.status === 'pending' ? 'Sedang dalam antrian' :
                   data.status === 'in-progress' ? 'Sedang dalam perbaikan' : 'Selesai'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/10">
            <div>
              <h4 className="text-gray-400 text-sm mb-1">Uraian Masalah</h4>
              <p className="text-white font-medium">{data.problem}</p>
            </div>
            <div>
              <h4 className="text-gray-400 text-sm mb-1">Waktu yang Dijadwalkan</h4>
              <p className="text-white">{data.scheduledDate}</p>
            </div>
            <div>
              <h4 className="text-gray-400 text-sm mb-1">Layanan Service</h4>
              <p className="text-white">{data.serviceType}</p>
            </div>
            <div>
              <h4 className="text-gray-400 text-sm mb-1">Estimasi Selesai</h4>
              <p className="text-white">{data.estimatedCompletion}</p>
            </div>
          </div>

          {/* Technician Info */}
          {data.technician && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-gray-400 text-sm mb-3">Teknisi yang Menangani</h4>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 text-lg">👨‍🔧</span>
                </div>
                <div>
                  <p className="text-white font-medium">{data.technician.name}</p>
                  <p className="text-gray-300 text-sm">{data.technician.phone}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-8">Status Pengerjaan</h3>
          
          <div className="space-y-8">
            {data.steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-6">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step.completed 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : index === data.currentStep
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse'
                      : 'bg-gray-700 border-gray-600 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <span className="text-lg">✓</span>
                    ) : index === data.currentStep ? (
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    ) : (
                      <span className="text-sm font-bold">{step.id}</span>
                    )}
                  </div>
                  
                  {/* Connection Line */}
                  {index < data.steps.length - 1 && (
                    <div className={`w-0.5 h-16 mt-4 transition-colors duration-300 ${
                      step.completed ? 'bg-blue-600' : 'bg-gray-700'
                    }`}></div>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-lg font-semibold ${
                      step.completed ? 'text-white' : 
                      index === data.currentStep ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </h4>
                    {step.timestamp && (
                      <span className="text-sm text-gray-400">{step.timestamp}</span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    step.completed ? 'text-gray-300' : 
                    index === data.currentStep ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/history"
            className="flex-1 bg-white/10 text-white py-4 px-6 rounded-xl font-medium text-center hover:bg-white/20 transition-all duration-300"
          >
            Lihat Riwayat Lengkap
          </Link>
          {data.technician && (
            <a
              href={`tel:${data.technician.phone}`}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-medium text-center hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg"
            >
              Hubungi Teknisi
            </a>
          )}
        </div>
      </div>
    </div>
  );
}