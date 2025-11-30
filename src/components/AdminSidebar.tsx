"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  ChartBarIcon, 
  ClipboardDocumentListIcon, 
  EnvelopeIcon, 
  ChartPieIcon,
  Cog6ToothIcon,
  HomeIcon,
  Bars3Icon
} from '@/components/icons';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
}

interface AdminSidebarProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

const sidebarItems: SidebarItem[] = [
  { id: 'overview', label: 'Overview', icon: <ChartBarIcon /> },
  { id: 'orders', label: 'Kelola Pesanan', icon: <ClipboardDocumentListIcon /> },
  { id: 'email', label: 'Kirim Email', icon: <EnvelopeIcon /> },
  { id: 'analytics', label: 'Analitik', icon: <ChartPieIcon /> },
];

export default function AdminSidebar({ selectedTab, onTabChange }: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-all"
        aria-label="Toggle menu"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-40
          w-64 bg-black/40 backdrop-blur-md border-r border-white/10
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex-shrink-0 lg:flex
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Brand */}
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <Image
                  src="/logoo.png"
                  alt="Bukhari Service Center"
                  width={40}
                  height={40}
                  unoptimized={true}
                />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                  BSC Admin
                </h1>
                <p className="text-xs text-gray-400">Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = selectedTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200 group
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <span className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer Links */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <Link
              href="/admin/master-data"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group ${
                pathname === '/admin/master-data'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={pathname === '/admin/master-data' ? 'text-white' : 'text-gray-400 group-hover:text-white'}>
                <Cog6ToothIcon />
              </span>
              <span className="font-medium">Master Data</span>
            </Link>
            <Link
              href="/"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all group"
            >
              <span className="text-gray-400 group-hover:text-white">
                <HomeIcon />
              </span>
              <span className="font-medium">Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

