'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetUsers = async () => {
    try {
      const response = await fetch('/api/user'); // Ganti dari /api/users ke /api/user
      const data = await response.json();
      console.log('User data:', data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    handleGetUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Login berhasil
        console.log('🎉 LOGIN SUCCESS:', data);
        console.log('👤 User Info:', data.data.user);
        console.log('🔑 Token:', data.data.token);
        console.log('✅ Message:', data.message);
        
        // Optional: Redirect ke dashboard atau home
        // window.location.href = '/dashboard';
        
        // Reset form
        setFormData({ email: '', password: '' });
        
        window.location.href = '/admin';
      } else {
        // Login gagal
        console.error('❌ LOGIN ERROR:', data);
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ FETCH ERROR:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-purple-600/20 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 max-w-md text-center">
          {/* Main illustration */}
          <div className="relative w-96 h-96 mx-auto mb-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-full blur-xl"></div>
            <Image
              src="/hhh.png"
              alt="Bukhari Service Center Illustration"
              width={400}
              height={400}
              className="object-contain relative z-10 drop-shadow-2xl"
            />
          </div>
          
          {/* Welcome Text */}
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Welcome Back!
            </h2>
            <p className="text-gray-300 text-lg">
              Your trusted partner for mobile device repairs and maintenance.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
        </div>
        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur-lg opacity-30"></div>
                <Image
                  src="/logoo.png"
                  alt="Bukhari Service Center"
                  width={80}
                  height={80}
                  className="relative z-10 drop-shadow-2xl"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Bukhari Service Center
            </h1>
            <p className="text-gray-400 mt-2">Sign in to your account</p>
          </div>

          {/* Glass morphism form */}
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
            
            <div className="relative z-10">
              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>

                {/* Remember me and Forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/20 bg-white/10 rounded"
                      disabled={loading}
                    />
                    <span className="ml-2 text-sm text-gray-300">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot Password?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="relative z-10">
                    {loading ? 'Signing In...' : 'Sign In'}
                  </span>
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="px-4 text-gray-400 text-sm">or</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              {/* Sign Up link */}
              <div className="text-center">
                <p className="text-gray-400">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}