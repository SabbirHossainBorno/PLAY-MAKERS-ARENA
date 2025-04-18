//app/page.js
"use client";

import { useEffect } from 'react';
import HomeNavbar from './components/HomeNavbar';
import HomeHero from './components/HomeHero';
import HomeFooter from './components/HomeFooter';
import HomeContactUs from './components/HomeContactUs';
import HomeAboutUs from './components/HomeAboutUs';
import HomeAddressMap from './components/HomeAddressMap';
import HomeTestimonial from './components/HomeTestimonial';
import HomeClient from './components/HomeClient';
import HomeNews from './components/HomeNews';
import { motion } from 'framer-motion';
import Image from 'next/image';
import LoadingSpinner, { useLoading } from '@/app/components/LoadingSpinner';

export default function Home() {
  const { isLoading, showLoading, hideLoading } = useLoading();

  useEffect(() => {
    let timeoutId;

    showLoading();

    timeoutId = setTimeout(() => {
      hideLoading();
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      hideLoading();
    };
  }, [showLoading, hideLoading]);

  return (
    <div className="bg-white dark:bg-gray-900">
      {isLoading && <LoadingSpinner global />}
      <HomeNavbar />
      <HomeHero />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="container mx-auto px-4 py-24"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Elevate Your Game
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Immerse yourself in world-class facilities designed by athletes, for athletes. 
              Our innovative court technology and professional training programs help you 
              reach peak performance.
            </p>
          </div>

          <motion.div 
            className="grid md:grid-cols-3 gap-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[
              { 
                title: 'Pro Courts', 
                icon: '⚽', 
                text: 'FIFA-certified flooring with advanced shock absorption' 
              },
              { 
                title: 'Smart Lighting', 
                icon: '💡', 
                text: 'Dynamic LED systems adapting to game intensity' 
              },
              { 
                title: 'Training Tech', 
                icon: '🏋️', 
                text: 'VR simulation and motion tracking analytics' 
              }
            ].map((feature) => (
              <motion.div 
                key={feature.title}
                whileHover={{ y: -10 }}
                className="p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl hover:shadow-3xl transition-all"
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4 dark:text-white">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>
          <HomeNews />

          <div className="mt-24 relative bg-gray-900 rounded-3xl overflow-hidden">
            <Image 
              src="/images/cta-bg.jpg"
              alt="CTA Background"
              width={1920}
              height={1080}
              className="object-cover absolute inset-0 opacity-40"
              style={{ position: 'absolute', height: '100%', width: '100%' }}
            />
            <div className="relative z-10 text-center py-12 md:py-20 px-4">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Play?
              </h3>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join our community of passionate players and experience the 
                future of futsal today.
              </p>

              {/* Timing Section */}
              <div className="mb-8 md:mb-12 p-4 md:p-6 backdrop-blur-lg bg-white/5 rounded-2xl border border-white/10 mx-auto max-w-4xl overflow-hidden">
                <h4 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6">Opening Hours</h4>
                <div className="overflow-x-auto pb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 md:gap-4 min-w-[300px] md:min-w-0">
                    {[
                      { day: 'Saturday', short: 'Sat' },
                      { day: 'Sunday', short: 'Sun' },
                      { day: 'Monday', short: 'Mon' },
                      { day: 'Tuesday', short: 'Tue' },
                      { day: 'Wednesday', short: 'Wed' },
                      { day: 'Thursday', short: 'Thu' },
                      { day: 'Friday', short: 'Fri' }
                    ].map(({ day, short }) => (
                      <div
                        key={day}
                        className="p-3 md:p-4 bg-white/5 rounded-lg md:rounded-xl border border-white/10"
                      >
                        <div className="text-center">
                          <span className="text-sm md:text-base font-bold text-blue-400 block sm:hidden">
                            {short}
                          </span>
                          <span className="text-sm md:text-base font-bold text-blue-400 hidden sm:block">
                            {day}
                          </span>
                          <div className="mt-1 md:mt-2">
                            <div className="md:hidden text-xs text-gray-300">
                              12:30 AM - 11:00 PM
                            </div>
                            <div className="hidden md:block">
                              <span className="text-xs md:text-sm text-gray-300 block">12:30 AM</span>
                              <span className="text-lg md:text-xl text-white">-</span>
                              <span className="text-xs md:text-sm text-gray-300 block">11:00 PM</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-400 mt-3 md:mt-4 text-center">
                  * Open 24/7 for online bookings
                </p>
              </div>

              <button
                className="text-base md:text-lg font-bold bg-gradient-to-r from-blue-500 to-green-500 px-8 py-3 md:px-12 md:py-4 rounded-full text-white shadow-xl transition-all"
              >
                Book Your Session Now
              </button>
            </div>
          </div>
        </div>

      </motion.div>
      <HomeAboutUs />
      <HomeAddressMap />
      <HomeTestimonial />
      <HomeClient />
      <HomeContactUs />
      <HomeFooter />

    </div>
  );
}