"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowRightOnRectangleIcon, ChevronDownIcon } from '@/components/icons';

interface UserData {
  name: string;
  email: string;
  role: string;
}

interface AdminHeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps = {}) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data.data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/login');
    }
  };

  const getUserInitials = () => {
    if (!userData?.name) return 'A';
    return userData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const pathname = usePathname();
  const getPageTitle = () => {
    if (pathname === '/admin/master-data') {
      return {
        title: 'Master Data Management',
        subtitle: 'Kelola Data HP, Kendala, Sparepart & Waktu'
      };
    }
    return {
      title: 'Admin Dashboard',
      subtitle: 'Kelola semua aktivitas sistem'
    };
  };

  const pageInfo = getPageTitle();

  return (
    <header className="sticky top-0 z-30 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Mobile Menu Button & Page Title */}
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile Menu Button */}
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-all"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div>
            <h2 className="text-base lg:text-xl font-bold text-white">{pageInfo.title}</h2>
            <p className="text-xs lg:text-sm text-gray-400">{pageInfo.subtitle}</p>
          </div>
        </div>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold">
              {getUserInitials()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white">{userData?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400">{userData?.email || 'admin@bsc.com'}</p>
            </div>
            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <p className="text-sm font-medium text-white">{userData?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400 mt-1">{userData?.email || 'admin@bsc.com'}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all text-left"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

