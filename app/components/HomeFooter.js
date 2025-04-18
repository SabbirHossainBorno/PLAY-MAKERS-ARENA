//app/components/HomeFooter.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { IoLogoYoutube } from "react-icons/io";
import { FaFacebookSquare, FaFacebookMessenger, FaInstagramSquare } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";
import { SiGmail } from "react-icons/si";
import { IoCall } from "react-icons/io5";
import { toast } from 'react-toastify';
import { useLoading } from '@/app/components/LoadingSpinner';
import LoadingSpinner from '@/app/components/LoadingSpinner'; // Ensure this import is added

const HomeFooter = () => {
  const [email, setEmail] = useState('');
  const { isLoading, showLoading, hideLoading } = useLoading();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    showLoading();
    const toastId = toast.loading('Subscribing...');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Subscription failed');
      }

      toast.update(toastId, {
        render: '🎉 Please check your email to verify!',
        type: 'success',
        isLoading: false,
        autoClose: 5000
      });
      setEmail('');
    } catch (error) {
      toast.update(toastId, {
        render: error.message,
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      hideLoading();
    }
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {isLoading && <LoadingSpinner />}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          
          {/* Logo and Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/logo/logo.svg" 
                alt="Play Makers Arena" 
                width={48} 
                height={48}
                className="h-12 w-12"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                Play Makers Arena
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Premier futsal destination with professional courts, advanced facilities, 
              and unmatched playing experience.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-3">
              {['About Us', 'Gallery', 'Pricing', 'Careers'].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-400 transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <SiGmail className="h-5 w-5 text-red-500" />
                <span>playmakers@arena.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <IoCall className="h-5 w-5 text-green-500" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Social Media & Newsletter */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connect With Us</h3>
            <div className="flex gap-4">
              {[
                { Icon: FaFacebookSquare, color: '#1877F2', link: '#' },
                { Icon: FaFacebookMessenger, color: '#0084FF', link: '#' },
                { Icon: FaInstagramSquare, color: '#E4405F', link: '#' },
                { Icon: AiFillTikTok, color: '#000000', link: '#' },
                { Icon: IoLogoYoutube, color: '#FF0000', link: '#' },
              ].map((social, index) => (
                <motion.a 
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all"
                >
                  <social.Icon className="h-6 w-6" style={{ color: social.color }} />
                </motion.a>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Newsletter</h3>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:bg-gray-800"
                  disabled={isLoading}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-lime-500 text-white rounded-lg font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Subscribe'}
                </motion.button>
              </form>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center">
          <a 
            href="http://159.223.143.64/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-blue-400 transition-colors text-sm"
          >
            © {new Date().getFullYear()} PLAY MAKERS ARENA. All rights reserved.
          </a>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;