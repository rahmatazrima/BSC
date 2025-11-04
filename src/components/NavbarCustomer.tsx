"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

interface UserData {
  name: string;
  email: string;
  role: string;
}

export default function NavbarCustomer() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data.data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
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

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Check if link is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData?.name) return 'U';
    return userData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 lg:px-12 py-4 bg-black/90 backdrop-blur-md shadow-xl border-b border-gray-800">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
        <Image
          src="/logoo.png"
          alt="Bukhari Service Center"
          width={40}
          height={40}
        />
        <div>
          <span className="font-bold text-xl text-white hidden sm:block">
            Bukhari Service Center
          </span>
          <span className="font-bold text-lg text-white sm:hidden">
            BSC
          </span>
        </div>
      </Link>

      {/* Navigation Menu & User Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            href="/booking" 
            className={`text-xs sm:text-sm font-medium transition-colors ${
              isActive('/booking')
                ? 'text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Reservasi
          </Link>
          <Link 
            href="/tracking" 
            className={`text-xs sm:text-sm font-medium transition-colors ${
              isActive('/tracking')
                ? 'text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Lacak Status
          </Link>
          <Link 
            href="/history" 
            className={`text-xs sm:text-sm font-medium transition-colors ${
              isActive('/history')
                ? 'text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Riwayat
          </Link>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
          >
            {/* User Avatar */}
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                getUserInitials()
              )}
            </div>

            {/* User Name (hidden on mobile) */}
            {!isLoading && userData && (
              <span className="hidden md:block text-white font-medium text-sm">
                {userData.name.split(' ')[0]}
              </span>
            )}

            {/* Dropdown Icon */}
            <svg
              className={`w-4 h-4 text-gray-300 transition-transform duration-300 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
              {/* User Info */}
              {userData && (
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-white font-semibold text-sm">{userData.name}</p>
                  <p className="text-gray-400 text-xs mt-1">{userData.email}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                    User
                  </span>
                </div>
              )}

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm">Profil Saya</span>
                </Link>

                <Link
                  href="/history"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Riwayat Pesanan</span>
                </Link>
              </div>

              {/* Logout Button */}
              <div className="border-t border-white/10 p-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-medium">Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
}