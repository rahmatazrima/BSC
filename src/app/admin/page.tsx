"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Types
interface Order {
  id: string;
  customerName: string;
  device: string;
  problem: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  serviceType: string;
  scheduledDate: string;
  price: number;
  createdAt: string;
}

// Dummy Data
const dummyOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "Ahmad Rizki",
    device: "iPhone 14 Pro",
    problem: "Ganti LCD",
    status: "in-progress",
    serviceType: "Datang ke Bukhari Service Center",
    scheduledDate: "2024-01-15",
    price: 150000,
    createdAt: "2024-01-14"
  },
  {
    id: "ORD-002", 
    customerName: "Siti Nurhaliza",
    device: "Samsung Galaxy S23",
    problem: "Ganti Baterai",
    status: "pending",
    serviceType: "Mekanik datang ke lokasi Anda",
    scheduledDate: "2024-01-16",
    price: 75000,
    createdAt: "2024-01-14"
  },
  {
    id: "ORD-003",
    customerName: "Budi Santoso",
    device: "Xiaomi Redmi Note 12",
    problem: "Install Ulang",
    status: "completed",
    serviceType: "Datang ke Bukhari Service Center",
    scheduledDate: "2024-01-13",
    price: 75000,
    createdAt: "2024-01-12"
  },
  {
    id: "ORD-004",
    customerName: "Maya Putri",
    device: "iPhone 13",
    problem: "Ganti Speaker",
    status: "pending",
    serviceType: "Mekanik datang ke lokasi Anda",
    scheduledDate: "2024-01-17",
    price: 175000,
    createdAt: "2024-01-14"
  },
  {
    id: "ORD-005",
    customerName: "Andi Wijaya",
    device: "Samsung Galaxy A54",
    problem: "Ganti Kamera",
    status: "in-progress",
    serviceType: "Datang ke Bukhari Service Center",
    scheduledDate: "2024-01-15",
    price: 175000,
    createdAt: "2024-01-13"
  }
];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>(dummyOrders);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('all');

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    inProgressOrders: orders.filter(o => o.status === 'in-progress').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, order) => sum + order.price, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Bukhari Service Center"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h1 className="font-bold text-xl text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-300">Bukhari Service Center</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/admin/master-data"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 font-semibold"
            >
              📊 Master Data
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex space-x-1 bg-white/10 p-1 rounded-xl mb-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'orders', label: 'Kelola Pesanan' },
            { id: 'analytics', label: 'Analitik' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 py-3 px-6 rounded-lg text-center transition-all duration-300 ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Pesanan</p>
                    <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-blue-400 text-2xl">📋</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Menunggu</p>
                    <p className="text-3xl font-bold text-yellow-400">{stats.pendingOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-yellow-400 text-2xl">⏳</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Sedang Dikerjakan</p>
                    <p className="text-3xl font-bold text-blue-400">{stats.inProgressOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-blue-400 text-2xl">🔧</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Pendapatan</p>
                    <p className="text-2xl font-bold text-green-400">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-green-400 text-2xl">💰</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Pesanan Terbaru</h3>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-semibold text-white">{order.customerName}</p>
                          <p className="text-sm text-gray-300">{order.device} - {order.problem}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status === 'pending' ? 'Menunggu' :
                         order.status === 'in-progress' ? 'Dikerjakan' :
                         order.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                      </span>
                      <p className="text-sm text-gray-300 mt-1">Rp {order.price.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Management Tab */}
        {selectedTab === 'orders' && (
          <div>
            {/* Filter */}
            <div className="mb-6 flex space-x-4">
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
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="px-6 py-4 text-blue-400 font-mono">{order.id}</td>
                        <td className="px-6 py-4 text-white">{order.customerName}</td>
                        <td className="px-6 py-4 text-gray-300">{order.device}</td>
                        <td className="px-6 py-4 text-gray-300">{order.problem}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {order.status === 'pending' ? 'Menunggu' :
                             order.status === 'in-progress' ? 'Dikerjakan' :
                             order.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white font-semibold">Rp {order.price.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:border-blue-500/50 outline-none"
                          >
                            <option value="pending" className="bg-gray-800">Menunggu</option>
                            <option value="in-progress" className="bg-gray-800">Dikerjakan</option>
                            <option value="completed" className="bg-gray-800">Selesai</option>
                            <option value="cancelled" className="bg-gray-800">Dibatalkan</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Status Distribution */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Distribusi Status Pesanan</h3>
                <div className="space-y-4">
                  {[
                    { status: 'pending', label: 'Menunggu', count: stats.pendingOrders, color: 'bg-yellow-500' },
                    { status: 'in-progress', label: 'Sedang Dikerjakan', count: stats.inProgressOrders, color: 'bg-blue-500' },
                    { status: 'completed', label: 'Selesai', count: stats.completedOrders, color: 'bg-green-500' },
                  ].map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
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
                      <div key={problem} className="flex items-center justify-between">
                        <span className="text-gray-300">{problem}</span>
                        <span className="text-white font-semibold">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}