"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightOnRectangleIcon, ChevronDownIcon } from '@/components/icons';

interface UserData {
  name: string;
  email: string;
  role: string;
}

export default function AdminHeader() {
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

  return (
    <header className="sticky top-0 z-30 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Page Title - akan diisi oleh parent */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
          <p className="text-sm text-gray-400">Kelola semua aktivitas sistem</p>
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

