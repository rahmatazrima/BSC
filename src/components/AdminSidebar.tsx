"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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
  href: string;
}

interface AdminSidebarProps {
  selectedTab?: string;
  onTabChange?: (tab: string) => void;
  isMobileOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

const sidebarItems: SidebarItem[] = [
  { id: 'overview', label: 'Overview', icon: <ChartBarIcon />, href: '/admin' },
  { id: 'orders', label: 'Kelola Pesanan', icon: <ClipboardDocumentListIcon />, href: '/admin?tab=orders' },
  { id: 'email', label: 'Kirim Email', icon: <EnvelopeIcon />, href: '/admin?tab=email' },
  { id: 'analytics', label: 'Analitik', icon: <ChartPieIcon />, href: '/admin?tab=analytics' },
];

export default function AdminSidebar({ selectedTab, onTabChange, isMobileOpen: externalMobileOpen, onMobileMenuToggle }: AdminSidebarProps) {
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const isMobileOpen = externalMobileOpen !== undefined ? externalMobileOpen : internalMobileOpen;
  
  // Helper function untuk close mobile menu
  const closeMobileMenu = () => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    } else {
      setInternalMobileOpen(false);
    }
  };
  
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab from pathname if selectedTab not provided
  const getActiveTab = () => {
    if (selectedTab) return selectedTab;
    
    // Get tab from URL query params
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam) return tabParam;
    }
    
    // Default to overview if no tab param
    if (pathname === '/admin') return 'overview';
    return 'overview';
  };

  const activeTab = getActiveTab();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
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
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (onTabChange) {
                      onTabChange(item.id);
                    }
                    closeMobileMenu();
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
                </Link>
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

