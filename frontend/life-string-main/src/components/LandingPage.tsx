import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Instagram, Tent, Calendar, Trophy, Users, Home, Heart, UserPlus, Shield, Compass, Link2, Infinity, User, Download } from 'lucide-react';
import { OvalCarousel } from '@/components/ui/oval-carousel';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import lifestringLogo from '@/assets/lifestring-header-logo.png';
interface LandingPageProps {
  onStartJourney: () => void;
  onSignIn: () => void;
  onCommunityClick: () => void;
}
const LandingPage = ({
  onStartJourney,
  onSignIn,
  onCommunityClick
}: LandingPageProps) => {
  const { signOut, user } = useAuth();

  // Note: Removed automatic sign out - users stay signed in when visiting landing page

  const downloadLogo = () => {
    const link = document.createElement('a');
    link.href = '/lifestring-header-logo.png';
    link.download = 'lifestring-logo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const getLandingBackground = () => {
    // Improved golden spiral layout with better structure
    const orbConfigurations = [
    // Large center orb
    {
      color: "#FFD700",
      size: 250,
      opacity: 0.12,
      blur: 50,
      left: 45,
      top: 40,
      animation: 'cloud-float-1',
      delay: 0,
      duration: 30
    },
    // Golden ratio spiral - moving outward
    {
      color: "#FF69B4",
      size: 180,
      opacity: 0.08,
      blur: 60,
      left: 25,
      top: 25,
      animation: 'cloud-float-2',
      delay: 5,
      duration: 25
    }, {
      color: "#4169E1",
      size: 200,
      opacity: 0.10,
      blur: 55,
      left: 65,
      top: 20,
      animation: 'cloud-float-3',
      delay: 10,
      duration: 35
    }, {
      color: "#00CED1",
      size: 160,
      opacity: 0.09,
      blur: 65,
      left: 75,
      top: 55,
      animation: 'cloud-float-4',
      delay: 15,
      duration: 28
    }, {
      color: "#32CD32",
      size: 140,
      opacity: 0.07,
      blur: 70,
      left: 55,
      top: 70,
      animation: 'cloud-float-5',
      delay: 20,
      duration: 32
    }, {
      color: "#9370DB",
      size: 170,
      opacity: 0.08,
      blur: 58,
      left: 15,
      top: 60,
      animation: 'cloud-float-1',
      delay: 25,
      duration: 27
    },
    // Accent orbs for depth
    {
      color: "#87CEEB",
      size: 120,
      opacity: 0.06,
      blur: 75,
      left: 80,
      top: 30,
      animation: 'cloud-float-2',
      delay: 12,
      duration: 40
    }, {
      color: "#DDA0DD",
      size: 110,
      opacity: 0.05,
      blur: 80,
      left: 10,
      top: 15,
      animation: 'cloud-float-3',
      delay: 18,
      duration: 22
    }];
    const cloudOrbs = orbConfigurations.map((config, index) => <div key={index} className={`absolute rounded-full animate-${config.animation} will-change-transform transform-gpu`} style={{
      width: `${config.size}px`,
      height: `${config.size}px`,
      backgroundColor: config.color,
      opacity: config.opacity,
      filter: `blur(${config.blur}px)`,
      left: `${config.left}%`,
      top: `${config.top}%`,
      animationDelay: `${config.delay}s`,
      animationDuration: `${config.duration}s`,
      backfaceVisibility: 'hidden'
    }} />);
    return <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {cloudOrbs}
      </div>;
  };
  return <div className="min-h-screen scroll-smooth">
      {/* Hero Section */}
    <header className="relative bg-gradient-to-br from-background via-background to-muted/30 min-h-screen flex items-center justify-center overflow-hidden">
      {/* Navigation - Positioned absolutely at top */}
      <nav className="absolute top-0 left-0 w-full z-10 pt-0 mt-0" role="navigation" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-8 lg:px-12 pt-0 mt-0">
          <div className="flex justify-between items-start pt-0 mt-0">
            <div className="flex-shrink-0 ml-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer transition-opacity hover:opacity-80 focus:outline-none focus-visible:outline-none">
                    <img src={lifestringLogo} alt="LifeString Logo - Find Your House" className="h-32 w-auto object-cover object-[50%_52%] scale-[1.75] overflow-hidden" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border border-border z-50">
                  <DropdownMenuItem onClick={downloadLogo} className="cursor-pointer">
                    <Download className="mr-2 h-4 w-4" />
                    Download as PNG
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-start space-x-6 mt-9">
              <Button variant="ghost" onClick={onSignIn} aria-label="Sign in to LifeString" className="font-medium">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>
  {getLandingBackground()}
  <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
    <h1 className="text-4xl md:text-6xl font-bold font-sans mb-4 leading-tight tracking-tight text-accent">
      The AI powering a new era of connection
    </h1>
    <h2 className="text-2xl md:text-3xl font-semibold font-sans mb-8 leading-tight tracking-tight text-foreground">
      Transforming the way you connect
    </h2>
    <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light max-w-3xl mx-auto mb-12">
      Lifestring makes making new friends and connecting with people like you easy.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" className="px-8 py-4 text-lg font-medium h-14" onClick={onStartJourney} aria-label="Create your LifeString account">
        Create Account
      </Button>
    </div>
  </div>
    </header>

      {/* Download Our App Section */}
      <section className="bg-muted/20 py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-8 lg:px-12">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold font-sans text-foreground mb-8">Download The App</h2>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="#" className="inline-flex items-center px-8 py-4 bg-foreground text-background rounded-lg font-medium text-lg hover:opacity-90 transition-opacity" aria-label="Download on the App Store">
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                Download on iOS
              </a>
              <a href="#" className="inline-flex items-center px-8 py-4 bg-foreground text-background rounded-lg font-medium text-lg hover:opacity-90 transition-opacity" aria-label="Get it on Google Play">
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                Get on Android
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About LifeString Section */}
      <section className="bg-background py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-8 lg:px-12">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold font-sans text-black mb-8">
              About LifeString
            </h2>
            <div className="space-y-6 text-xl text-gray-600 leading-relaxed font-light max-w-4xl mx-auto">
              <p>Lifestring is an AI that connects you with people like you.</p>
              <p>We all want to find friends who are like us—and people to do things with.</p>
              <p>On Lifestring, we've made this as simple as asking.</p>
              <p>Lifestring helps you find friends like you and people for activities, whether that's founding a company, doing a hobby, or traveling around the world.</p>
              <p>Our AI gets to know you, so it can connect you with people, places, and things to do.</p>
            </div>
          </div>
        </div>
      </section>

    </div>;
};
export default LandingPage;
