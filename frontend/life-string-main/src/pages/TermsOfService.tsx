
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="w-full">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link to="/">
                <img 
                  src="/lifestring-header-logo.png" 
                  alt="LifeString Logo"
                  className="h-16 w-auto object-contain"
                />
              </Link>
            </div>
            <Link to="/">
              <Button variant="ghost">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Terms Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
          Terms of Service
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: December 13, 2024
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing and using LifeString ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
          <p className="text-gray-700 mb-4">
            LifeString is a personality-based community platform that connects users with like-minded individuals through our unique house system. The service includes personality assessments, community features, and social networking capabilities.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
          <p className="text-gray-700 mb-4">
            To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. User Conduct</h2>
          <p className="text-gray-700 mb-4">
            You agree not to use the Service to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Violate any applicable laws or regulations</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Post inappropriate, offensive, or harmful content</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Interfere with the proper functioning of the Service</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Content and Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
            The Service and its original content, features, and functionality are and will remain the exclusive property of LifeString and its licensors. The Service is protected by copyright, trademark, and other laws.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Privacy</h2>
          <p className="text-gray-700 mb-4">
            Your privacy is important to us. We collect and use information in accordance with our Privacy Policy, which is incorporated into these Terms by reference.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Termination</h2>
          <p className="text-gray-700 mb-4">
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Disclaimer</h2>
          <p className="text-gray-700 mb-4">
            The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, LifeString excludes all representations, warranties, conditions, and terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            In no event shall LifeString be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Changes to Terms</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Contact Information</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <p className="text-gray-700 mb-4">
            Email: hello@lifestring.co
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
