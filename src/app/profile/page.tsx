"use client";

import React, { useState, useEffect } from 'react';
import NavbarCustomer from '@/components/NavbarCustomer';

interface UserData {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
        <NavbarCustomer />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      <NavbarCustomer />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Profil Saya</h1>

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          {/* Avatar */}
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-white/10">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-xl">
              {userData?.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{userData?.name}</h2>
              <p className="text-gray-300">{userData?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30">
                {userData?.role}
              </span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Nama Lengkap</label>
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                {userData?.name}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                {userData?.email}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Nomor Telepon</label>
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                {userData?.phoneNumber}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Bergabung Sejak</label>
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
              </div>
            </div>
          </div>

          {/* Edit Button (Optional) */}
          <div className="mt-8">
            <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg">
              Edit Profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}