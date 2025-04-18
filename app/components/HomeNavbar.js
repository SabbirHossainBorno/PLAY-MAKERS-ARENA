//app/components/HomeNavBar.js
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Gallery", path: "/gallery" },
  { name: "Pricing", path: "/pricing" },
  { name: "Career", path: "/careers" },
];

const HomeNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState('');
  const router = useRouter();

  const handleAction = async (type) => {
    setIsLoading(true);
    setLoadingType(type);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (type === 'login') {
        router.push('/login');
      } else if (type === 'book') {
        router.push('/book_now');
      }
    } finally {
      setIsLoading(false);
      setLoadingType('');
    }
  };

  return (
    <>
      {/* Global Loading Spinner */}
      <AnimatePresence>
        {isLoading && (
          <LoadingSpinner type="global" />
        )}
      </AnimatePresence>

    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed w-full top-0 z-50 bg-gray-900/70 backdrop-blur-xl border-b border-gray-700/50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src="/logo/logo.svg" 
                alt="Play Makers Arena" 
                width={48} 
                height={48}
                className="h-12 w-12 group-hover:rotate-[15deg] transition-transform"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                Play Makers Arena
              </span>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <ul className="flex space-x-8">
              {navLinks.map((link) => (
                <motion.li key={link.name} whileHover={{ y: -2 }}>
                  <Link href={link.path} className="relative px-4 py-2 text-gray-300 hover:text-white">
                    {link.name}
                    <span className="absolute inset-x-1 -bottom-1 h-0.5 bg-gradient-to-r from-blue-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity"/>
                  </Link>
                </motion.li>
              ))}
            </ul>
            
            <div className="flex space-x-4 ml-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('login')}
              disabled={isLoading}
              className="relative inline-flex items-center justify-center p-4 px-4 py-2 overflow-hidden font-medium text-indigo-600 transition duration-300 ease-out border-2 border-purple-500 rounded shadow-md group"
            >
              <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-purple-500 group-hover:translate-x-0 ease">
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
              
              <span className="absolute flex items-center justify-center w-full h-full text-purple-500 transition-all duration-300 transform group-hover:translate-x-full ease">
                Login
              </span>
              
              <span className="relative invisible">
                Login
              </span>
            </motion.button>

            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('book')}
              disabled={isLoading}
              className="relative px-4 py-2 overflow-hidden text-sm font-semibold text-green-500 bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded shadow-inner group backdrop-blur-sm"
            >
              <span className="absolute top-0 left-0 w-0 h-0 transition-all duration-200 border-t-2 border-green-500 group-hover:w-full ease-[cubic-bezier(0.4,0,0.2,1)]" />
              <span className="absolute bottom-0 right-0 w-0 h-0 transition-all duration-200 border-b-2 border-green-500 group-hover:w-full ease-[cubic-bezier(0.4,0,0.2,1)]" />
              <span className="absolute top-0 left-0 w-full h-0 transition-all duration-300 delay-100 bg-green-500/20 group-hover:h-full ease-in-out" />
              <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 delay-100 bg-green-500/20 group-hover:h-full ease-in-out" />
              <span className="absolute inset-0 w-full h-full duration-300 delay-150 bg-green-500/30 opacity-0 group-hover:opacity-100" />
              <span className="relative transition-colors duration-300 delay-150 group-hover:text-white dark:group-hover:text-green-100 ease-in-out">
                Book Now
              </span>
            </motion.button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-2 pb-4"
            >
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <motion.li key={link.name} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={link.path}
                      className="block px-3 py-2 text-gray-300 hover:text-white rounded text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
                <li className="mt-4 space-y-2">
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    handleAction('login');
                  }}
                  disabled={isLoading && loadingType === 'login'}
                >
                  {loadingType === 'login' ? 'Loading...' : 'Login'}
                </button>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    handleAction('book');
                  }}
                  disabled={isLoading && loadingType === 'book'}
                >
                  {loadingType === 'book' ? 'Loading...' : 'Book Now'}
                </button>
                </li>
              </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </>
  );
};

export default HomeNavbar;