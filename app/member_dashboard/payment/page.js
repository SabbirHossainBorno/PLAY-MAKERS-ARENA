///app/member_dashboard/payment/page.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import { 
  FiCalendar, 
  FiClock, 
  FiLock, 
  FiXCircle,
  FiCreditCard,
  FiTag,
  FiPercent,
  FiCheckCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiId
} from 'react-icons/fi';
import { TbCurrencyTaka } from "react-icons/tb";
import { PiIdentificationBadgeLight } from "react-icons/pi";
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.4, 
      ease: 'easeOut',
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, y: -20 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const PaymentPage = ({ darkMode, onBack }) => {
  const router = useRouter();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberInfo, setMemberInfo] = useState(null);
  

  useEffect(() => {
    // Update the fetch call to handle errors properly
  const fetchMemberInfo = async () => {
    try {
      const response = await fetch('/api/booking-summary');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch member info');
      }
      setMemberInfo(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

    const loadBookingData = () => {
      const data = localStorage.getItem('bookingData');
      if (!data) {
        toast.error('No booking data found');
        onBack?.();
        return;
      }
      setBookingData(JSON.parse(data));
      setLoading(false);
    };

    loadBookingData();
    fetchMemberInfo();
  }, [onBack]);

  const handleClearBooking = () => {
    localStorage.removeItem('bookingData');
    toast.info('Booking cleared successfully');
    onBack?.();
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-purple-50'
        }`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"
        />
      </motion.div>
    );
  }

  if (!bookingData) return null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className={`min-h-screen ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-gray-50 to-purple-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClearBooking}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm transition-all ${
              darkMode 
                ? 'bg-gray-800/50 text-red-400 hover:bg-gray-700/60' 
                : 'bg-white/50 text-red-600 hover:bg-gray-100/80'
            } shadow-lg`}
          >
            <FiXCircle className="w-5 h-5" />
            <span className="font-medium">New Booking</span>
          </motion.button>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-2xl md:text-3xl font-bold text-center bg-gradient-to-r ${
              darkMode 
                ? 'from-purple-400 to-blue-400' 
                : 'from-purple-600 to-blue-600'
            } bg-clip-text text-transparent`}
          >
            Complete Payment
          </motion.h1>
        </motion.div>

        {/* Booking Summary Section */}
        <motion.div
          variants={itemVariants}
          className={`mb-12 rounded-3xl shadow-2xl overflow-hidden ${
            darkMode 
              ? 'bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm' 
              : 'bg-white/80 border border-gray-200/50 backdrop-blur-sm'
          }`}
        >
          {/* Member Info & Date Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b" 
               style={{ borderColor: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)' }}>
            {/* Member Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                darkMode ? 'text-purple-300' : 'text-purple-600'
              }`}>
                <FiUser className="text-xl" />
                Member Details
              </h3>
              
              {memberInfo ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-100'}`}>
                      <FiUser className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Full Name</p>
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {memberInfo.first_name} {memberInfo.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-100'}`}>
                      <FiMail className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {memberInfo.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-100'}`}>
                      <FiPhone className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {memberInfo.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-100'}`}>
                      <PiIdentificationBadgeLight className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>NID Number</p>
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {memberInfo.nid}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-100'}`} />
                      <div className="flex-1 space-y-2">
                        <div className={`h-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{width: '40%'}} />
                        <div className={`h-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{width: '70%'}} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Date Section */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                darkMode ? 'text-purple-300' : 'text-purple-600'
              }`}>
                <FiCalendar className="text-xl" />
                Booking Summary
              </h3>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br ${
                darkMode 
                  ? 'from-gray-700/50 to-gray-800/50' 
                  : 'from-purple-50 to-blue-50'
              }">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-100'}`}>
                  <FiCalendar className={`text-xl ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {format(new Date(bookingData.selectedDate), 'MMMM do, yyyy')}
                  </h2>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {bookingData.selectedSlots.length} slots selected
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Time Slots Section */}
          <div className="p-6 space-y-4">
            {bookingData.selectedSlots.map((slot, index) => (
              <motion.div
                key={slot.serial}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl ${
                  darkMode 
                    ? 'bg-gray-700/20 hover:bg-gray-700/30' 
                    : 'bg-purple-50/50 hover:bg-purple-100/30'
                } transition-colors group`}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                      <FiClock className={`text-lg ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {slot.slotName}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {slot.slotTiming}
                      </p>
                    </div>
                  </div>

                  <div className="md:text-center">
                    {slot.offerPrice ? (
                      <div className="flex items-center gap-2 justify-center">
                        <span className={`text-sm line-through ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                          ৳{slot.price.toLocaleString()}
                        </span>
                        <FiTag className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      </div>
                    ) : (
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Standard Rate
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className={`text-xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      ৳{(slot.offerPrice || slot.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Payment Summary Section */}
          <div className={`p-6 border-t ${
            darkMode 
              ? 'border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50' 
              : 'border-gray-200/50 bg-gradient-to-br from-purple-50 to-blue-50'
          }`}>
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Subtotal */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r ${
                darkMode 
                  ? 'from-gray-700/40 to-gray-800/40' 
                  : 'from-purple-100/50 to-blue-100/50'
              }">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-100'}`}>
                    <TbCurrencyTaka className={`text-xl ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Subtotal
                  </span>
                </div>
                <span className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ৳{bookingData.selectedSlots.reduce((acc, slot) => 
                    acc + (slot.offerPrice || slot.price), 0).toLocaleString('en-US')}
                </span>
              </div>

              {/* VAT */}
              <div className="p-4 rounded-xl bg-gradient-to-r ${
                darkMode 
                  ? 'from-teal-600/10 to-teal-700/20' 
                  : 'from-teal-100/50 to-teal-200/30'
              }">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-teal-500/20' : 'bg-teal-100'}`}>
                      <FiPercent className={`text-xl ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                    </div>
                    <div>
                      <span className={`block font-medium ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                        VAT (5%)
                      </span>
                    </div>
                  </div>
                  <span className={`text-xl font-semibold ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                    ৳{(
                      bookingData.selectedSlots.reduce((acc, slot) => 
                        acc + (slot.offerPrice || slot.price), 0) * 0.05
                    ).toFixed(2).toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="p-4 rounded-xl bg-gradient-to-r ${
                darkMode 
                  ? 'from-purple-600/20 to-blue-600/20' 
                  : 'from-purple-100/50 to-blue-100/50'
              }">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                      <FiCreditCard className={`text-xl ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <span className={`text-xl font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      Grand Total
                    </span>
                  </div>
                  <span className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    ৳{(
                      bookingData.selectedSlots.reduce((acc, slot) => 
                        acc + (slot.offerPrice || slot.price), 0) * 1.05
                    ).toFixed(2).toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              {/* Payment Button */}
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    darkMode 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-purple-lg' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg'
                  } text-white shadow-md`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <FiCheckCircle className="text-xl" />
                    Confirm & Pay Now
                  </div>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Security Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm ${
            darkMode 
              ? 'bg-gray-800/30 text-gray-400' 
              : 'bg-gray-100/80 text-gray-600'
          }`}>
            <FiLock className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className="text-sm">
              256-bit SSL Encrypted Transaction
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PaymentPage;