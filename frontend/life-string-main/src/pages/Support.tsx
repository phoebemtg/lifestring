import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';

const Support = () => {
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
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Support</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center mb-4">
              <Mail className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Email Support</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Get help with your account, technical issues, or general questions.
            </p>
            <a 
              href="mailto:support@lifestring.ai"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              support@lifestring.ai
            </a>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center mb-4">
              <MessageCircle className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Community</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Connect with other users and get help from the community.
            </p>
            <Button variant="outline" className="w-full">
              Join Community
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">How do I create an account?</h3>
              <p className="text-gray-600">
                Click "Create Account" on the homepage and follow the registration process using your email, 
                Google, or Apple account.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">How does Lifestring connect me with people?</h3>
              <p className="text-gray-600">
                Our AI analyzes your profile, interests, and preferences to suggest compatible connections 
                and relevant activities in your area.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
