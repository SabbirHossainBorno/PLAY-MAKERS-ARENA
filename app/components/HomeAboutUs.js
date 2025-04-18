//app/components/HomeAboutUs.js
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const slides = [
  {
    id: 1,
    image: '/images/about_us/about_us-1.jpg',
    title: 'Indoor Facility'
  },
  {
    id: 2,
    image: '/images/about_us/about_us-2.jpg',
    title: 'A Place For All'
  },
  {
    id: 3,
    image: '/images/about_us/about_us-3.jpg',
    title: 'Academy'
  },
  {
    id: 4,
    image: '/images/about_us/about_us-4.jpg',
    title: 'Community Hub'
  }
];

const features = [
  {
    title: 'Indoor Facility',
    description: 'Climate-controlled professional courts with advanced shock-absorbent flooring and FIFA-certified turf',
    icon: '🏟️'
  },
  {
    title: 'A Place For All',
    description: 'Inclusive environment with dedicated spaces for players of all ages and skill levels',
    icon: '🤝'
  },
  {
    title: 'Academy',
    description: 'Professional coaching programs led by certified trainers with international experience',
    icon: '⚽'
  }
];

const HomeAboutUs = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
        {/* Image Slider */}
        <motion.div 
          className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <Image
                src={slides[activeIndex].image}
                alt={slides[activeIndex].title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60">
                <h3 className="text-2xl font-bold text-white">
                  {slides[activeIndex].title}
                </h3>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Navigation */}
          <div className="absolute bottom-6 right-6 flex gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 w-8 rounded-full transition-all ${
                  activeIndex === index ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Key Points */}
        <motion.div 
          className="flex flex-col justify-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
            Our World-Class Facility
          </h2>
          
          <div className="space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                whileHover={{ x: 10 }}
                className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-xl">
                    {feature.icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-12 w-fit px-8 py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Explore More Features
          </motion.button>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
  <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
  <div className="absolute bottom-20 -right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>
    </section>
  );
};

export default HomeAboutUs;