'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  ArrowRight,
  Zap
} from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-purple-300 animate-ping"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-scroll bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden flex items-center">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-purple-900/5 to-pink-900/5"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto flex justify-center px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center justify-center items-center mb-20 w-[95%] lg:w-4/5 mx-auto flex flex-col gap-y-6 lg:gap-y-10 !mt-16 !lg:mt-0 ">
            {/* Enhanced Badge */}
            <div className="inline-flex w-max mx-auto items-center !px-6 !py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full text-sm font-semibold mb-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <Zap className="w-4 h-4 mr-2 text-blue-600" />
              Smart Job Matching Platform
            </div>

            {/* Enhanced Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 !lg:mb-8 !lg:leading-[0.9] !tracking-tight">
              <span className='hidden lg:block'>Discover jobs</span> <span className='lg:hidden'>Discover jobs </span>
              <span className="hidden lg:block bg-gradient-to-r from-[#0e3e33] via-[#0e3e33] to-[#0b2b29] bg-clip-text text-transparent animate-pulse">
               for you
              </span>
              <span className='lg:hidden block bg-gradient-to-r from-[#0e3e33] via-[#0e3e33] to-[#0b2b29] bg-clip-text text-transparent animate-pulse'>for you</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-light">
               Join thousands of   <span className="font-semibold text-gray-800">professionals</span> who have found their dream jobs through our <span className='lg:block'>perfect job matching platform.</span> 
            </p>

            {/* Enhanced CTA Buttons */}
            {!user && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 ">
                <Link
                  href="/auth/register"
                  className="group relative bg-gradient-to-r from-[#0e3e33] via-[#0e3e33] to-[#0b2b29] text-white !px-8 !py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 hover:scale-110 transition-all duration-500 flex items-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0e3e33] via-[#0e3e33] to-[#0b2b29] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10">Find Your Dream Job</span>
                  <ArrowRight className="relative z-10 ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                </Link>
                <Link
                  href="/jobs"
                  className="group border-2 border-gray-300 bg-white/80 backdrop-blur-sm text-gray-700 !px-8 !py-4 rounded-2xl font-semibold text-lg hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 hover:shadow-xl transition-all duration-300"
                >
                  Browse Jobs
                </Link>
              </div>
            )}

            {/* Enhanced Demo Cards */}

          </div>
        </div>
      </section>

    </div>
  );
}
