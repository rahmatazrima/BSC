"use client";

import React, { useState, useEffect } from 'react';
import NavbarCustomer from '@/components/NavbarCustomer';
import Image from 'next/image';
import Link from 'next/link';

// Types
interface Handphone {
  id: string;
  brand: string;
  tipe: string;
}

interface KendalaHandphone {
  id: string;
  topikMasalah: string;
  handphoneId: string;
  pergantianBarang: PergantianBarang[];
}

interface PergantianBarang {
  id: string;
  namaBarang: string;
  harga: number;
  kendalaHandphoneId: string;
}

interface ServiceSummary {
  id: string;
  statusService: string;
  tanggalPesan: string;
}

interface Waktu {
  id: string;
  namaShift: string;
  jamMulai: string;
  jamSelesai: string;
  isAvailable: boolean;
  services?: ServiceSummary[];
}

interface ServiceData {
  handphoneId: string;
  kendalaIds: string[];
  schedule: {
    date: string;
    waktuId: string;
  };
  serviceType: string;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
  };
}

const DIAGNOSTIC_PROBLEMS = new Set([
  "Install Ulang",
  "Handphone Tidak Bisa Menyala"
]);

const SERVICE_FEE = 50000;

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceData, setServiceData] = useState<ServiceData>({
    handphoneId: '',
    kendalaIds: [],
    schedule: { date: '', waktuId: '' },
    serviceType: '',
    customerInfo: { name: '', phone: '', address: '' }
  });
  
  // Master data states
  const [handphones, setHandphones] = useState<Handphone[]>([]);
  const [kendalas, setKendalas] = useState<KendalaHandphone[]>([]);
  const [waktuList, setWaktuList] = useState<Waktu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch all master data on mount
  useEffect(() => {
    fetchHandphones();
    fetchKendalas();
    fetchWaktu();
  }, []);
  
  const fetchHandphones = async () => {
    try {
      const response = await fetch('/api/handphone');
      const data = await response.json();
      if (data.status) {
        setHandphones(data.content);
      }
    } catch (err) {
      console.error('Error fetching handphones:', err);
      setError('Gagal memuat data handphone');
    }
  };
  
  const fetchKendalas = async () => {
    try {
      const response = await fetch('/api/kendala-handphone');
      const data = await response.json();
      if (data.status) {
        // Get all kendalas without filtering
        setKendalas(data.content);
      }
    } catch (err) {
      console.error('Error fetching kendalas:', err);
      setError('Gagal memuat data kendala');
    }
  };
  
  const fetchWaktu = async () => {
    try {
      const response = await fetch('/api/waktu');
      const data = await response.json();
      if (data.status) {
        setWaktuList(data.content);
      }
    } catch (err) {
      console.error('Error fetching waktu:', err);
      setError('Gagal memuat data waktu');
    }
  };

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
    if (serviceData.kendalaIds.length === 0) return 0;
    
    const selectedKendalas = serviceData.kendalaIds
      .map((kendalaId) => kendalas.find((k) => k.id === kendalaId))
      .filter((kendala): kendala is KendalaHandphone => Boolean(kendala));
    
    if (selectedKendalas.length === 0) return 0;

    const diagnosticOnly = selectedKendalas.every((kendala) =>
      DIAGNOSTIC_PROBLEMS.has(kendala.topikMasalah)
    );

    if (diagnosticOnly) return 0;
    
    let total = SERVICE_FEE; // Biaya layanan tetap
    
    selectedKendalas.forEach((kendala) => {
      if (kendala.pergantianBarang && kendala.pergantianBarang.length > 0) {
        // Ambil harga dari pergantian barang pertama
        // Dalam implementasi real, bisa disesuaikan logic untuk memilih sparepart
        const harga = kendala.pergantianBarang[0].harga;
        total += harga;
      }
    });
    
    return total;
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tempat: serviceData.serviceType,
          alamat: serviceData.customerInfo.address || null, // Alamat lengkap pelanggan (opsional)
          tanggalPesan: serviceData.schedule.date,
          handphoneId: serviceData.handphoneId,
          waktuId: serviceData.schedule.waktuId,
          kendalaHandphoneIds: serviceData.kendalaIds, // Kirim array kendala IDs yang dipilih user
          statusService: 'PENDING'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Pemesanan berhasil dibuat!');
        // Redirect to tracking page
        window.location.href = '/tracking';
      } else {
        setError(data.message || 'Gagal membuat pemesanan');
        alert(data.message || 'Gagal membuat pemesanan');
      }
    } catch (err) {
      console.error('Error creating service:', err);
      setError('Terjadi kesalahan saat membuat pemesanan');
      alert('Terjadi kesalahan saat membuat pemesanan');
    } finally {
      setLoading(false);
    }
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
          {currentStep === 1 && <Step1 serviceData={serviceData} updateServiceData={updateServiceData} handphones={handphones} />}
          {currentStep === 2 && <Step2 serviceData={serviceData} updateServiceData={updateServiceData} kendalas={kendalas} />}
          {currentStep === 3 && <Step3 serviceData={serviceData} updateServiceData={updateServiceData} waktuList={waktuList} />}
          {currentStep === 4 && <Step4 serviceData={serviceData} updateServiceData={updateServiceData} />}
          {currentStep === 5 && <Step5 serviceData={serviceData} price={calculatePrice()} handphones={handphones} kendalas={kendalas} waktuList={waktuList} />}

          {/* Navigation Buttons */}
          <div className={`flex gap-3 sm:gap-4 mt-8 sm:mt-10 md:mt-12 ${currentStep === 1 ? 'justify-end' : 'justify-between'}`}>
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-sm sm:text-base"
              >
                Kembali
              </button>
            )}
            
            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-sm sm:text-base"
              >
                Selanjutnya
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg sm:rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Konfirmasi Pesanan'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 1: Device Information
const Step1 = ({ serviceData, updateServiceData, handphones }: any) => {
  const [selectedBrand, setSelectedBrand] = React.useState('');
  
  // Get unique brands
  const brands = Array.from(new Set(handphones.map((h: Handphone) => h.brand))) as string[];
  
  // Get models for selected brand
  const models = selectedBrand 
    ? handphones.filter((h: Handphone) => h.brand === selectedBrand)
    : [];
  
  // Set initial brand if handphoneId exists
  React.useEffect(() => {
    if (serviceData.handphoneId && !selectedBrand) {
      const phone = handphones.find((h: Handphone) => h.id === serviceData.handphoneId);
      if (phone) {
        setSelectedBrand(phone.brand);
      }
    }
  }, [serviceData.handphoneId, handphones, selectedBrand]);
  
  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    // Reset handphone selection when brand changes
    updateServiceData('handphoneId', '');
    // Reset kendala selection
    updateServiceData('kendalaIds', []);
  };
  
  const handleModelChange = (handphoneId: string) => {
    updateServiceData('handphoneId', handphoneId);
    // Reset kendala selection when handphone changes
    updateServiceData('kendalaIds', []);
  };
  
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Beri Tahu Kami Tentang Perangkat Anda</h2>
      
      <div className="space-y-5 sm:space-y-6">
        <div>
          <label className="block text-gray-300 text-base sm:text-lg font-medium mb-2 sm:mb-3">Merek Perangkat Anda</label>
          <div className="relative">
            <select
              value={selectedBrand}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm text-sm sm:text-base appearance-none cursor-pointer"
            >
              <option value="" className="bg-gray-800">Pilih Merek</option>
              {brands.map((brand: string, idx: number) => (
                <option key={idx} value={brand} className="bg-gray-800">{brand}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 sm:px-4 text-white">
              <svg className="fill-current h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-gray-300 text-base sm:text-lg font-medium mb-2 sm:mb-3">Tipe Perangkat Anda</label>
          <div className="relative">
            <select
              value={serviceData.handphoneId}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={!selectedBrand}
              className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm text-sm sm:text-base appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" className="bg-gray-800">
                {selectedBrand ? 'Pilih Tipe' : 'Pilih merek terlebih dahulu'}
              </option>
              {models.map((phone: Handphone) => (
                <option key={phone.id} value={phone.id} className="bg-gray-800">{phone.tipe}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 sm:px-4 text-white">
              <svg className="fill-current h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 2: Problem Description
const Step2 = ({ serviceData, updateServiceData, kendalas }: any) => {
  // Static list of 6 problems
  const staticProblems = [
    "Ganti Baterai",
    "Ganti LCD",
    "Ganti Mic",
    "Ganti Speaker",
    "Ganti Tombol Power dan Volume",
    "Ganti Kamera",
    "Install Ulang",
    "Handphone Tidak Bisa Menyala"
  ];
  
  const toggleKendala = (kendalaId: string) => {
    const currentKendalas = serviceData.kendalaIds || [];
    if (currentKendalas.includes(kendalaId)) {
      // Remove kendala if already selected
      updateServiceData('kendalaIds', currentKendalas.filter((k: string) => k !== kendalaId));
    } else {
      // Add kendala if not selected
      updateServiceData('kendalaIds', [...currentKendalas, kendalaId]);
    }
  };
  
  // Check if static problem is available for selected handphone
  const getKendalaForProblem = (problemName: string) => {
    if (!serviceData.handphoneId) return null;
    
    // Find kendala in database that matches handphoneId and problem name
    return kendalas.find((k: KendalaHandphone) => 
      k.handphoneId === serviceData.handphoneId && 
      k.topikMasalah === problemName
    );
  };

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Deskripsikan Masalah Anda</h2>
      <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8">Pilih satu atau lebih masalah yang sesuai dengan perangkat Anda</p>
      
      {!serviceData.handphoneId ? (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-300 text-center">
          Silakan pilih handphone terlebih dahulu di Step 1
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {staticProblems.map((problemName, idx) => {
              const kendala = getKendalaForProblem(problemName);
              const available = kendala !== null && kendala !== undefined;
              const isSelected = kendala && serviceData.kendalaIds.includes(kendala.id);
              const showNote = DIAGNOSTIC_PROBLEMS.has(problemName);
              
              return (
                <button
                  key={idx}
                  onClick={() => available && kendala && toggleKendala(kendala.id)}
                  disabled={!available}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-left text-sm sm:text-base ${
                    !available
                      ? 'border-gray-700 bg-gray-800/30 text-gray-500 cursor-not-allowed opacity-50'
                      : isSelected
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/10'
                  }`}
                >
                  <div className="font-medium">{problemName}</div>
                  {available && !showNote && kendala && kendala.pergantianBarang && kendala.pergantianBarang.length > 0 && (
                    <div className="text-xs mt-1 text-gray-400">
                      {kendala.pergantianBarang[0].namaBarang} - Rp {kendala.pergantianBarang[0].harga.toLocaleString('id-ID')}
                    </div>
                  )}
                  {showNote && (
                    <div className="text-xs mt-1 text-gray-500 italic">
                      Harga muncul setelah didiagnosa oleh mekanik
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {serviceData.kendalaIds.length > 0 && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg sm:rounded-xl">
              <p className="text-white text-sm sm:text-base">
                <span className="font-semibold">{serviceData.kendalaIds.length}</span> masalah dipilih
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Step 3: Schedule
const Step3 = ({ serviceData, updateServiceData, waktuList }: any) => {
  const selectedDate = serviceData.schedule.date;

  const isShiftBooked = React.useCallback((waktu: Waktu) => {
    if (!selectedDate) return false;
    if (!waktu.services || waktu.services.length === 0) return false;

    return waktu.services.some((service) => {
      if (!service || !service.tanggalPesan) return false;
      const serviceDate = service.tanggalPesan.split('T')[0];
      return (
        service.statusService !== 'CANCELLED' &&
        serviceDate === selectedDate
      );
    });
  }, [selectedDate]);

  React.useEffect(() => {
    if (!serviceData.schedule.waktuId) return;
    const selectedWaktu = waktuList.find((w: Waktu) => w.id === serviceData.schedule.waktuId);
    if (selectedWaktu && isShiftBooked(selectedWaktu)) {
      updateServiceData('schedule', { ...serviceData.schedule, waktuId: '' });
    }
  }, [serviceData.schedule.date, serviceData.schedule.waktuId, waktuList, isShiftBooked, updateServiceData]);

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Jadwalkan Layanan untuk Anda</h2>
      
      <div className="space-y-5 sm:space-y-6">
        <div>
          <label className="block text-gray-300 text-base sm:text-lg font-medium mb-2 sm:mb-3">Pilih Tanggal</label>
          <input
            type="date"
            value={serviceData.schedule.date}
            onChange={(e) => updateServiceData('schedule', { ...serviceData.schedule, date: e.target.value, waktuId: '' })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm text-sm sm:text-base [color-scheme:dark]"
            style={{ colorScheme: 'dark' }}
          />
        </div>
        
        <div>
          <label className="block text-gray-300 text-base sm:text-lg font-medium mb-2 sm:mb-3">Pilih Shift Waktu</label>
          <div className="relative">
            <select
              value={serviceData.schedule.waktuId}
              onChange={(e) => updateServiceData('schedule', { ...serviceData.schedule, waktuId: e.target.value })}
              disabled={!selectedDate}
              className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm text-sm sm:text-base appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="" className="bg-gray-800">Pilih shift waktu</option>
              {waktuList.map((waktu: Waktu) => {
                const booked = isShiftBooked(waktu);
                return (
                  <option 
                    key={waktu.id} 
                    value={waktu.id}
                    disabled={booked}
                    className="bg-gray-800"
                  >
                    {waktu.namaShift} ({waktu.jamMulai} - {waktu.jamSelesai}){booked ? ' - Sudah dibooking' : ''}
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 sm:px-4 text-white">
              <svg className="fill-current h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          {!selectedDate && (
            <p className="text-xs text-gray-400 mt-2">Pilih tanggal terlebih dahulu untuk melihat ketersediaan shift</p>
          )}
        </div>
      </div>
    </div>
  );
};

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
const Step5 = ({ serviceData, price, handphones, kendalas, waktuList }: any) => {
  const selectedHandphone = handphones.find((h: Handphone) => h.id === serviceData.handphoneId);
  const selectedKendalas = kendalas.filter((k: KendalaHandphone) => serviceData.kendalaIds.includes(k.id));
  const selectedWaktu = waktuList.find((w: Waktu) => w.id === serviceData.schedule.waktuId);
  const diagnosticOnly = selectedKendalas.length > 0 && selectedKendalas.every((kendala: KendalaHandphone) =>
    DIAGNOSTIC_PROBLEMS.has(kendala.topikMasalah)
  );
  const totalPrice = diagnosticOnly ? 0 : price;
  
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Konfirmasi Pemesanan Anda</h2>
      
      <div className="bg-white/5 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Detail Perangkat</h3>
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <div>
                <span className="text-gray-400">Perangkat:</span>
                <span className="text-white ml-2">
                  {selectedHandphone ? `${selectedHandphone.brand} ${selectedHandphone.tipe}` : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Masalah:</span>
                <div className="text-white ml-2 mt-1 space-y-1">
                  {selectedKendalas.length > 0 ? (
                    selectedKendalas.map((kendala: KendalaHandphone, idx: number) => (
                      <div key={idx} className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <div>
                          <span>{kendala.topikMasalah}</span>
                          {DIAGNOSTIC_PROBLEMS.has(kendala.topikMasalah) ? (
                            <div className="text-xs text-gray-400 mt-0.5 italic">
                              Harga akan muncul setelah didiagnosa oleh mekanik
                            </div>
                          ) : kendala.pergantianBarang && kendala.pergantianBarang.length > 0 ? (
                            <div className="text-xs text-gray-400 mt-0.5">
                              {kendala.pergantianBarang[0].namaBarang} - Rp {kendala.pergantianBarang[0].harga.toLocaleString('id-ID')}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400">Tidak ada masalah dipilih</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Jadwal & Layanan</h3>
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <div>
                <span className="text-gray-400">Tanggal:</span>
                <span className="text-white ml-2">
                  {serviceData.schedule.date ? new Date(serviceData.schedule.date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Waktu:</span>
                <span className="text-white ml-2">
                  {selectedWaktu ? `${selectedWaktu.namaShift} (${selectedWaktu.jamMulai} - ${selectedWaktu.jamSelesai})` : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Layanan:</span>
                <span className="text-white ml-2 break-words">{serviceData.serviceType || '-'}</span>
              </div>
              {serviceData.serviceType === 'Mekanik datang ke lokasi Anda' && serviceData.customerInfo.address && (
                <div>
                  <span className="text-gray-400">Alamat:</span>
                  <span className="text-white ml-2 break-words">{serviceData.customerInfo.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Total Biaya</h3>
            <p className="text-sm sm:text-base text-gray-300">Estimasi biaya perbaikan</p>
            <p className="text-xs text-yellow-300 mt-1">
              {diagnosticOnly
                ? '*Harga akan muncul setelah didiagnosa oleh mekanik'
                : '*Termasuk biaya layanan jasa service'}
            </p>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="text-2xl sm:text-3xl font-bold text-white">Rp {totalPrice.toLocaleString('id-ID')}</div>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">*Harga dapat berubah setelah diagnosa</p>
          </div>
        </div>
      </div>
    </div>
  );
};