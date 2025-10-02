"use client";

import React, { useState, useEffect } from 'react';

const testimonials = [
  {
    name: 'John Doe',
    text: 'Layanan servis di Bukhari Samsung Galaxy saya diperbaiki hanya dalam beberapa jam. Sangat profesional dan transparan dalam menjelaskan proses perbaikannya.',
    rating: 5,
    initials: 'JD',
    position: 'CEO Startup Tech',
  },
  {
    name: 'Alice Smith',
    text: 'Update real-time-nya luar biasa! Saya selalu tahu di mana proses perbaikan perangkat saya. Komunikasinya juga sangat baik!',
    rating: 5,
    initials: 'AS',
    position: 'Marketing Manager',
  },
  {
    name: 'Mike Johnson',
    text: 'Layanan cepat, on-site, dan profesional. Layer fisik gadget diperbaiki dan hasilnya seperti baru lagi. Sangat saya rekomendasikan!',
    rating: 5,
    initials: 'MJ',
    position: 'Software Developer',
  },
  {
    name: 'Sarah Wilson',
    text: 'iPhone saya rusak total setelah jatuh. Tim Bukhari berhasil memperbaikinya dengan sempurna, bahkan lebih cepat dari estimasi awal. Pelayanan terbaik!',
    rating: 5,
    initials: 'SW',
    position: 'Graphic Designer',
  },
  {
    name: 'David Chen',
    text: 'Perbaikan laptop gaming saya ditangani dengan sangat hati-hati. Teknisinya ahli dan memberikan garansi yang memuaskan. Highly recommended!',
    rating: 5,
    initials: 'DC',
    position: 'Game Streamer',
  },
  {
    name: 'Maya Putri',
    text: 'Servis tablet untuk anak saya sangat memuaskan. Harga terjangkau, hasil berkualitas, dan customer service yang ramah. Terima kasih Bukhari!',
    rating: 5,
    initials: 'MP',
    position: 'Ibu Rumah Tangga',
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume autoplay after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-20 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-20 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Pengalaman Pelanggan
            </span>
            <br />
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Bersama Kami
            </span>
          </h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-8">
            Kami bangga menjadi pilihan terpercaya bagi banyak pelanggan, dan inilah cerita mereka:
          </p>
        </div>
        
        {/* Slider Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-50 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-50 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Testimonial Cards */}
          <div className="relative overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 lg:p-12">
                    {/* Quote mark */}
                    <div className="text-6xl text-blue-500/20 font-serif mb-6">"</div>
                    
                    {/* Testimonial text */}
                    <p className="text-gray-300 text-lg lg:text-xl leading-relaxed italic mb-8">
                      {testimonial.text}
                    </p>
                    
                    {/* Avatar and Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg">
                        {testimonial.initials}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-lg">{testimonial.name}</h4>
                        <p className="text-gray-400 text-sm">{testimonial.position}</p>
                        <div className="flex gap-1 mt-2">
                          {Array.from({ length: testimonial.rating }).map((_, idx) => (
                            <span key={idx} className="text-yellow-400 text-lg">★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-blue-500 w-8'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="w-full bg-gray-700/50 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / testimonials.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
