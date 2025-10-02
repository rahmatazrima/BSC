import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-blue-900/20 to-black border-t border-white/10">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <Image
                src="/logoo.png"
                alt="Bukhari Service Center"
                width={48}
                height={48}
                className="rounded-full"
              />
              <span className="font-bold text-xl text-white">
                Bukhari Service Center
              </span>
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Mitra terpercaya untuk perbaikan dan perawatan perangkat mobile Anda. 
              Layanan profesional dengan teknologi terkini.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-600 transition-all duration-300"
              >
                <span className="text-sm">📷</span>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-green-600 transition-all duration-300"
              >
                <span className="text-sm">📱</span>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-500 transition-all duration-300"
              >
                <span className="text-sm">📧</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Quick Links
              </span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300">
                  Book Service
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Hubungi Kami
              </span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-blue-400 text-xs">📍</span>
                </div>
                <div>
                  <p className="text-gray-300 leading-relaxed">
                    Jln. Pootemarohoan, Lamteh<br />
                    Banda Aceh, Indonesia
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 text-xs">📞</span>
                </div>
                <a href="tel:+6282219635738" className="text-gray-300 hover:text-white transition-colors">
                  +62 822 1963 5738
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 text-xs">✉️</span>
                </div>
                <a href="mailto:rahmatazirme@gmail.com" className="text-gray-300 hover:text-white transition-colors">
                  rahmatazirme@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="font-bold text-lg text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Jam Operasional
              </span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Senin - Jumat</span>
                <span className="text-white font-medium">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Sabtu</span>
                <span className="text-white font-medium">10:00 - 16:00</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-300">Minggu</span>
                <span className="text-red-400 font-medium">Tutup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2025 Bukhari Service Center. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
