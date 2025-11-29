import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Heart, Zap } from 'lucide-react';

const About = () => {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Lifestring</h1>
        
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-xl text-gray-700 mb-6">
            Lifestring is an AI that connects you with people like you.
          </p>
          
          <p className="text-gray-700 mb-6">
            We all want to find friends who are like us—and people to do things with. 
            On Lifestring, we've made this as simple as asking.
          </p>
          
          <p className="text-gray-700 mb-6">
            Lifestring helps you find friends like you and people for activities, whether that's 
            founding a company, doing a hobby, or traveling around the world.
          </p>
          
          <p className="text-gray-700 mb-8">
            Our AI gets to know you, so it can connect you with people, places, and things to do.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect</h3>
            <p className="text-gray-600">
              Find people who share your interests, values, and goals.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Discover</h3>
            <p className="text-gray-600">
              Explore activities and experiences tailored to your preferences.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Grow</h3>
            <p className="text-gray-600">
              Build meaningful relationships and expand your social circle.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm border">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 text-lg">
            To make meaningful connections accessible to everyone by leveraging AI to understand 
            what makes people compatible and helping them find each other.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
