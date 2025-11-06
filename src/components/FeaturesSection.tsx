import React from 'react';

const features = [
  {
    title: 'Expert Repairs',
    desc: 'Berpengalaman dalam menangani berbagai kerusakan perangkat, kami merawat gadget Anda dengan sepenuh hati agar kembali seperti baru.',
    points: ['Teknisi Berpengalaman', 'Suku Cadang Berkualitas', 'Jaminan Kualitas'],
    icon: '🛠️',
    gradient: 'from-blue-600 to-blue-800',
  },
  {
    title: 'Real-time Updates',
    desc: 'Pantau perkembangan perbaikan perangkat Anda secara real-time melalui sistem pelacakan canggih dan portal pelanggan kami.',
    points: ['Update Status Real-Time', 'Progres Perbaikan', 'Transparansi Biaya'],
    icon: '⏱️',
    gradient: 'from-purple-600 to-blue-600',
  },
  {
    title: 'On-side Service',
    desc: 'Nikmati layanan perbaikan langsung di lokasi Anda. Teknisi kami datang ke tempat Anda untuk solusi cepat, praktis, dan tanpa ribet.',
    points: ['Teknisi Datang ke Lokasi Anda', 'Perbaikan Langsung Tanpa Ribet', 'Hemat Waktu & Praktis'],
    icon: '🚗',
    gradient: 'from-cyan-600 to-blue-600',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-600/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-600/10 rounded-full blur-xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Kenapa Harus 
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Bukhari Service Center?
            </span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-4">
            Kami menghadirkan layanan perbaikan gadget yang lengkap dan menyeluruh, 
            dikerjakan oleh teknisi berpengalaman dengan standar kualitas tinggi. 
            Kepuasan Anda adalah prioritas utama kami di setiap proses perbaikan.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((f, i) => (
            <div key={i} className="group relative">
              {/* Card */}
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 hover:border-blue-500/50 transition-all duration-500 hover:transform hover:scale-105">
                {/* Icon with gradient background */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r ${f.gradient} rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                
                <h3 className="font-bold text-lg sm:text-xl text-white mb-3 sm:mb-4">{f.title}</h3>
                <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">{f.desc}</p>
                
                <ul className="space-y-2 sm:space-y-3">
                  {f.points.map((p, idx) => (
                    <li key={idx} className="flex items-center text-gray-400 text-xs sm:text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                      {p}
                    </li>
                  ))}
                </ul>
                
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
