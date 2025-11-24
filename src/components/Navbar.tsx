import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 lg:px-12 py-4 bg-black/90 backdrop-blur-md shadow-xl border-b border-gray-800 sticky top-0 z-50">
      <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
        <Image
          src="/logoo.png"
          alt="Bukhari Service Center"
          width={40}
          height={40}
          unoptimized={true}
        />
        <span className="font-bold text-xl text-white hidden sm:block">
          Bukhari Service Center
        </span>
        <span className="font-bold text-lg text-white sm:hidden">
          BSC
        </span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/login" className="text-gray-300 hover:text-white transition-colors font-medium text-xs sm:text-sm">
          Login
        </Link>
        <Link href="/register" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/25 font-medium text-xs sm:text-sm">
          Register
        </Link>
      </div>
    </nav>
  );
}
