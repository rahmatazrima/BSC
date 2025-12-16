import React from 'react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative w-full bg-gradient-to-br from-gray-900 via-blue-900 to-black py-16 sm:py-20 md:py-24 lg:py-32 flex flex-col items-center text-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Your Trusted Mobile
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Service Partner
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed px-4">
          Layanan perbaikan profesional, cepat, dan transparan untuk perangkat Anda. 
          Kami hadir untuk menghidupkan kembali gadget Anda dengan keahlian terbaik 
          dan pembaruan real-time di setiap langkahnya.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          <Link 
            href="/booking"
            className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 inline-block w-full sm:w-auto text-center"
          >
            <span className="relative z-10">Yuk, Servis Sekarang!</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          
        </div>
      </div>
      
      {/* Floating Elements - Hidden on mobile */}
      <div className="hidden sm:block absolute top-20 left-10 w-4 h-4 bg-blue-500 rounded-full opacity-60 animate-pulse"></div>
      <div className="hidden sm:block absolute bottom-32 right-16 w-6 h-6 bg-cyan-400 rounded-full opacity-40 animate-bounce"></div>
      <div className="hidden sm:block absolute top-1/2 left-20 w-2 h-2 bg-white rounded-full opacity-30"></div>
    </section>
  );
}
