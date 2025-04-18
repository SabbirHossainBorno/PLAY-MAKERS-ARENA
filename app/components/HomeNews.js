//app/components/HomeNews.js
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TbDiscount, TbChevronLeft, TbChevronRight, TbX } from 'react-icons/tb';
import { BsPinAngle } from "react-icons/bs";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const newsItems = [
  {
    id: 1,
    type: 'offer',
    title: 'Summer Training Camp Registration Open',
    excerpt: 'Early bird discount for registrations before June 15th.',
    content: `**Professional Training Program Details:**
    
    - Duration: June 1st - August 31st
    - Daily Schedule:
      * Morning Session (8-10 AM): Technical Skills
      * Evening Session (4-6 PM): Tactical Training
    - Features:
      ✓ FIFA-certified coaches
      ✓ Video analysis sessions
      ✓ Fitness assessments
      ✓ Tournament participation
    
    **Early Bird Benefits (Register before May 31st):**
    - 20% discount on registration
    - Free training kit
    - Priority slot selection`,
    date: '2024-05-28',
    image: '/images/offer/offer-1(2024-05-28).jpeg',
    tags: ['Training', 'Offer']
  },
  {
    id: 2,
    type: 'news',
    title: 'New Turf Installation Complete',
    excerpt: 'State-of-the-art FIFA approved turf now available.',
    content: `**New Turf Specifications:**
    
    - FIFA Quality Pro Certified
    - 55mm pile height with dual-layer shock pad
    - Features:
      ✓ Enhanced player safety
      ✓ Consistent ball roll
      ✓ All-weather durability
      ✓ UV stabilized fibers
    
    **Maintenance Schedule:**
    - Daily brushing
    - Weekly deep cleaning
    - Monthly disinfection
    
    Book now to experience professional-grade playing surface!`,
    date: '2024-05-25',
    image: '/images/news/news-1(2024-05-25).jpeg',
    tags: ['Facility', 'Update']
  },
  {
    id: 3,
    type: 'notice',
    title: 'Maintenance Closure Notice',
    excerpt: 'Field 3 closure from June 1-5.',
    content: `**Maintenance Work Details:**
    
    - Turf Replacement: Full field resurfacing
    - Lighting Upgrade: New LED floodlights
    - Facility Improvements:
      ✓ New seating arrangements
      ✓ Updated locker rooms
      ✓ Enhanced security system
    
    **Alternative Options:**
    - Field 1 & 2 available with 10% discount
    - Night slots extended till 11 PM
    - Free shuttle service from parking area
    
    We appreciate your understanding!`,
    date: '2024-05-20',
    image: '/images/notice/notice-1(2024-05-20).jpeg',
    tags: ['Notice', 'Schedule']
  },
  {
    id: 4,
    type: 'special-offer',
    title: 'Lifetime Membership Offer',
    excerpt: 'Get 10% lifetime membership discount!',
    content: `**Membership Benefits:**
    
    - Permanent 10% discount on all bookings
    - Exclusive features:
      ✓ Priority booking window
      ✓ Free locker access
      ✓ Monthly free session
      ✓ VIP parking spot
    
    **Requirements:**
    - Book 5 consecutive slots
    - Maintain 90% attendance
    - Valid government ID
    
    **Terms & Conditions:**
    - Offer valid till December 31st
    - Non-transferable
    - Renewable annually`,
    date: '2024-06-01',
    image: '/images/offer/offer-membership.jpeg',
    tags: ['Exclusive', 'Membership'],
    conditions: [
      'Per Week 1 time can avail this offer',
      'Must attend booked slots for eligibility',
      'Membership card required at counter'
    ]
  }
];

