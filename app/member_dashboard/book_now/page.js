//app/member_dashboard/book_now/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiCheckCircle, FiClock, FiLock, FiShoppingCart, FiX, FiCalendar } from 'react-icons/fi';
import { format, addDays, isToday, isSameDay, parse, differenceInMinutes } from 'date-fns';
import { useRouter } from 'next/navigation';

const BookNow = ({ darkMode, onProceed }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateLoading, setDateLoading] = useState(false);
  const router = useRouter();


  const handleProceedToPayment = () => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    if (selectedSlots.length === 0) {
      toast.error('Please select at least one slot');
      return;
    }
  
    const bookingData = {
      selectedDate: dateString, // Store as string
      selectedSlots: selectedSlots.map(id => {
        const slot = slots.find(s => s.serial === id);
        return {
          slotId: slot.slotId,  // Correctly captures slot ID
          slotName: slot.slotName,
          slotTiming: slot.slotTiming,
          price: slot.price,
          offerPrice: slot.offerPrice
        };
      })
    };
  
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    onProceed();
  };

  // Calendar setup
  const today = new Date();
  const [visibleDates] = useState(() => 
    Array.from({ length: 7 }, (_, i) => addDays(today, i))
  );

  // Animation configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const slotVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.02 }
  };

  const checkSlotValidity = (slot) => {
    if (!isToday(selectedDate)) return true;
    
    const currentTime = new Date();
    const [_, endTime] = slot.slotTiming.split('-').map(t => t.trim());
    const slotEndTime = parse(endTime, 'hh:mm a', selectedDate);
    return differenceInMinutes(slotEndTime, currentTime) > 0;
  };
  useEffect(() => {
    // Initial load simulation
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      try {
        setDateLoading(true);
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const response = await fetch(`/api/book_now?date=${dateString}`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error || 'Failed to fetch slots');
        
        const updatedSlots = data.data.map(slot => ({
          ...slot,
          price: Number(slot.price),
          offerPrice: slot.offerPrice ? Number(slot.offerPrice) : null,
          availability: slot.booked ? 'BOOKED' : checkSlotValidity(slot) ? 'AVAILABLE' : 'EXPIRED'
        }));

        setSlots(updatedSlots);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setDateLoading(false);
      }
    };
    
    fetchSlots();
  }, [selectedDate]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlots([]);
  };

  const handleSlotSelect = (slotId) => {
    const slot = slots.find(s => s.serial === slotId);
    if (slot.availability !== 'AVAILABLE') return;

    setSelectedSlots(prev => {
      if (prev.includes(slotId)) return prev.filter(id => id !== slotId);
      return prev.length < 3 ? [...prev, slotId] : prev;
    });
  };

  const calculateTotal = () => selectedSlots.reduce((acc, id) => 
    acc + (slots.find(s => s.serial === id).offerPrice || slots.find(s => s.serial === id).price), 0);

  const Calendar = () => (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className={`p-6 rounded-3xl ${
        darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'
      } shadow-xl`}>
        <h2 className={`text-2xl font-bold mb-6 ${
          darkMode ? 'text-white' : 'text-gray-800'
        } text-center`}>
          <FiCalendar className="inline mr-3 mb-1 text-purple-500" />
          Choose Your Booking Date
        </h2>
        
        <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
          {visibleDates.map((date, idx) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isPast = differenceInMinutes(date, today) < 0 && !isToday(date);

            return (
              <motion.div
                key={idx}
                whileHover={!isPast ? { scale: 1.05 } : {}}
                className={`p-3 text-center rounded-xl transition-all relative
                  ${isSelected ? 
                    'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg' : 
                    isPast ? `${darkMode ? 'bg-gray-700' : 'bg-gray-100'} cursor-not-allowed` :
                    `${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-purple-50'} cursor-pointer shadow-sm`
                  }
                  ${!isPast && 'group'}`}
                onClick={() => !isPast && handleDateSelect(date)}
              >
                
                <div className={`text-sm font-medium ${
                  isSelected ? 'text-white' : 
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {format(date, 'EEE')}
                </div>
                <div className={`text-2xl font-bold mt-1 ${
                  isSelected ? 'text-white' : 
                  darkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {format(date, 'd')}
                </div>
                <div className={`text-xs mt-1 ${
                  isSelected ? 'text-purple-100' : 
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {format(date, 'MMM')}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className={`mt-6 text-center ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        } text-sm`}>
          Available for next 7 days from today
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Preserved Header */}
      <div className="relative overflow-hidden py-12 md:py-16 lg:py-20 text-center px-4 sm:px-6">
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-5 transition-opacity duration-300 
            ${darkMode ? 'mix-blend-screen' : 'mix-blend-multiply'}`} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight 
            ${darkMode ? 'text-white' : 'text-gray-900'} 
            mb-3 md:mb-4 lg:mb-5`}>
            <span className="inline-block transform transition hover:scale-105">
              ⚽
            </span>
            <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Book Your Arena Time
            </span>
          </h1>
          
          <p className={`text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto
            ${darkMode ? 'text-gray-300' : 'text-gray-600'} 
            transition-colors duration-200`}>
            Select up to {3 - selectedSlots.length} more slots •{' '}
            <span className="font-medium text-purple-600">
              {selectedSlots.length}/3 selected
            </span>
          </p>
        </div>
      </div>
          {initialLoading ? (
      <LoadingSpinner />
    ) : (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Calendar />

        {error && (
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} mt-8`}>
            <div className="flex items-center gap-3 text-red-500 p-4 rounded-xl bg-red-50">
              <FiX className="w-6 h-6" />
              <div>
                <p className="font-bold">Error loading slots</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12"
          >
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {format(selectedDate, 'MMMM do, yyyy')} Slots
            </h2>

            {dateLoading ? (
              <LoadingSpinner />
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {slots.map((slot) => {
                  const hasOffer = !!slot.offer;
                  const isSelected = selectedSlots.includes(slot.serial);
                  const isAvailable = slot.availability === 'AVAILABLE';

                  return (
                    <motion.div
                      key={slot.serial}
                      variants={slotVariants}
                      whileHover={isAvailable ? { y: -5 } : {}}
                      className={`relative group rounded-2xl p-6 transition-all ${
                        isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                      } ${
                        isSelected 
                          ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-gray-800'
                          : `${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-md`
                      } ${
                        hasOffer && 'border-t-4 border-purple-500'
                      }`}
                      onClick={() => isAvailable && handleSlotSelect(slot.serial)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className={`text-xl font-bold ${
                            isSelected 
                              ? 'text-gray-900 dark:text-white'
                              : darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {slot.slotName}
                          </h3>
                          <p className={`text-sm flex items-center gap-1 ${
                            isSelected 
                              ? 'text-gray-600 dark:text-gray-300'
                              : darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            <FiClock /> {slot.slotTiming}
                          </p>
                        </div>
                        <FiCheckCircle 
                          className={`w-6 h-6 transition-colors ${
                            isSelected ? 'text-purple-500' : 'text-gray-300'
                          }`}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2 justify-between">
                          <div className="flex items-baseline gap-2">
                            {hasOffer ? (
                              <>
                                <span className={`text-2xl font-bold ${
                                  darkMode ? 'text-purple-400' : 'text-purple-600'
                                }`}>
                                  ৳{slot.offerPrice?.toLocaleString('en-US')}
                                </span>
                                <span className="line-through text-red-600 text-sm">
                                  ৳{slot.price.toLocaleString('en-US')}
                                </span>
                              </>
                            ) : (
                              <span className={`text-2xl font-bold ${
                                isSelected 
                                  ? 'text-gray-900 dark:text-gray-100'
                                  : darkMode ? 'text-gray-300' : 'text-gray-900'
                              }`}>
                                ৳{slot.price.toLocaleString('en-US')}
                              </span>
                            )}
                          </div>
                          
                          {hasOffer && (
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              darkMode ? 'bg-purple-700 text-purple-100' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {parseInt(slot.offer.match(/(\d+)%/)[1])}% OFF
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isAvailable 
                              ? 'bg-green-100 text-green-800 dark:bg-green-600 dark:text-green-100'
                              : slot.availability === 'BOOKED'
                                ? 'bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-100'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {slot.availability === 'BOOKED' ? 'Booked' : 
                             slot.availability === 'EXPIRED' ? 'Expired' : 'Available'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            isSelected
                              ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {slot.type}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Summery Section */}
        {selectedSlots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`mt-8 rounded-2xl ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-gray-200'
            } shadow-xl backdrop-blur-sm`}
          >
            <div className="p-6">
              {/* Header Section */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-bold flex items-center gap-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <div className={`p-3 rounded-xl ${
                      darkMode ? 'bg-gray-700' : 'bg-purple-100'
                    }`}>
                      <FiCalendar className={`w-10 h-10 ${
                        darkMode ? 'text-purple-400' : 'text-purple-600'
                      }`} />
                    </div>
                    <div className="max-w-sm mx-auto text-left">
                      <h2>Booking Summary</h2>
                      <p className="text-sm font-medium text-purple-700 mt-1 bg-purple-100 py-1 px-2 rounded-md shadow-sm inline-block">
                        {format(selectedDate, 'MMMM do, yyyy')}
                      </p>
                    </div>

                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedSlots([])}
                  className={`p-2 rounded-lg ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Selected Slots List */}
              <div className="space-y-4 mb-6">
                {selectedSlots.map((slotId) => {
                  const slot = slots.find(s => s.serial === slotId);
                  return (
                    <motion.div
                      key={slotId}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-xl flex items-center justify-between ${
                        darkMode 
                          ? 'bg-gray-700/50 hover:bg-gray-700' 
                          : 'bg-white hover:bg-gray-50'
                      } shadow-sm transition-all`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          darkMode ? 'bg-gray-600' : 'bg-purple-100'
                        }`}>
                          <FiClock className={`w-5 h-5 ${
                            darkMode ? 'text-purple-300' : 'text-purple-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className={`font-medium ${
                            darkMode ? 'text-gray-100' : 'text-gray-700'
                          }`}>
                            {slot.slotName}
                          </h3>
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {slot.slotTiming}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          darkMode ? 'text-purple-400' : 'text-purple-600'
                        }`}>
                          ৳{(slot.offerPrice || slot.price).toLocaleString('en-US')}
                        </p>
                        {slot.offer && (
                          <span className={`text-xs ${
                            darkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            Save ৳{(slot.price - slot.offerPrice).toLocaleString('en-US')}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Total and Payment */}
              <div className={`pt-6 border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className={`text-lg ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Total Amount
                    </span>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      Includes all selected slots
                    </p>
                  </div>
                  <span className={`text-2xl font-bold ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    ৳{calculateTotal().toLocaleString('en-US')}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                  } shadow-lg`}
                  onClick={handleProceedToPayment}
                >
                  <FiShoppingCart className="w-5 h-5" />
                  Proceed to Payment
                </motion.button>

                <p className={`text-center mt-4 text-sm ${
                  darkMode ? 'text-gray-500' : 'text-gray-600'
                }`}>
                  <FiLock className="inline mr-2" />
                  256-bit SSL encrypted payment
                </p>
              </div>
            </div>
          </motion.div>
        )}
        </div>
    )}
  </div>
);
};

export default BookNow;