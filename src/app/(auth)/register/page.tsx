import React from 'react';
import Image from 'next/image';
import RegisterForm from './_components/register-form';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
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
              priority
            />
          </div>
          
          {/* Welcome Text */}
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Join Us Today!
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Create your account and experience the best mobile repair service in town.
            </p>
            
            {/* Features */}
            <div className="mt-8 space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-200 font-medium">Quick & Easy Booking</p>
                  <p className="text-gray-400 text-sm">Book your repair service in just a few clicks</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-200 font-medium">Professional Service</p>
                  <p className="text-gray-400 text-sm">Experienced technicians at your service</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-200 font-medium">Track Your Order</p>
                  <p className="text-gray-400 text-sm">Real-time updates on your repair status</p>
                </div>
              </div>
            </div>
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
          {/* <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur-lg opacity-30"></div>
                <Image
                  src="/logoo.png"
                  alt="Bukhari Service Center"
                  width={80}
                  height={80}
                  className="relative z-10 drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Bukhari Service Center  
            </h1>
            <p className="text-gray-400 mt-2">Create your account</p>
          </div> */}

          {/* Register Form Component */}
          <RegisterForm />
          
          {/* Mobile - Show features */}
          <div className="lg:hidden mt-8 space-y-3">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Quick & Easy Booking</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Professional Service</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Track Your Order</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}