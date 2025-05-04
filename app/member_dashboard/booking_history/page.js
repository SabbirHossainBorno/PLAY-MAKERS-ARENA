// app/member_dashboard/booking_history/page.js
'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, FiClock,  FiCheckCircle,
  FiInfo, FiX, FiCreditCard, FiArrowUp, FiAlertTriangle
} from 'react-icons/fi';
import { TbCurrencyTaka } from "react-icons/tb";
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookingHistory = ({ darkMode }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/booking-history');
        if (!response.ok) throw new Error('Failed to fetch history');
        const { data } = await response.json();
        setBookings(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const sortedBookings = [...bookings].sort((a, b) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.booking_date) - new Date(b.booking_date)
        : new Date(b.booking_date) - new Date(a.booking_date);
    }
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc' 
        ? a.total - b.total 
        : b.total - a.total;
    }
    return 0;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const TransactionModal = ({ transaction, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${
        darkMode ? 'bg-black/50' : 'bg-white/90'
      }`}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className={`relative rounded-2xl p-6 max-w-md w-full ${
          darkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full ${
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
          darkMode ? 'text-purple-400' : 'text-purple-600'
        }`}>
          <FiCreditCard className="w-6 h-6" />
          Transaction Details
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Transaction ID:
            </span>
            <code className={`font-mono ${
              darkMode ? 'text-purple-300' : 'text-purple-600'
            }`}>
              {transaction.transaction_id}
            </code>
          </div>

          <div className="flex justify-between items-center">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Amount:
            </span>
            <span className={`font-bold ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              ৳{transaction.amount?.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Payment Method:
            </span>
            <span className={`font-medium ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {transaction.payment_method}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Status:
            </span>
            <span className={`flex items-center gap-2 ${
              transaction.payment_status === 'SUCCESS' 
                ? darkMode ? 'text-green-400' : 'text-green-600'
                : darkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              {transaction.payment_status}
              {transaction.payment_status === 'SUCCESS' ? 
                <FiCheckCircle /> : <FiAlertTriangle />}
            </span>
          </div>

          {transaction.bank_tran_id && (
            <div className="flex justify-between items-center">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Bank Reference ID:
              </span>
              <code className={`font-mono text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {transaction.bank_tran_id}
              </code>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Time:
            </span>
            <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {(() => {
                const date = new Date(transaction.created_at);
                const year = date.getFullYear();
                const month = `${date.getMonth() + 1}`.padStart(2, '0');
                const day = `${date.getDate()}`.padStart(2, '0');

                let hours = date.getHours();
                const minutes = `${date.getMinutes()}`.padStart(2, '0');
                const seconds = `${date.getSeconds()}`.padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';

                hours = hours % 12;
                hours = hours ? hours : 12; // 0 becomes 12
                const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;

                return `${year}-${month}-${day} ${formattedTime}`;
              })()}
            </span>
          </div>


        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`mb-8 p-6 rounded-2xl ${
          darkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}
        >
          <h1 className={`text-3xl font-bold mb-6 ${
            darkMode 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600'
          }`}>
            Booking History
          </h1>

          {/* Sorting Controls */}
          <div className={`flex gap-4 mb-6 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <button
              onClick={() => setSortConfig({ 
                key: 'date', 
                direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' 
              })}
              className="flex items-center gap-2"
            >
              <FiCalendar className="w-5 h-5" />
              Sort by Date
              <FiArrowUp className={`transition-transform ${
                sortConfig.direction === 'asc' ? 'rotate-0' : 'rotate-180'
              }`} />
            </button>
            <button
              onClick={() => setSortConfig({ 
                key: 'amount', 
                direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' 
              })}
              className="flex items-center gap-2"
            >
              <TbCurrencyTaka className="w-5 h-5" />
              Sort by Amount
              <FiArrowUp className={`transition-transform ${
                sortConfig.direction === 'asc' ? 'rotate-0' : 'rotate-180'
              }`} />
            </button>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : bookings.length === 0 ? (
            <div className={`p-6 rounded-xl text-center ${
              darkMode ? 'bg-gray-700/50' : 'bg-purple-50/50'
            }`}>
              <FiInfo className={`w-12 h-12 mx-auto mb-4 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <p className={`text-xl ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                No bookings found. Start booking your arena time!
              </p>
            </div>
          ) : (
            <motion.div 
              className="grid gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {sortedBookings.map((booking) => (
                <motion.div
                  key={booking.booking_id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className={`p-6 rounded-xl ${
                    darkMode 
                      ? 'bg-gray-800 hover:bg-gray-700/50' 
                      : 'bg-white hover:bg-gray00'
                  } transition-colors shadow-sm`}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${
                        darkMode ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {formatDate(booking.booking_date)}
                      </h3>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Booked on {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        darkMode ? 'text-purple-400' : 'text-purple-600'
                      }`}>
                        ৳{booking.amount?.toLocaleString()}
                      </p>
                      <span className={`text-sm ${
                        darkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {booking.payment_status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className={`font-medium mb-3 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Booked Slots:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {booking.slots.map((slot) => (
                        <div 
                          key={slot.slot_name}
                          className={`p-3 rounded-lg ${
                            darkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className={`font-medium ${
                                darkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>
                                {slot.slot_name}
                              </p>
                              <p className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                <FiClock className="inline mr-1" />
                                {slot.slot_timing}
                              </p>
                            </div>
                            <p className={`${
                              darkMode ? 'text-purple-300' : 'text-purple-600'
                            }`}>
                              ৳{(slot.offer_price || slot.price)?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTransaction(booking)}
                    className={`mt-4 w-full py-2 rounded-lg flex items-center justify-center gap-2 ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-purple-400' 
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-600'
                    } transition-colors`}
                  >
                    <FiInfo className="w-5 h-5" />
                    View Transaction Details
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedTransaction && (
          <TransactionModal 
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingHistory;