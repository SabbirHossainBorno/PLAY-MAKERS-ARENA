// components/HomeTestimonial.js

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    name: "Alex Martinez",
    role: "Pro Futsal Player",
    text: "The best facilities I've ever trained at. The smart court technology helped me improve my game analytics dramatically.",
    avatar: "/images/testimonials/1.jpg",
    rating: 5
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Youth Team Coach",
    text: "Our team's performance transformed after joining the academy. The professional coaching staff is exceptional.",
    avatar: "/images/testimonials/2.jpg",
    rating: 4
  },
  {
    id: 3,
    name: "Raj Patel",
    role: "League Organizer",
    text: "Perfect venue for tournaments. The modular court system allows for seamless event management.",
    avatar: "/images/testimonials/3.jpg",
    rating: 5
  },
  {
    id: 4,
    name: "Emily Chen",
    role: "Fitness Trainer",
    text: "State-of-the-art equipment and always clean facilities. My clients love training here.",
    avatar: "/images/testimonials/4.jpg",
    rating: 4
  },
  {
    id: 5,
    name: "Marcus Lee",
    role: "Sports Parent",
    text: "My kids have developed both skills and confidence through the excellent youth programs.",
    avatar: "/images/testimonials/5.jpg",
    rating: 5
  }
];

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1 mt-4">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          className={`w-6 h-6 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const HomeTestimonial = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isHovered, setIsHovered] = useState(false);
  
    // Auto-rotation logic
    useEffect(() => {
      if (!isHovered) {
        const interval = setInterval(() => {
          setDirection(1);
          setCurrentIndex(prev => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
      }
    }, [isHovered]);
  
    const nextTestimonial = () => {
      setDirection(1);
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    };
  
    const prevTestimonial = () => {
      setDirection(-1);
      setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
    };
  
    const springConfig = {
      type: "spring",
      damping: 20,
      stiffness: 100
    };
  
    const cardVariants = {
      enter: (direction) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        scale: 0.8,
        rotateY: direction > 0 ? 45 : -45
      }),
      center: {
        x: 0,
        opacity: 1,
        scale: 1,
        rotateY: 0,
        transition: { ...springConfig }
      },
      exit: (direction) => ({
        x: direction > 0 ? -300 : 300,
        opacity: 0,
        scale: 0.8,
        rotateY: direction > 0 ? -45 : 45,
        transition: { ...springConfig }
      })
    };
  
    return (
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              Voices of Success
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Hear from our champions about their Play Makers Arena experience
            </p>
          </motion.div>
  
          <div 
            className="relative h-[600px] md:h-[400px] lg:h-[500px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Animated Background Elements */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 rounded-3xl"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />
  
            <div className="relative h-full flex items-center">
              <AnimatePresence mode='popLayout' initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute w-full max-w-4xl mx-auto left-0 right-0 px-4"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all border border-white/10 backdrop-blur-lg">
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
                      <div className="relative h-32 w-32 shrink-0">
                        <Image
                          src={testimonials[currentIndex].avatar}
                          alt={testimonials[currentIndex].name}
                          fill
                          className="rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl"
                        />
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold dark:text-white">
                          {testimonials[currentIndex].name}
                        </h3>
                        <p className="text-sm text-blue-500 dark:text-blue-400 mt-2">
                          {testimonials[currentIndex].role}
                        </p>
                        <StarRating rating={testimonials[currentIndex].rating} />
                      </div>
                    </div>
                    
                    <blockquote className="relative pl-8 border-l-4 border-green-500">
                      <p className="text-lg text-gray-600 dark:text-gray-300 italic leading-relaxed">
                        &quot;{testimonials[currentIndex].text}&quot;
                      </p>
                    </blockquote>

                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
  
            {/* Navigation Controls */}
            <button 
              onClick={prevTestimonial}
              className="absolute top-1/2 left-4 md:-left-16 transform -translate-y-1/2 p-3 rounded-xl bg-white/80 dark:bg-gray-800/90 shadow-xl hover:shadow-2xl transition-all backdrop-blur-sm hover:scale-110"
            >
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              onClick={nextTestimonial}
              className="absolute top-1/2 right-4 md:-right-16 transform -translate-y-1/2 p-3 rounded-xl bg-white/80 dark:bg-gray-800/90 shadow-xl hover:shadow-2xl transition-all backdrop-blur-sm hover:scale-110"
            >
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
  
          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <motion.div
                key={index}
                className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative"
                style={{ width: 80 }}
                onClick={() => setCurrentIndex(index)}
              >
                <motion.div
                  className="absolute left-0 top-0 h-full bg-blue-500"
                  animate={{
                    width: currentIndex === index ? '100%' : '0%'
                  }}
                  transition={{
                    duration: currentIndex === index ? 5 : 0,
                    ease: 'linear'
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
  
        {/* Decorative Gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-48 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-green-500/10 rounded-full blur-[100px]" />
        </div>
      </section>
    );
  };
  
  export default HomeTestimonial;