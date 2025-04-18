//app/components/HomeAddressMap.js
'use client';

import { motion } from 'framer-motion';

const MAP_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.391902168567!2d90.368722!3d23.832809!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c3fd44b5d36d%3A0x5e5b7a5e5b7a5e5b!2sPlay%20Makers%20Arena!5e0!3m2!1sen!2sbd!4v1718444444444!5m2!1sen!2sbd";
const DIRECTIONS_URL = "https://www.google.com/maps/dir/?api=1&destination=Play+Makers+Arena,+Dhaka";

const HomeAddressMap = () => {
  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl overflow-hidden shadow-2xl relative"
        >
          <div className="h-[500px] w-full relative">
            <iframe
              src={MAP_EMBED_URL}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            />
            
            {/* Custom Map Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="animate-pulse">
                <svg 
                  className="w-12 h-12 text-red-500 drop-shadow-lg" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 4.69 7.5 15.5 8.5 15.5s8.5-10.81 8.5-15.5C20.5 3.81 16.69 0 12 0zm0 13c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Direction Button */}
          <motion.a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-6 right-6 bg-white dark:bg-gray-800 px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7"
              />
            </svg>
            Get Directions
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeAddressMap;