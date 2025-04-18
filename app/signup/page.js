// app/signup/page.js
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import Link from 'next/link';
import { FiUser, FiLock, FiMail, FiPhone, FiCalendar, FiFileText, FiCheck, FiArrowRight, FiCheckCircle, FiCamera, FiX } from 'react-icons/fi';
import TermsModal from '../components/TermsModal';
import PrivacyModal from '../components/PrivacyModal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReCAPTCHA from "react-google-recaptcha";

export default function SignUpPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [dob, setDob] = useState(null);
  // To:
const [isMobile, setIsMobile] = useState(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768;
  }
  return false; // Default for SSR
});
  const fileInputRef = useRef(null);
  const router = useRouter();

  const formFields = [
    { name: 'firstName', label: 'First Name', icon: FiUser, type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', icon: FiUser, type: 'text', required: true },
    { name: 'phone', label: 'Phone Number', icon: FiPhone, type: 'tel', pattern: '01[3-9]\\d{8}' },
    { name: 'dob', label: 'Date of Birth', icon: FiCalendar, type: 'custom', required: true },
    { name: 'nid', label: 'NID No', icon: FiFileText, type: 'text', required: true, pattern: '\\d{10}' },
    { name: 'email', label: 'Email', icon: FiMail, type: 'email', required: true },
    { name: 'password', label: 'Password', icon: FiLock, type: 'password', required: true },
    { name: 'confirmPassword', label: 'Confirm Password', icon: FiLock, type: 'password', required: true },
  ];

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Add password confirmation live validation
  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setErrors(prev => ({...prev, confirmPassword: 'Passwords do not match'}));
    }
  }, [password, confirmPassword]);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email address';
        break;
      case 'phone':
        if (!/^01[3-9]\d{8}$/.test(value)) {
          error = 'Phone must be 11 digits starting with 013, 014, 015, 016, 017, 018, or 019';
        }
        break;
      case 'password':
        if (value.length < 8) error = 'Password must be at least 8 characters';
        else if (!/[A-Z]/.test(value)) error = 'Password must contain at least one uppercase letter';
        else if (!/[0-9]/.test(value)) error = 'Password must contain at least one number';
        break;
      case 'confirmPassword':
        if (value !== password) error = 'Passwords do not match';
        break;
      case 'dob':
        const dobDate = new Date(value);
        if (!value) error = 'Date of birth is required';
        else if (dobDate > new Date()) error = 'Date of birth cannot be in the future';
        break;
      case 'nid':
        if (!/^\d{10}$/.test(value)) error = 'NID must be 10 digits';
        break;
      default:
        if (!value && formFields.find(f => f.name === name)?.required) error = 'This field is required';
    }
    return error;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileFile(file);
    setErrors(prev => ({ ...prev, profile: '' }));
    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeProfile = () => {
    setProfileFile(null);
    setProfilePreview(null);
    fileInputRef.current.value = '';
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target); // Initial declaration here
    const newErrors = {};
    
    if (!recaptchaToken) {
      setErrors({ recaptcha: 'Complete reCAPTCHA verification' });
      return;
    }
    

    // Add custom fields
    formData.append('dob', dob ? dob.toISOString() : '');
    formData.append('termsAccepted', termsAccepted.toString());
    formData.append('recaptchaToken', recaptchaToken);

    // Validate all fields
    formFields.forEach(({ name }) => {
      const value = name === 'dob' ? dob : formData.get(name);
      const error = validateField(name, value);
      if (error) newErrors[name] = error;
    });

    // Profile validation
    if (!profileFile) {
      newErrors.profile = 'Profile photo is required';
    } else if (!profileFile.type.startsWith('image/')) {
      newErrors.profile = 'Please upload an image file (JPEG/PNG)';
    } else if (profileFile.size > 5 * 1024 * 1024) {
      newErrors.profile = 'File size must be less than 5MB';
    }

    // Check terms and human verification
    if (!termsAccepted) newErrors.terms = 'You must accept the terms and conditions';

    

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Append profile file
      if (profileFile) {
        formData.append('profile', profileFile);
      }

      formData.append('recaptchaToken', recaptchaToken);

      const res = await fetch('/api/signup', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        setErrors(errorData.errors || {});
        return toast.error(errorData.message || 'Registration Failed');
      }

      toast.success('Account Created Successfully!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error:', error);
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4" 
         style={{ backgroundImage: "url('/images/background_img_login.jpg')" }}>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded shadow-xl border border-white/20 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="hidden md:block relative">
          <Image
  src="/images/signup_img.jpg"
  alt="Sign Up Visual"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover"
  priority
