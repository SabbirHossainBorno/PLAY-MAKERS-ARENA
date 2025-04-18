// components/HomeContactUs.js
'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import { motion } from 'framer-motion';

const HomeContactUs = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const toastId = toast.loading('Sending your message...');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to send message');

      toast.update(toastId, {
        render: '🎉 Message sent successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
      reset();
    } catch (error) {
      toast.update(toastId, {
        render: error.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
        {/* Left Side - Contact Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-10"
        >
          <div className="space-y-6">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
              Connect With Us
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Have questions or need support? We&apos;re here to help!
            </p>
          </div>

          <div className="grid gap-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-5">
                <div className="p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-xl">
                  <FiMapPin className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold dark:text-white mb-2">Our Headquarters</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    123 Futsal Avenue<br/>
                    Sports City, BD 4560
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-5">
                <div className="p-3 bg-green-100/50 dark:bg-green-900/20 rounded-xl">
                  <FiPhone className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold dark:text-white mb-2">Contact Numbers</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    +880 1234 567890 (Office)<br/>
                    +880 9876 543210 (Support)
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-5">
                <div className="p-3 bg-purple-100/50 dark:bg-purple-900/20 rounded-xl">
                  <FiMail className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold dark:text-white mb-2">Email Addresses</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    info@playmakersarena.com<br/>
                    support@playmakersarena.com
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-5">
                <div className="p-3 bg-orange-100/50 dark:bg-orange-900/20 rounded-xl">
                  <FiClock className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold dark:text-white mb-2">Operating Hours</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Daily: 8:00 AM - 12:00 AM<br/>
                    24/7 Online Support
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Contact Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="sticky top-24 h-fit"
        >
          <div className="p-8 rounded-3xl bg-gradient-to-br from-white to-white/50 dark:from-gray-800 dark:to-gray-800/50 backdrop-blur-lg shadow-2xl border border-white/20 dark:border-gray-700/30">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent mb-8">
              Send Us a Message
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3 dark:text-gray-200">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent focus:border-blue-500 focus:ring-0 transition-all"
                  />
                  {errors.name && (
                    <span className="absolute right-3 top-4 text-red-500">
                      ⚠️
                    </span>
                  )}
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 dark:text-gray-200">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent focus:border-blue-500 focus:ring-0 transition-all"
                  />
                  {errors.email && (
                    <span className="absolute right-3 top-4 text-red-500">
                      ⚠️
                    </span>
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 dark:text-gray-200">
                  Subject
                </label>
                <div className="relative">
                  <input
                    {...register('subject', { required: 'Subject is required' })}
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent focus:border-blue-500 focus:ring-0 transition-all"
                  />
                  {errors.subject && (
                    <span className="absolute right-3 top-4 text-red-500">
                      ⚠️
                    </span>
                  )}
                </div>
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-2">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 dark:text-gray-200">
                  Your Message
                </label>
                <div className="relative">
                  <textarea
                    {...register('message', { required: 'Message is required' })}
                    rows="5"
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent focus:border-blue-500 focus:ring-0 transition-all"
                  ></textarea>
                  {errors.message && (
                    <span className="absolute right-3 top-4 text-red-500">
                      ⚠️
                    </span>
                  )}
                </div>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-2">{errors.message.message}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 px-8 bg-gradient-to-r from-blue-600 to-purple-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg flex items-center justify-center gap-3"
              >
                <FiSend className="w-5 h-5" />
                Send Message
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeContactUs;