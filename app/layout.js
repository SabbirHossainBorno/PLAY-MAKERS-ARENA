import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastNotifications from '@/app/components/ToastNotifications';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PLAY MAKERS ARENA",
  description: "The Ultimate Futsal Experience",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <ToastNotifications />
      </body>
    </html>
  );
}