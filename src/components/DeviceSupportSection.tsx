import React from 'react';

const devices = [
  'Apple', 'OPPO', 'Samsung', 'Huawei', 'vivo', 'Xiaomi', 'realme', 'Redmi', 'POCO', 'Infinix', 'Itel', 'And More'
];

export default function DeviceSupportSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900 relative">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-20 h-20 bg-blue-600/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-purple-600/10 rounded-full blur-xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Dukungan
            </span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent ml-3">
              Perangkat
            </span>
          </h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
            Kami melayani berbagai merek ponsel dengan presisi dan keandalan tinggi
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
          {devices.map((d, i) => (
            <div key={i} className="group relative">
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                  <h3 className="font-semibold text-white text-sm">{d}</h3>
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
