"use client";

import React, { useState, useEffect } from 'react';
import EmailSender from '@/components/EmailSender';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  WrenchScrewdriverIcon, 
  CurrencyDollarIcon 
} from '@/components/icons';

// Types
interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  device: string;
  problem: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  serviceType: string;
  alamat: string | null;
  scheduledDate: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface ServiceStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<ServiceStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [selectedTab, setSelectedTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch all services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/service/getAllServices", {
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

    fetchServices();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
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

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      // Refresh stats
      const statsResponse = await fetch("/api/service/getAllServices", {
        credentials: "include",
      });
      const statsJson = await statsResponse.json();
      if (statsJson.stats) {
        setStats(statsJson.stats);
      }
    } catch (err: unknown) {
      console.error("Update status error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Gagal mengupdate status pesanan"
      );
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

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => {
        const statusMap: Record<string, string> = {
          'pending': 'PENDING',
          'in-progress': 'IN_PROGRESS',
          'completed': 'COMPLETED',
          'cancelled': 'CANCELLED',
        };
        return order.status === statusMap[statusFilter];
      });

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
      <AdminSidebar selectedTab={selectedTab} onTabChange={setSelectedTab} />

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
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Pesanan Terbaru</h3>
                {loading ? (
                  <div className="text-center py-8 text-gray-400">Memuat data...</div>
                ) : error ? (
                  <div className="text-center py-8 text-red-400">{error}</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">Belum ada pesanan</div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-semibold text-white">{order.customerName}</p>
                              <p className="text-sm text-gray-300">{order.device} - {order.problem}</p>
                              {order.alamat && (
                                <p className="text-xs text-gray-400 mt-1">📍 {order.alamat}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <p className="text-sm text-gray-300 mt-1">Rp {order.price.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Management Tab */}
          {selectedTab === 'orders' && (
            <div className="space-y-6">
              {/* Filter */}
              <div className="flex space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value="all" className="bg-gray-800">Semua Status</option>
                  <option value="pending" className="bg-gray-800">Menunggu</option>
                  <option value="in-progress" className="bg-gray-800">Sedang Dikerjakan</option>
                  <option value="completed" className="bg-gray-800">Selesai</option>
                  <option value="cancelled" className="bg-gray-800">Dibatalkan</option>
                </select>
              </div>

              {/* Orders Table */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center text-gray-400">Memuat data...</div>
                ) : error ? (
                  <div className="p-8 text-center text-red-400">{error}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="px-6 py-4 text-left text-white font-semibold">ID Pesanan</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Pelanggan</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Perangkat</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Masalah</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Harga</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Aksi</th>
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
                              <td className="px-6 py-4 text-blue-400 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                              <td className="px-6 py-4 text-white">{order.customerName}</td>
                              <td className="px-6 py-4 text-gray-300">{order.device}</td>
                              <td className="px-6 py-4 text-gray-300">{order.problem}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                  {getStatusText(order.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-white font-semibold">Rp {order.price.toLocaleString('id-ID')}</td>
                              <td className="px-6 py-4">
                                <select
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                                  className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:border-blue-500/50 outline-none hover:bg-white/20 transition-colors"
                                >
                                  <option value="PENDING" className="bg-gray-800">Menunggu</option>
                                  <option value="IN_PROGRESS" className="bg-gray-800">Dikerjakan</option>
                                  <option value="COMPLETED" className="bg-gray-800">Selesai</option>
                                  <option value="CANCELLED" className="bg-gray-800">Dibatalkan</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Tab */}
          {selectedTab === 'email' && (
            <div className="space-y-6">
              <EmailSender />
            </div>
          )}

          {/* Analytics Tab */}
          {selectedTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    {Object.entries(
                      orders.reduce((acc: any, order) => {
                        acc[order.problem] = (acc[order.problem] || 0) + 1;
                        return acc;
                      }, {})
                    )
                      .sort(([,a]: any, [,b]: any) => b - a)
                      .slice(0, 5)
                      .map(([problem, count]: any) => (
                        <div key={problem} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-300">{problem}</span>
                          <span className="text-white font-semibold">{count}</span>
                        </div>
                      ))}
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
