"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import NavbarCustomer from "./NavbarCustomer";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import TestimonialsSection from "./TestimonialsSection";
import DeviceSupportSection from "./DeviceSupportSection";
import Footer from "./Footer";

export default function HomeClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.status === true && data.data?.isAuthenticated === true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to check auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="font-sans bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 min-h-screen flex flex-col">
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 min-h-screen flex flex-col">
      {isAuthenticated ? <NavbarCustomer /> : <Navbar />}
      <main className="flex flex-col">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <DeviceSupportSection />
      </main>
      <Footer />
    </div>
  );
}

