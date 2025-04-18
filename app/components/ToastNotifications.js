// components/ToastNotifications.js
'use client';

import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const ToastNotifications = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      newestOnTop
      closeOnClick
      draggable
      pauseOnHover
      toastStyle={{
        position: 'relative',
        minHeight: '64px',
        margin: '16px',
        borderRadius: '14px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        padding: '16px 24px',
        gap: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      bodyStyle={{
        padding: 0,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#1a1a1a',
        fontSize: '14px',
        fontWeight: 500,
      }}
      progressStyle={{
        background: 'linear-gradient(90deg, rgba(100, 108, 255, 0.5) 0%, rgba(154, 101, 255, 0.5) 100%)',
        height: '2px',
      }}
      closeButton={({ closeToast }) => (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '4px',
            borderRadius: '8px',
            background: isHovered ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={closeToast}
        >
          <FiX style={{ width: '18px', height: '18px', color: '#666' }} />
        </div>
      )}
      icon={({ type }) => {
        const iconConfig = {
          success: {
            icon: FiCheckCircle,
            color: '#22c55e',
          },
          error: {
            icon: FiAlertTriangle,
            color: '#ef4444',
          },
          info: {
            icon: FiInfo,
            color: '#3b82f6',
          },
        }[type] || { icon: FiInfo, color: '#3b82f6' };

        const Icon = iconConfig.icon;
        return <Icon style={{ width: '24px', height: '24px', color: iconConfig.color }} />;
      }}
    />
  );
};

export default ToastNotifications;