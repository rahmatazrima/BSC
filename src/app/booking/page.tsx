"use client";

import React, { useState } from 'react';
import NavbarCustomer from '@/components/NavbarCustomer';
import Image from 'next/image';
import Link from 'next/link';

// Types
interface DeviceInfo {
  brand: string;
  type: string;
}

interface ServiceData {
  deviceInfo: DeviceInfo;
  problem: string;
  schedule: {
    date: string;
    time: string;
  };
  serviceType: string;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
  };
}

// Pricing data
const servicePricing = {
  "Ganti Baterai": { base: 50000, premium: 75000 },
  "Layar Depan Retak": { base: 150000, premium: 200000 },
  "Install Ulang": { base: 75000, premium: 100000 },
  "Speaker atau Mikrofon Bermasalah": { base: 125000, premium: 175000 },
  "Tombol Tidak Berfungsi": { base: 100000, premium: 150000 },
  "Kamera Tidak Berfungsi dengan Baik": { base: 175000, premium: 250000 },
};

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceData, setServiceData] = useState<ServiceData>({
    deviceInfo: { brand: '', type: '' },
    problem: '',
    schedule: { date: '', time: '' },
    serviceType: '',
    customerInfo: { name: '', phone: '', address: '' }
  });

  const updateServiceData = (field: string, value: any) => {
    setServiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const calculatePrice = () => {
    const pricing = servicePricing[serviceData.problem as keyof typeof servicePricing];
    if (!pricing) return 0;
    
    return serviceData.serviceType === 'Datang ke Bukhari Service Center' 
      ? pricing.base 
      : pricing.premium;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      {/* Header */}
      <NavbarCustomer />

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base md:text-lg transition-all duration-300 ${
                step <= currentStep 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {step}
              </div>
              {step < 5 && (
                <div className={`w-8 sm:w-16 md:w-24 h-0.5 sm:h-1 mx-1 sm:mx-2 md:mx-4 transition-all duration-300 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-12 shadow-2xl">
          {currentStep === 1 && <Step1 serviceData={serviceData} updateServiceData={updateServiceData} />}
          {currentStep === 2 && <Step2 serviceData={serviceData} updateServiceData={updateServiceData} />}
          {currentStep === 3 && <Step3 serviceData={serviceData} updateServiceData={updateServiceData} />}
          {currentStep === 4 && <Step4 serviceData={serviceData} updateServiceData={updateServiceData} />}
          {currentStep === 5 && <Step5 serviceData={serviceData} price={calculatePrice()} />}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-3 sm:gap-4 mt-8 sm:mt-10 md:mt-12">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-sm sm:text-base"
            >
              Kembali
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-sm sm:text-base"
              >
                Selanjutnya
              </button>
            ) : (
              <button className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg sm:rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg text-sm sm:text-base">
                Konfirmasi Pesanan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 1: Device Information
const Step1 = ({ serviceData, updateServiceData }: any) => (
  <div>
    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Beri Tahu Kami Tentang Perangkat Anda</h2>
    
    <div className="space-y-5 sm:space-y-6">
      <div>
        <label className="block text-gray-300 text-base sm:text-lg font-medium mb-2 sm:mb-3">Merek Perangkat Anda</label>
        <input
          type="text"
          value={serviceData.deviceInfo.brand}
          onChange={(e) => updateServiceData('deviceInfo', { ...serviceData.deviceInfo, brand: e.target.value })}
          placeholder="Contoh: Samsung, iPhone, Xiaomi"
          className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm text-sm sm:text-base"
        />
      </div>
      
      <div>
        <label className="block text-gray-300 text-base sm:text-lg font-medium mb-2 sm:mb-3">Tipe Perangkat Anda</label>
        <input
          type="text"
          value={serviceData.deviceInfo.type}
          onChange={(e) => updateServiceData('deviceInfo', { ...serviceData.deviceInfo, type: e.target.value })}
          placeholder="Contoh: Galaxy S24, iPhone 15 Pro"
          className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm text-sm sm:text-base"
        />
      </div>
    </div>
  </div>
);

// Step 2: Problem Description
const Step2 = ({ serviceData, updateServiceData }: any) => {
  const problems = [
    "Ganti Baterai",
    "Layar Depan Retak", 
    "Install Ulang",
    "Speaker atau Mikrofon Bermasalah",
    "Tombol Tidak Berfungsi",
    "Kamera Tidak Berfungsi dengan Baik"
  ];

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Deskripsikan Masalah Anda</h2>
      <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8">Pilih topik yang paling sesuai dengan masalah perangkat Anda</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {problems.map((problem) => (
          <button
            key={problem}
            onClick={() => updateServiceData('problem', problem)}
            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-left text-sm sm:text-base ${
              serviceData.problem === problem
                ? 'border-blue-500 bg-blue-500/20 text-white'
                : 'border-white/20 bg-white/5 text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/10'
            }`}
          >
            {problem}
          </button>
        ))}
      </div>
    </div>
  );
};

