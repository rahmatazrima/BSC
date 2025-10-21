import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div>
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
              Join Us Today!
            </h2>
            <p className="text-gray-300 text-lg">
              Create your account and experience the best mobile repair service.
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
            <p className="text-gray-400 mt-2">Create your account</p>
          </div>

          {/* Glass morphism form */}
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
            
            <div className="relative z-10">
              <form className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm"
                      required
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm"
                      required
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm"
                      required
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
                      placeholder="Enter your password"
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm"
                      required
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Confirm your password"
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm"
                      required
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  className="group relative w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 mt-6"
                >
                  <span className="relative z-10">Create Account</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="px-4 text-gray-400 text-sm">or</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              {/* Login link */}
              <div className="text-center">
                <p className="text-gray-400">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                    Sign In
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