//app/components/PrivacyModal.js
'use client';

export default function PrivacyModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-[#012970]">Privacy Policy</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-[#012970] transition-colors p-2"
              aria-label="Close privacy policy"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 text-gray-600">
            <section>
              <h3 className="text-lg font-semibold text-[#012970] mb-2">1. Information We Collect</h3>
              <div className="space-y-2">
                <p className="font-medium">Personal Information:</p>
                <ul className="list-disc pl-6">
                  <li>Name, email, phone number</li>
                  <li>Date of birth and identification details</li>
                  <li>Payment information (processed securely)</li>
                </ul>
                
                <p className="font-medium mt-4">Usage Data:</p>
                <ul className="list-disc pl-6">
                  <li>Booking history and preferences</li>
                  <li>Device information and IP addresses</li>
                  <li>Cookies for session management</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#012970] mb-2">2. Data Usage</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process bookings and payments</li>
                <li>Personalize user experience</li>
                <li>Send service-related communications</li>
                <li>Improve platform functionality</li>
                <li>Prevent fraudulent activity</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#012970] mb-2">3. Data Protection</h3>
              <div className="space-y-2">
                <p>We implement:</p>
                <ul className="list-disc pl-6">
                  <li>SSL/TLS encryption</li>
                  <li>Regular security audits</li>
                  <li>Role-based access control</li>
                  <li>Secure payment processing</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#012970] mb-2">4. Third-Party Sharing</h3>
              <p>We only share data with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payment processors (Stripe, PayPal)</li>
                <li>Email service providers</li>
                <li>Legal authorities when required</li>
                <li>Analytics partners (anonymous data only)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#012970] mb-2">5. Your Rights</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">Access & Correction</p>
                  <p className="text-sm">View and update your personal information</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">Data Portability</p>
                  <p className="text-sm">Request export of your data</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">Deletion</p>
                  <p className="text-sm">Request account deletion</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">Opt-Out</p>
                  <p className="text-sm">Unsubscribe from marketing emails</p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 border-t pt-6">
            <button
              onClick={onClose}
              className="w-full bg-[#012970] text-white py-2 rounded-lg hover:bg-[#003399] transition-colors font-medium"
            >
              Close Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}