// Step 3: Schedule
const Step3 = ({ serviceData, updateServiceData }: any) => (
  <div>
    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Jadwalkan Layanan untuk Anda</h2>
    
    <div className="space-y-5 sm:space-y-6">
      <div>
        <label className="block text-gray-300 text-base sm:text-lg font-medium mb-2 sm:mb-3">Pilih Tanggal</label>
        <input
          type="date"
          value={serviceData.schedule.date}
          onChange={(e) => updateServiceData('schedule', { ...serviceData.schedule, date: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm text-sm sm:text-base"
        />
      </div>
      
      <div>
        <label className="block text-gray-300 text-base sm:text-lg font-medium mb-2 sm:mb-3">Pilih Waktu</label>
        <select
          value={serviceData.schedule.time}
          onChange={(e) => updateServiceData('schedule', { ...serviceData.schedule, time: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm text-sm sm:text-base"
        >
          <option value="" className="bg-gray-800">Pilih waktu</option>
          <option value="09:00" className="bg-gray-800">09:00 - 10:00</option>
          <option value="10:00" className="bg-gray-800">10:00 - 11:00</option>
          <option value="11:00" className="bg-gray-800">11:00 - 12:00</option>
          <option value="13:00" className="bg-gray-800">13:00 - 14:00</option>
          <option value="14:00" className="bg-gray-800">14:00 - 15:00</option>
          <option value="15:00" className="bg-gray-800">15:00 - 16:00</option>
        </select>
      </div>
    </div>
  </div>
);

// Step 4: Service Type
const Step4 = ({ serviceData, updateServiceData }: any) => {
  const serviceTypes = [
    {
      name: "Datang ke Bukhari Service Center",
      description: "Bawa perangkat Anda ke lokasi kami untuk perbaikan"
    },
    {
      name: "Mekanik datang ke lokasi Anda", 
      description: "Teknisi kami akan datang ke alamat Anda"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Pilih Layanan yang Anda Inginkan</h2>
      
      <div className="space-y-3 sm:space-y-4">
        {serviceTypes.map((type) => (
          <button
            key={type.name}
            onClick={() => updateServiceData('serviceType', type.name)}
            className={`w-full p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-left ${
              serviceData.serviceType === type.name
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-white/20 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/10'
            }`}
          >
            <h3 className="text-white font-semibold text-base sm:text-lg mb-1 sm:mb-2">{type.name}</h3>
            <p className="text-gray-300 text-sm sm:text-base">{type.description}</p>
          </button>
        ))}
      </div>

      {serviceData.serviceType === "Mekanik datang ke lokasi Anda" && (
        <div className="mt-5 sm:mt-6">
          <label className="block text-gray-300 text-base sm:text-lg font-medium mb-2 sm:mb-3">Alamat Lengkap</label>
          <textarea
            value={serviceData.customerInfo.address}
            onChange={(e) => updateServiceData('customerInfo', { ...serviceData.customerInfo, address: e.target.value })}
            placeholder="Masukkan alamat detail atau link Google Maps, contoh: Warkop Plut Kupie, Lampineung"
            rows={4}
            className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm text-sm sm:text-base"
          />
        </div>
      )}
    </div>
  );
};

// Step 5: Confirmation
const Step5 = ({ serviceData, price }: { serviceData: ServiceData; price: number }) => (
  <div>
    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Konfirmasi Pemesanan Anda</h2>
    
    <div className="bg-white/5 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Detail Perangkat</h3>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
            <div>
              <span className="text-gray-400">Perangkat:</span>
              <span className="text-white ml-2">{serviceData.deviceInfo.brand} {serviceData.deviceInfo.type}</span>
            </div>
            <div>
              <span className="text-gray-400">Masalah:</span>
              <span className="text-white ml-2">{serviceData.problem}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Jadwal & Layanan</h3>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
            <div>
              <span className="text-gray-400">Tanggal:</span>
              <span className="text-white ml-2">{new Date(serviceData.schedule.date).toLocaleDateString('id-ID')}</span>
            </div>
            <div>
              <span className="text-gray-400">Waktu:</span>
              <span className="text-white ml-2">{serviceData.schedule.time}:00</span>
            </div>
            <div>
              <span className="text-gray-400">Layanan:</span>
              <span className="text-white ml-2 break-words">{serviceData.serviceType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">Total Biaya</h3>
          <p className="text-sm sm:text-base text-gray-300">Estimasi biaya perbaikan</p>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto">
          <div className="text-2xl sm:text-3xl font-bold text-white">Rp {price.toLocaleString('id-ID')}</div>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">*Harga dapat berubah setelah diagnosa</p>
        </div>
      </div>
    </div>
  </div>
);