const HomeNews = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const specialOffer = newsItems.find(item => item.type === 'special-offer');
  const otherItems = newsItems.filter(item => item.type !== 'special-offer');

  const handlePrev = () => setActiveIndex(prev => (prev > 0 ? prev - 1 : otherItems.length - 1));
  const handleNext = () => setActiveIndex(prev => (prev < otherItems.length - 1 ? prev + 1 : 0));

  return (
    <section className="relative py-20 my-24 overflow-hidden">
      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close preview"
          >
            <TbX className="w-8 h-8" />
          </button>
          <div className="relative w-full max-w-4xl h-[80vh]">
            <Image
              src={selectedImage}
              alt="Full size preview"
              fill
              className="object-contain rounded-xl"
              priority
            />
          </div>
        </div>
      )}

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedNews(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close details"
          >
            <TbX className="w-8 h-8" />
          </button>
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col lg:flex-row">
              <div className="relative lg:w-1/2 h-64 lg:h-[500px]">
                <Image
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  fill
                  className="object-cover rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900/40 to-transparent" />
              </div>
              
              <div className="lg:w-1/2 p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-black/30 backdrop-blur-sm">
                    {selectedNews.type}
                  </span>
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(selectedNews.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedNews.title}
                </h2>

                <div className="flex gap-2 mb-4">
                  {selectedNews.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                    {selectedNews.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Special Offer Section */}
        {specialOffer && (
          <motion.div 
            className="mb-16 rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-green-500 p-1 rounded-2xl">
              <div className="bg-white dark:bg-slate-900 rounded-xl">
                <div className="flex flex-col lg:flex-row items-stretch min-h-[400px]">
                  <div className="relative lg:w-1/2 h-64 lg:h-auto rounded-xl overflow-hidden">
                    <button 
                      onClick={() => setSelectedImage(specialOffer.image)}
                      className="relative w-full h-full flex items-center justify-center overflow-hidden"
                    >
                      <Image
                        src={specialOffer.image}
                        alt={specialOffer.title}
                        fill
                        className="object-cover object-center transition-transform duration-300 hover:scale-105 rounded-xl"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 to-transparent rounded-xl" />
                      <span className="absolute bottom-4 left-4 text-white text-sm font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                        Click to expand
                      </span>
                    </button>
                  </div>

                  <div className="relative lg:w-1/2 p-8 space-y-6 flex flex-col justify-center">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 text-white bg-gradient-to-r from-blue-600 to-green-500 w-fit px-4 py-2 rounded-full">
                        <TbDiscount className="w-6 h-6" />
                        <span className="font-bold">Exclusive Offer</span>
                      </div>
                      <BsPinAngle className="w-8 h-8 text-red-600 dark:text-red-800 transform hover:scale-110 transition-transform" />
                    </div>
                    
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {specialOffer.title}
                    </h2>
                    
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-300 text-lg">
                        {specialOffer.excerpt}
                      </p>
                      
                      <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                          Conditions:
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          {specialOffer.conditions.map((condition, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-500">•</span>
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                    <button 
                      onClick={() => router.push('/login')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Claim Offer
                    </button>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                        10% OFF
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* News Carousel Section */}
        <div className="relative mt-16">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Latest Updates
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Stay informed with our recent news and announcements
          </p>
        </motion.div>

        <div className="relative group">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden">
            {otherItems.map((item, index) => (
              <motion.article
                key={item.id}
                className={`relative transition-transform duration-500 ${
                  index === activeIndex ? 'scale-100 z-10' : 'scale-95 opacity-70 z-0'
                }`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: index === activeIndex ? 1 : 0.7, 
                  x: 0 
                }}
              >
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden h-full border border-white/20">
                  {/* Image Section */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(item.image);
                    }}
                    className="relative w-full h-48 flex items-center justify-center overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10" />
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium text-white bg-black/30 backdrop-blur-sm z-20">
                      {item.type}
                    </span>
                  </button>

                  {/* Content Section */}
                  <div 
                    className="p-6 space-y-4 cursor-pointer bg-gradient-to-b from-white/50 to-transparent dark:from-slate-800/50"
                    onClick={() => setSelectedNews(item)}
                  >
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <time>
                        {new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </time>
                      <div className="flex gap-2">
                        {item.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                      {item.excerpt}
                    </p>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNews(item);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 w-full mt-4 z-20 relative"
                    >
                      <span>Read More</span>
                      <TbChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Carousel Navigation */}
          <div className="absolute inset-y-0 -left-8 -right-8 flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="p-2 bg-white/90 dark:bg-slate-700/90 rounded-full shadow-xl hover:scale-110 transition-transform backdrop-blur-sm"
              aria-label="Previous item"
            >
              <TbChevronLeft className="w-6 h-6 text-gray-700 dark:text-white" />
            </button>
            
            <button
              onClick={handleNext}
              className="p-2 bg-white/90 dark:bg-slate-700/90 rounded-full shadow-xl hover:scale-110 transition-transform backdrop-blur-sm"
              aria-label="Next item"
            >
              <TbChevronRight className="w-6 h-6 text-gray-700 dark:text-white" />
            </button>
          </div>
        </div>
      </div>

        {/* Updated Popup Design */}
        {selectedNews && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <button 
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
              aria-label="Close details"
            >
              <TbX className="w-8 h-8" />
            </button>
            
            <div className="relative w-full max-w-4xl bg-white/95 dark:bg-slate-800/95 rounded-2xl shadow-2xl mx-4 max-h-[90vh] overflow-y-auto backdrop-blur-xl border border-white/20">
              <div className="flex flex-col lg:flex-row">
                {/* Image Section */}
                <div className="relative lg:w-1/2 h-64 lg:h-auto min-h-[300px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20" />
                  <Image
                    src={selectedNews.image}
                    alt={selectedNews.title}
                    fill
                    className="object-cover object-center rounded-t-xl lg:rounded-l-xl"
                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>

                {/* Content Section */}
                <div className="lg:w-1/2 p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-green-500">
                      {selectedNews.type}
                    </span>
                    <time className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(selectedNews.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedNews.title}
                  </h2>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedNews.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {selectedNews.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>
    </section>
  );
};

export default HomeNews;