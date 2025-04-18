//app/components/HomeClient.js
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const brands = [
  { id: 1, name: 'Nike', logo: '/images/brands/NIKE_Logo.svg' },
  { id: 2, name: 'Adidas', logo: '/images/brands/Adidas_Logo.svg' },
  { id: 3, name: 'Puma', logo: '/images/brands/Puma_Logo.svg' },
  { id: 4, name: 'New Balance', logo: '/images/brands/New_Balance_Logo.svg' },
  { id: 5, name: 'Under Armour', logo: '/images/brands/Under_Armour_Logo.svg' },
  { id: 6, name: 'Joma', logo: '/images/brands/Joma_Logo.svg' },
  { id: 7, name: 'Umbro', logo: '/images/brands/Umbro_Logo.svg' },
  { id: 8, name: 'Kelme', logo: '/images/brands/Kelme_Logo.svg' },
  { id: 9, name: 'Bashundhara Group', logo: '/images/brands/Bashundhara_Group_Logo.svg' },
  { id: 10, name: 'BAFUFE', logo: '/images/brands/BAFUFE_Logo.svg' },
  { id: 11, name: 'Aquafina', logo: '/images/brands/Aquafina_Logo.svg' },
];

const HomeClient = () => {
  return (
    <div className="relative py-12 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h3 
          className="text-center text-xl font-bold text-gray-500 dark:text-gray-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Trusted by Elite Organizations
        </motion.h3>

        {/* Double instance for seamless loop */}
        <div className="relative h-[80px] overflow-hidden group">
        <motion.div
            className="absolute flex gap-16 items-center h-full" // Added h-full here
            animate={{ x: ['0%', '-100%'] }}
            transition={{ 
              duration: 40,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            {[...brands, ...brands].map((brand, index) => (
              <div 
                key={`${brand.id}-${index}`}
                className="relative h-20 w-32 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center" // Increased height
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain !object-center dark:invert" // Added object-center
                  priority
                  style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            ))}
          </motion.div>

        </div>

        {/* Animated dots pattern */}
        <motion.div
          className="absolute inset-0 -z-10 opacity-10 dark:opacity-20"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundImage: `radial-gradient(circle at center, currentColor 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />
      </div>
    </div>
  );
};

export default HomeClient;
