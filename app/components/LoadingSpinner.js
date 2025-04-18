// app/components/LoadingSpinner.js (updated)
'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

const LoadingSpinner = ({ type = 'global' }) => {
  return (
    <div className={`${type === 'global' ? 'fixed inset-0 z-[9999]' : 'inline-block'} bg-black/50 backdrop-blur-sm flex items-center justify-center`}>
      <div className="relative h-32 w-32">
        <div 
          className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-900"
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-28 w-28">
          <Image 
            src="/images/loading.gif"
            alt="Loading" 
            width={112}
            height={112}
            className="rounded-full object-contain"
            priority
            unoptimized
          />
        </div>
      </div>
    </div>
  );
};

export const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = useCallback(() => setIsLoading(true), []);
  const hideLoading = useCallback(() => setIsLoading(false), []);

  return { isLoading, showLoading, hideLoading };
};

export default LoadingSpinner;