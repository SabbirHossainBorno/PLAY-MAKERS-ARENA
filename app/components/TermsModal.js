//app/components/TermsModal.js
'use client';

export default function TermsModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-[#012970]">Play Makers Arena Terms of Service</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-[#012970] transition-colors p-2"
              aria-label="Close terms"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 text-gray-600">
            <section>
              <h3 className="text-lg font-semibold text-[#012970] mb-2">1. Acceptance of Terms</h3>
              <p className="mb-4">
                By accessing or using the Play Makers Arena (PMA) platform, you agree to be bound by these Terms of Service. 
                If you do not agree to all terms, you may not access or use our services.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#012970] mb-2">2. Account Registration</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 13 years old to create an account</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Immediately notify PMA of any unauthorized account use</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#012970] mb-2">3. Booking & Payments</h3>
              <div className="space-y-2">
                <p>➤ Court bookings are subject to availability</p>
                <p>➤ Cancellations must be made 24 hours prior for full refund</p>
                <p>➤ Late arrivals exceeding 15 minutes forfeit booking</p>
                <p>➤ Damage to facilities may result in penalty charges</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#012970] mb-2">4. Code of Conduct</h3>
              <p className="mb-2">Users agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Respect all players and staff</li>
                <li>Maintain sportsmanlike behavior</li>
                <li>Wear appropriate athletic footwear</li>
                <li>Follow all facility safety rules</li>
                <li>No alcohol or illegal substances on premises</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#012970] mb-2">5. Liability</h3>
              <p>
                PMA is not liable for:
                <br />
                • Personal injuries sustained during play
                <br />
                • Loss or damage to personal property
                <br />
                • Interruptions to service due to maintenance or unforeseen circumstances
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 border-t pt-6">
            <button
              onClick={onClose}
              className="w-full bg-[#012970] text-white py-2 rounded-lg hover:bg-[#003399] transition-colors font-medium"
            >
              Close Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}