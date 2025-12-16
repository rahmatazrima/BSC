import React from 'react';
import { DevicePhoneMobileIcon } from './icons';

const devices = [
  { name: 'Samsung', desc: 'Galaxy Series' },
  { name: 'OPPO', desc: 'Find & A Series' },
  { name: 'Xiaomi', desc: 'Mi & Redmi' },
  { name: 'Vivo', desc: 'V & Y Series' },
  { name: 'Realme', desc: 'GT & Number Series' },
  { name: 'iPhone', desc: 'All Models' },
  { name: 'Infinix', desc: 'Note & Hot Series' },
  { name: 'Tecno', desc: 'Spark & Camon' },
  { name: 'POCO', desc: 'X & F Series' },
  { name: 'Huawei', desc: 'P & Nova Series' },
];

export default function DeviceSupportSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-black to-gray-900 relative">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-20 h-20 bg-blue-600/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-purple-600/10 rounded-full blur-xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Merek Smartphone
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              yang Kami Layani
            </span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 leading-relaxed">
            Kami melayani perbaikan untuk 10 merek smartphone paling populer di Indonesia 
            dengan teknisi berpengalaman dan suku cadang original
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6 max-w-6xl mx-auto">
          {devices.map((d, i) => (
            <div key={i} className="group relative">
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5 sm:p-6 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
                <div className="text-center">
                  {/* Icon */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <DevicePhoneMobileIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  
                  {/* Brand Name */}
                  <h3 className="font-bold text-white text-sm sm:text-base mb-1">{d.name}</h3>
                  
                  {/* Description */}
                  <p className="text-gray-400 text-xs">{d.desc}</p>
                </div>
                
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