/>
            <div className="absolute inset-0 bg-gradient-to-t from-[#012970]/80 to-transparent flex items-end p-6">
              <h2 className="text-3xl font-bold text-white">
                Join The Ultimate<br/>Futsal Community
              </h2>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 md:p-10">
            <div className="mb-8 text-center">
              <Image
                src="/logo/logo.svg"
                alt="Logo"
                width={120}
                height={120}
                className="mx-auto mb-2"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#012970] to-[#0066cc] bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="text-gray-700 mt-2">Start your futsal journey today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Profile Photo Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-500 transition-colors">
                    {profilePreview ? (
                      <>
                        <Image
                          src={profilePreview}
                          alt="Profile Preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeProfile}
                          className="absolute top-0 right-0 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center cursor-pointer">
                        <FiCamera className="w-8 h-8 text-gray-500 group-hover:text-blue-500" />
                        <span className="text-xs text-gray-600 mt-1 group-hover:text-blue-500">Upload Photo</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
                {errors.profile && (
                  <p className="text-red-600 text-xs mt-2 text-center">{errors.profile}</p>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {formFields.map(({ name, label, icon: Icon, type, required }) => (
                  <div key={name} className="relative">
                    {type === 'custom' && name === 'dob' ? (
                      <div className={`flex items-center space-x-2 bg-white border ${
                        errors[name] ? 'border-red-500' : 'border-gray-300'
                      } rounded p-3 transition-colors`}>
                        <Icon className={`w-5 h-5 ${errors[name] ? 'text-red-500' : 'text-gray-600'}`} />
                        <DatePicker
                          selected={dob}
                          onChange={(date) => {
                            setDob(date);
                            setErrors(prev => ({ ...prev, [name]: '' }));
                          }}
                          placeholderText="Date of Birth"
                          className="w-full bg-transparent text-gray-900 focus:outline-none"
                          showYearDropdown
                          dropdownMode="select"
                          maxDate={new Date()}
                          dateFormat="dd/MM/yyyy"
                          withPortal={isMobile}
                          showPopperArrow={!isMobile}
                          adjustDateOnChange
                          style={{
                            width: '100%',
                            cursor: 'pointer',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none'
                          }}
                        />
                      </div>
                    ) : (
                      <div className={`flex items-center space-x-2 bg-white border ${
                        errors[name] ? 'border-red-500' : 'border-gray-300'
                      } rounded p-3 transition-colors`}>
                        <Icon className={`w-5 h-5 ${errors[name] ? 'text-red-500' : 'text-gray-600'}`} />
                        <input
                          name={name}
                          type={type}
                          placeholder={label}
                          className="w-full bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
                          onChange={(e) => {
                            if (name === 'password') setPassword(e.target.value);
                            if (name === 'confirmPassword') setConfirmPassword(e.target.value);
                            if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
                          }}
                          required={required}
                        />
                      </div>
                    )}
                    {errors[name] && (
                      <p className="text-red-600 text-xs mt-1 px-2">{errors[name]}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Human Verification */}
              <div className="flex justify-center my-6">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                    onChange={(token) => {
                      setRecaptchaToken(token);
                      if (errors.recaptcha) setErrors(prev => ({ ...prev, recaptcha: '' }));
                    }}
                  />
                </div>
                {errors.recaptcha && (
                  <p className="text-red-600 text-xs text-center mt-1">{errors.recaptcha}</p>
                )}

              {/* Terms & Conditions */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }));
                  }}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                />
                <label className="text-gray-700">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-blue-600 hover:underline"
                  >
                    Terms & Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacy(true)}
                    className="text-blue-600 hover:underline"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              {errors.terms && <p className="text-red-600 text-xs mt-1">{errors.terms}</p>}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#012970] to-[#0066cc] text-white py-3 rounded font-semibold hover:shadow-lg transition-all duration-300"
              >
                Create Account
              </button>

              <p className="text-center text-gray-700 mt-4">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-800 font-semibold hover:underline">
                  Login Here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      
      {typeof window !== 'undefined' && (
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="colored"
          toastClassName="rounded-lg backdrop-blur-sm bg-white/10"
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      )}
    </div>
  );
}