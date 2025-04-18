//app/components/HomeHero.js
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const images = [
  "/images/hero/hero-1.jpg",
  "/images/hero/hero-2.jpg",
  "/images/hero/hero-3.jpg",
  "/images/hero/hero-4.jpg",
];

const HomeHero = () => {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(nextImage, 6000);
    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const imageVariants = {
    enter: { opacity: 0, scale: 1.1, x: '-5%' },
    center: { opacity: 1, scale: 1, x: '0%' },
    exit: { opacity: 0, scale: 0.95, x: '5%' }
  };

  const dotVariants = {
    hover: { scale: 1.3 },
    active: { scale: 1.5, background: 'rgba(255,255,255,1)' }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative h-screen max-h-[800px] overflow-hidden">
      <AnimatePresence mode='popLayout'>
        <motion.div
          key={currentImage}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 1.2,
            ease: [0.33, 1, 0.68, 1]
          }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentImage]}
            alt="Hero Image"
            fill
            priority
            className="object-cover object-center"
            style={{ transform: 'scale(1.01)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
        {images.map((_, index) => (
          <motion.div
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`h-2 w-8 rounded-full cursor-pointer ${
              currentImage === index ? 'bg-white' : 'bg-gray-400/50'
            }`}
            variants={dotVariants}
            whileHover="hover"
            animate={currentImage === index ? "active" : ""}
            transition={{ type: 'spring', stiffness: 300 }}
          />
        ))}
      </div>

      {/* Next Button */}
      <motion.button
        onClick={nextImage}
        className="absolute right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full"
        whileHover={{ 
          scale: 1.1,
          backgroundColor: 'rgba(255,255,255,0.2)'
        }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <motion.div
          animate={{ x: [0, 4, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <ChevronRightIcon className="h-8 w-8 text-white" />
        </motion.div>
      </motion.button>

      {/* Text Content */}
      <div className="absolute bottom-24 left-8 right-8 text-center md:text-left">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={textVariants}
          transition={{ delay: 0.4 }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 text-white"
            style={{ textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
          >
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Ultimate
            </span>{' '}
            Futsal Experience
          </motion.h1>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={textVariants}
          transition={{ delay: 0.6 }}
        >
          <motion.p
            className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto md:mx-0 leading-relaxed"
            whileHover={{ x: 5 }}
            transition={{ type: 'spring' }}
          >
            Where passion meets performance in our premium indoor arenas
            <motion.span
              className="block h-1 bg-gradient-to-r from-blue-400 to-green-400 mt-4 w-24 mx-auto md:mx-0"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 1.2 }}
            />
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeHero;