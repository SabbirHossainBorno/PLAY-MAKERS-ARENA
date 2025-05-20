// components/InvoiceModal.js
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiX, FiDownload, FiClock, FiCreditCard } from 'react-icons/fi';
import LoadingSpinner from './LoadingSpinner';


const InvoiceModal = ({ bookingId, onClose, darkMode }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate prices
  const subtotal = invoiceData?.slots?.reduce((sum, slot) => sum + slot.price, 0) || 0;
  const vat = subtotal * 0.05;
  const total = subtotal + vat;

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoice?booking_id=${bookingId}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch invoice data');
        setInvoiceData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (bookingId) fetchInvoice();
  }, [bookingId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-2 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="relative bg-white w-full max-w-[210mm] h-[90vh] sm:h-[95vh] overflow-y-auto shadow-2xl"
        style={{ 
          backgroundImage: "url('/images/invoice/invoice_bg_2.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600">Generating Invoice...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center p-8">
            <div className="text-center text-red-600">
              <FiX className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Invoice Error</h2>
              <p className="max-w-prose mx-auto">{error}</p>
            </div>
          </div>
        )}

        {/* Invoice Content */}
        {!loading && !error && invoiceData && (
        <div className="p-4 sm:p-8 bg-white/90 min-h-full">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b">
                <div className="flex items-center">
                    <div className="w-24 mb-4 sm:mb-0">
                    <Image
                        src="/images/invoice/logo.svg"
                        width={120}
                        height={60}
                        alt="Logo"
                        className="w-full h-auto"
                    />
                    </div>
                    <div className="text-left ml-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        The Play Makers Arena
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Ultimate Futsal Experience
                    </p>
                    </div>
            </div>
        <button
            onClick={onClose}
            className="absolute top-2 right-2 z-50 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
        >
            <FiX className="w-6 h-6 text-white" />
        </button>
        </div>


            {/* Invoice Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <DetailItem label="DATE" value={new Date().toLocaleDateString()} />
                <DetailItem label="INVOICE ID" value={`#${invoiceData.invoice_id}`} />
                <DetailItem label="BOOKING ID" value={invoiceData.booking_id} />

                <div className="bg-white p-3 rounded-lg mb-4 shadow-sm border border-gray-100 max-w-s mx-auto">
                <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-1.5">
                    <svg 
                    className="w-4 h-4 text-purple-500 shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Member Details
                </h3>

                <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <svg className="w-3.5 h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3a2 2 0 01-2 2h-1v-1a2 2 0 00-2-2H9a2 2 0 00-2 2v1H6a2 2 0 01-2-2V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>ID:</span>
                    </div>
                    <span className="font-medium text-gray-700 truncate">{invoiceData.pma_id}</span>
                    </div>

                    <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span>Name:</span>
                    </div>
                    <span className="font-medium text-gray-700 truncate">
                        {invoiceData.member_first_name} {invoiceData.member_last_name}
                    </span>
                    </div>

                    <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span>Contact:</span>
                    </div>
                    <span className="font-medium text-gray-700">{invoiceData.member_phone}</span>
                    </div>

                    <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <span>NID:</span>
                    </div>
                    <span className="font-medium text-gray-700">{invoiceData.member_nid}</span>
                    </div>

                    <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <svg className="w-3.5 h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span>Type:</span>
                    </div>
                    <span className="font-medium text-gray-700 capitalize">{invoiceData.member_type}</span>
                    </div>
                </div>
                </div>
              </div>
              
              <div className="sm:border-l sm:pl-4 space-y-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-700">
                  TRANSACTION DETAILS
                </h3>
                <DetailItem label="TXN ID" value={invoiceData.transaction_id} />
                <DetailItem 
                  label="TOTAL AMOUNT" 
                  value={`৳${total.toLocaleString('en-IN')}`}
                />
                <DetailItem label="PAYMENT METHOD" value={invoiceData.payment_method} />
                <DetailItem label="CARD NO" value={invoiceData.card_no} />
                <DetailItem label="BANK TXN ID" value={invoiceData.bank_tran_id} />
                <DetailItem 
                  label="PAYMENT TIME" 
                  value={new Date(invoiceData.created_at).toLocaleString()}
                />
              </div>
            </div>

        
            {/* Thank You Message */}
            <div className="mb-2 text-center">
                <div className="inline-flex flex-col items-center">    
                    <p className="text-gray-700 leading-relaxed max-w-2xl">
                    Thank you{' '}
                    <span className="font-semibold text-indigo-600">
                        {invoiceData.member_last_name}
                    </span>{' '}
                    for choosing{' '}
                    <span className="font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        PLAY MAKERS ARENA
                    </span>. 
                    <span className="block mt-2 text-gray-600 font-normal">
                        We&apos;re crafting an exceptional sporting experience tailored uniquely for you.
                    </span>
                    </p>

                    {/* Subtle divider */}
                    <div className="mt-4 w-20 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>
            </div>

            {/* Booking Details */}
            <div className="mb-6 group">
                <div className="relative bg-white rounded-xl shadow-lg shadow-indigo-100/30 border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-indigo-200/30">
                    {/* Decorative Elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/20 to-pink-50/10 opacity-40"></div>
                    
                    <div className="relative p-5 sm:p-6">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-6">
                        <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600/10 rounded-lg">
                            <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Booking Summary</h2>
                            <p className="text-indigo-600 font-medium flex items-center gap-2 mt-1">
                            <span className="bg-indigo-600/10 px-2 py-1 rounded-md text-sm">ID #{invoiceData.booking_id}</span>
                            </p>
                        </div>
                        </div>
                        
                        <div className="flex items-center bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-xs border border-gray-100 text-sm">
                        <svg className="w-4 h-4 text-indigo-600 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-gray-700">
                            {new Date(invoiceData.booking_date + 'T00:00:00+06:00')
                                .toLocaleDateString('en-US', { 
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                                })
                            }
                            </span>
                        </div>
                    </div>

                    {/* Slots Table */}
                    <div className="border border-gray-100 rounded-lg overflow-hidden shadow-inner shadow-gray-100/30">
                        <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-indigo-50">
                            <tr>
                                {['Slot', 'Name', 'Type', 'Timing', 'Price'].map((header) => (
                                <th 
                                    key={header}
                                    className="px-4 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100/50">
                            {invoiceData.slots.map((slot) => (
                                <tr 
                                key={slot.slot_id}
                                className="hover:bg-indigo-50/20 transition-colors even:bg-gray-50/20"
                                >
                                <td className="px-4 py-3 text-sm font-medium text-indigo-900/90">#{slot.slot_id}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{slot.slot_name}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {slot.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 flex items-center">
                                    <svg className="w-4 h-4 mr-1.5 text-gray-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    {slot.slot_timing}
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                    <span className="text-indigo-700">৳</span>{slot.price.toLocaleString('en-IN')}
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="mt-6 flex justify-end">
                        <div className="w-full sm:w-80 bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium text-gray-900">৳{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">VAT (5%):</span>
                            <span className="font-medium text-blue-600">+৳{vat.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-semibold text-gray-900">Total:</span>
                                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                ৳{total.toLocaleString('en-IN')}
                                </span>
                            </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center text-xs text-gray-500 gap-1.5">
                            <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            <span>Includes taxes • Secure payment • Instant confirmation</span>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            {/* Signature Section */}
            <div className="mt-8">
              <div className="max-w-xs mx-auto">
                <Image
                  src="/images/invoice/invoice_sig.png"
                  width={180}
                  height={60}
                  alt="Signature"
                  className="mx-auto mb-2"
                />
                <hr className="border-t-2 border-gray-400 w-3/4 mx-auto mb-2" />
                <p className="text-center font-semibold text-gray-700">
                  Administrator Signature
                </p>
              </div>
            </div>

            {/* Footer Section */}
            <div className="mt-6 text-center space-y-1 text-sm text-gray-600">
              <p>📌 Important Notes:</p>
              <p>• Arrive 15 minutes before your slot</p>
              <p>• Bring valid ID proof</p>
            </div>

            <div className="mt-4 text-center space-y-1">
              <p className="text-sm sm:text-base font-semibold text-gray-700">
                🎯 We&apos;re ready to make your play unforgettable!
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                The Playmakers Arena, Manikdiya road, Dharmikpara, Dhala, Bangladesh<br />
                Contact: 01788895556 | Email: theplaymakersarena@gmail.com
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Helper components
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm sm:text-base">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-gray-700">{value || 'N/A'}</span>
  </div>
);

const PriceRow = ({ label, value, bold = false }) => (
  <div className={`flex justify-between items-center ${bold ? 'font-semibold' : ''}`}>
    <span>{label}:</span>
    <span>৳{value.toLocaleString('en-IN')}</span>
  </div>
);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export default InvoiceModal;