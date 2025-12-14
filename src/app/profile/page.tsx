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

interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phoneNumber?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData(data.data.user);
        setFormData({
          name: data.data.user.name,
          email: data.data.user.email,
          phoneNumber: data.data.user.phoneNumber,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validasi nama
    if (!formData.name.trim()) {
      newErrors.name = 'Nama tidak boleh kosong';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nama minimal 3 karakter';
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email tidak boleh kosong';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validasi nomor telepon
    const phoneRegex = /^[0-9]{10,15}$/;
    const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, '');
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Nomor telepon tidak boleh kosong';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phoneNumber = 'Nomor telepon harus 10-15 digit angka';
    }

    // Validasi password (opsional - hanya jika user ingin mengubah password)
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Password lama harus diisi';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'Password baru harus diisi';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password baru minimal 6 karakter';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Konfirmasi password harus diisi';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSave = async () => {
    // Validasi form
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Prepare payload - only include password fields if they're filled
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      };

      if (formData.currentPassword && formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(data.data.user);
        setIsEditing(false);
        setSuccessMessage(data.data.passwordChanged ? 'Profile dan password berhasil diperbarui!' : 'Profile berhasil diperbarui!');
        
        // Reset password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        // Auto hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        // Handle error dari server
        if (data.message) {
          if (data.message.includes('email')) {
            setErrors({ email: data.message });
          } else if (data.message.includes('password') || data.message.includes('Password')) {
            setErrors({ currentPassword: data.message });
          } else {
            setErrors({ name: data.message });
          }
        }
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrors({ name: 'Gagal memperbarui profile. Silakan coba lagi.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setErrors({});
    setSuccessMessage('');
    setIsEditing(false);
  };

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

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300 flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        )}

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
            {/* Nama Lengkap */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Nama Lengkap</label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border ${
                      errors.name ? 'border-red-500' : 'border-white/10'
                    } rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors`}
                    placeholder="Masukkan nama lengkap"
                  />
                  {errors.name && (
                    <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.name}
                    </p>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                  {userData?.name}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border ${
                      errors.email ? 'border-red-500' : 'border-white/10'
                    } rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors`}
                    placeholder="Masukkan email"
                  />
                  {errors.email && (
                    <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                  {userData?.email}
                </div>
              )}
            </div>

            {/* Nomor Telepon */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Nomor Telepon</label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border ${
                      errors.phoneNumber ? 'border-red-500' : 'border-white/10'
                    } rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors`}
                    placeholder="Masukkan nomor telepon"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                  {userData?.phoneNumber}
                </div>
              )}
            </div>

            {/* Bergabung Sejak */}
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

            {/* Password Section (only in edit mode) */}
            {isEditing && (
              <div className="pt-6 mt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Ubah Password (Opsional)</h3>
                <p className="text-sm text-gray-400 mb-4">Kosongkan jika tidak ingin mengubah password</p>
                
                {/* Password Lama */}
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Password Lama</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border ${
                      errors.currentPassword ? 'border-red-500' : 'border-white/10'
                    } rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors`}
                    placeholder="Masukkan password lama"
                  />
                  {errors.currentPassword && (
                    <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                {/* Password Baru */}
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Password Baru</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border ${
                      errors.newPassword ? 'border-red-500' : 'border-white/10'
                    } rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors`}
                    placeholder="Masukkan password baru (min. 6 karakter)"
                  />
                  {errors.newPassword && (
                    <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Konfirmasi Password Baru */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-white/10'
                    } rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors`}
                    placeholder="Masukkan ulang password baru"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8">
            {isEditing ? (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Simpan Perubahan
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 bg-white/10 text-white py-3 px-6 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}