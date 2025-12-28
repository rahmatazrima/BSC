"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import EmailSender from '@/components/EmailSender';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import OrderDetailModal from '@/components/OrderDetailModal';
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  WrenchScrewdriverIcon, 
  CurrencyDollarIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@/components/icons';

// Types
interface KendalaHandphone {
  id: string;
  topikMasalah: string;
  pergantianBarang: Array<{
    id: string;
    namaBarang: string;
    harga: number;
  }>;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  device: string;
  problem: string; // String gabungan semua masalah
  problems: string[]; // Array semua uraian masalah yang dipilih customer
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  serviceType: string;
  alamat: string | null;
  googleMapsLink: string | null;
  scheduledDate: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  kendalaHandphone: KendalaHandphone[]; // Semua kendala yang dipilih customer
}

interface ServiceStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  popularProblems?: Array<{
    problem: string;
    count: number;
  }>;
}

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get tab from URL or default to overview
  const tabFromUrl = searchParams.get('tab') || 'overview';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<ServiceStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [selectedTab, setSelectedTab] = useState(tabFromUrl);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Fetch brands on mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Sync selectedTab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'overview';
    setSelectedTab(tabFromUrl);
  }, [searchParams]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch recent services on mount (untuk overview)
  useEffect(() => {
    fetchRecentServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch services when filters change (only in orders tab)
  useEffect(() => {
    if (selectedTab === 'orders') {
      fetchServices();
    } else if (selectedTab === 'overview') {
      fetchRecentServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, debouncedSearch, statusFilter, searchDate, brandFilter, currentPage]);

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/handphone", {
        credentials: "include",
      });
      const json = await response.json();
      
      if (json.status && json.content) {
        const brands = Array.from(new Set(json.content.map((hp: any) => hp.brand))).sort() as string[];
        setAvailableBrands(brands);
      }
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status'], notify: boolean = true) => {
    try {
      const response = await fetch(`/api/service/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          statusService: newStatus,
          sendNotification: notify,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Gagal mengupdate status");
      }

      // Refresh data dengan filter yang sama
      await fetchServices();
    } catch (err: unknown) {
      console.error("Update status error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Gagal mengupdate status pesanan"
      );
    }
  };

  const handleViewDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleModalStatusUpdate = () => {
    // Refresh orders list when status is updated in modal
    fetchServices();
  };

  const fetchRecentServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/service/recent", {
        credentials: "include",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Gagal memuat data service");
      }

      if (json.status && json.content) {
        setOrders(json.content);
        if (json.stats) {
          setStats(json.stats);
        }
      }
    } catch (err: unknown) {
      console.error("Fetch recent services error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat data service"
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      // Build query parameters
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        const statusMap: Record<string, string> = {
          'pending': 'PENDING',
          'in-progress': 'IN_PROGRESS',
          'completed': 'COMPLETED',
          'cancelled': 'CANCELLED',
        };
        params.append('status', statusMap[statusFilter]);
      }
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }
      if (searchDate) {
        params.append('searchDate', searchDate);
      }
      if (brandFilter && brandFilter !== 'all') {
        params.append('brand', brandFilter);
      }

      // Add pagination params
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());

      const queryString = params.toString();
      const url = `/api/service/getAllServices${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Gagal memuat data service");
      }

      if (json.status && json.content) {
        setOrders(json.content);
        if (json.stats) {
          setStats(json.stats);
        }
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages);
          setTotalItems(json.pagination.total);
        }
      }
    } catch (err: unknown) {
      console.error("Fetch services error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat data service"
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSearchDate("");
    setBrandFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Handler untuk tab change dengan update URL
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    // Update URL without reload
    const newUrl = tab === 'overview' ? '/admin' : `/admin?tab=${tab}`;
    router.push(newUrl, { scroll: false });
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

  // Filtering sudah dilakukan di backend, tapi tetap filter di frontend untuk status sebagai fallback
  // (karena status filter sudah dikirim ke backend, ini hanya untuk safety)
  const filteredOrders = orders;

  const getTabTitle = () => {
    switch (selectedTab) {
      case 'overview': return 'Overview';
      case 'orders': return 'Kelola Pesanan';
      case 'email': return 'Kirim Email';
      case 'analytics': return 'Analitik';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex">
      {/* Sidebar */}
      <AdminSidebar selectedTab={selectedTab} onTabChange={handleTabChange} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AdminHeader />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">{getTabTitle()}</h1>
            <p className="text-gray-400">Kelola dan pantau aktivitas sistem</p>
          </div>

          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm mb-1">Total Pesanan</p>
                      <p className="text-3xl font-bold text-white">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <ClipboardDocumentListIcon className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm mb-1">Menunggu</p>
                      <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm mb-1">Sedang Dikerjakan</p>
                      <p className="text-3xl font-bold text-blue-400">{stats.inProgress}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <WrenchScrewdriverIcon className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm mb-1">Total Pendapatan</p>
                      <p className="text-2xl font-bold text-green-400">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <h3 className="text-xl font-bold text-white">Pesanan Terbaru</h3>
                </div>
                {loading ? (
                  <div className="p-8 text-center text-gray-400">Memuat data...</div>
                ) : error ? (
                  <div className="p-8 text-center text-red-400">{error}</div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">Belum ada pesanan</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="px-6 py-4 text-left text-white font-semibold">Pelanggan</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Perangkat</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Uraian Masalah</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Alamat</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Harga</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-white font-medium">{order.customerName}</p>
                                <p className="text-xs text-gray-400">{order.customerEmail}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-300">{order.device}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1 max-w-md">
                                {order.problems && order.problems.length > 0 ? (
                                  order.problems.map((problem, idx) => (
                                    <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                                      {problem}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {order.serviceType === 'Mekanik datang ke lokasi Anda' && order.googleMapsLink ? (
                                <a
                                  href={order.googleMapsLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded bg-blue-600/20 px-2 py-0.5 text-xs font-medium text-blue-400 transition-all duration-300 hover:bg-blue-600/30 hover:text-blue-300"
                                >
                                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                  Lokasi Maps
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-300">Rp {order.price.toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Management Tab */}
          {selectedTab === 'orders' && (
            <div className="space-y-6">
              {/* Search & Filter Section */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Cari berdasarkan nama, email, atau perangkat..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>

                  {/* Filter Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      >
                        <option value="all" className="bg-gray-800">Semua Status</option>
                        <option value="pending" className="bg-gray-800">Menunggu</option>
                        <option value="in-progress" className="bg-gray-800">Sedang Dikerjakan</option>
                        <option value="completed" className="bg-gray-800">Selesai</option>
                        <option value="cancelled" className="bg-gray-800">Dibatalkan</option>
                      </select>
                    </div>

                    {/* Brand Filter */}
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Brand</label>
                      <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      >
                        <option value="all" className="bg-gray-800">Semua Brand</option>
                        {availableBrands.map((brand) => (
                          <option key={brand} value={brand} className="bg-gray-800">
                            {brand}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Search by Date */}
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Cari Berdasarkan Tanggal</label>
                      <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>

                    {/* Reset Button */}
                    <div className="flex items-end">
                      <button
                        onClick={handleResetFilters}
                        className="w-full px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-600/30 transition-colors flex items-center justify-center space-x-2"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                        <span>Reset Filter</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center text-gray-400">Memuat data...</div>
                ) : error ? (
                  <div className="p-8 text-center text-red-400">{error}</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="px-6 py-4 text-left text-white font-semibold">Pelanggan</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Perangkat</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Uraian Masalah</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Harga</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Aksi</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Detail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                              Tidak ada pesanan untuk filter ini
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((order) => (
                            <tr key={order.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-white font-medium">{order.customerName}</p>
                                  <p className="text-xs text-gray-400">{order.customerEmail}</p>
                                  <p className="text-xs text-gray-400">{order.customerPhone}</p>
                                  {order.serviceType === 'Mekanik datang ke lokasi Anda' && order.googleMapsLink && (
                                    <a
                                      href={order.googleMapsLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 mt-1 rounded bg-blue-600/20 px-2 py-0.5 text-xs font-medium text-blue-400 transition-all duration-300 hover:bg-blue-600/30 hover:text-blue-300"
                                    >
                                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                      </svg>
                                      Lokasi Maps
                                    </a>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-300">{order.device}</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1 max-w-md">
                                  {order.problems && order.problems.length > 0 ? (
                                    order.problems.map((problem, idx) => (
                                      <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                                        {problem}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-400 text-sm">-</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1  text-xs font-medium border ${getStatusColor(order.status)}`}>
                                  {getStatusText(order.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-white font-semibold">Rp {order.price.toLocaleString('id-ID')}</td>
                              <td className="px-6 py-4">
                                <select
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'], true)}
                                  className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:border-blue-500/50 outline-none hover:bg-white/20 transition-colors"
                                >
                                  <option value="PENDING" className="bg-gray-800">Menunggu</option>
                                  <option value="IN_PROGRESS" className="bg-gray-800">Dikerjakan</option>
                                  <option value="COMPLETED" className="bg-gray-800">Selesai</option>
                                  <option value="CANCELLED" className="bg-gray-800">Dibatalkan</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleViewDetail(order.id)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                  <span>Lihat Detail</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="border-t border-white/10 px-6 py-4">
                      <div className="flex items-center justify-between">
                        {/* Info */}
                        <div className="text-sm text-gray-400">
                          Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} pesanan
                        </div>

                        {/* Pagination Buttons */}
                        <div className="flex items-center space-x-2">
                          {/* Previous Button */}
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>

                          {/* Page Numbers */}
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(page => {
                                // Show first page, last page, current page, and pages around current
                                return page === 1 || 
                                       page === totalPages || 
                                       (page >= currentPage - 1 && page <= currentPage + 1);
                              })
                              .map((page, index, array) => {
                                // Add ellipsis
                                const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                                
                                return (
                                  <React.Fragment key={page}>
                                    {showEllipsisBefore && (
                                      <span className="px-3 py-2 text-gray-400">...</span>
                                    )}
                                    <button
                                      onClick={() => setCurrentPage(page)}
                                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                        currentPage === page
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  </React.Fragment>
                                );
                              })}
                          </div>

                          {/* Next Button */}
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Order Detail Modal */}
          <OrderDetailModal
            orderId={selectedOrderId}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onStatusUpdate={handleModalStatusUpdate}
          />

          {/* Email Tab */}
          {selectedTab === 'email' && (
            <div className="space-y-6">
              <EmailSender />
            </div>
          )}

          {/* Analytics Tab */}
          {selectedTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Status Distribution */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Distribusi Status Pesanan</h3>
                  <div className="space-y-4">
                    {[
                      { status: 'PENDING', label: 'Menunggu', count: stats.pending, color: 'bg-yellow-500' },
                      { status: 'IN_PROGRESS', label: 'Sedang Dikerjakan', count: stats.inProgress, color: 'bg-blue-500' },
                      { status: 'COMPLETED', label: 'Selesai', count: stats.completed, color: 'bg-green-500' },
                    ].map((item) => (
                      <div key={item.status} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                          <span className="text-gray-300">{item.label}</span>
                        </div>
                        <span className="text-white font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Problems */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Masalah Paling Sering</h3>
                  <div className="space-y-4">
                    {stats.popularProblems && stats.popularProblems.length > 0 ? (
                      stats.popularProblems.map((item) => (
                        <div key={item.problem} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-300">{item.problem}</span>
                          <span className="text-white font-semibold">{item.count}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-400">
                        Belum ada data masalah
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
