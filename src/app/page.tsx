import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import TestimonialsSection from "../components/TestimonialsSection";
import DeviceSupportSection from "../components/DeviceSupportSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="font-sans bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 min-h-screen flex flex-col">
      <Navbar />
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