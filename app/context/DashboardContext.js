// app/context/DashboardContext.js
'use client';
import { createContext, useState, useContext } from 'react';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [bookingData, setBookingData] = useState(null);

  return (
    <DashboardContext.Provider value={{ bookingData, setBookingData }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}