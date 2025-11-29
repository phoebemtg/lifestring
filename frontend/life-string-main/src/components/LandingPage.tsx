import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Instagram, Tent, Calendar, Trophy, Users, Home, Heart, UserPlus, Shield, Compass, Link2, Infinity, User, Download } from 'lucide-react';
import { OvalCarousel } from '@/components/ui/oval-carousel';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
      opacity: 0.2352,
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
      opacity: 0.168,
      blur: 60,
      left: 25,
      top: 25,
      animation: 'cloud-float-2',
      delay: 5,
      duration: 25
    }, {
      color: "#4169E1",
      size: 200,
      opacity: 0.2016,
      blur: 55,
      left: 65,
      top: 20,
      animation: 'cloud-float-3',
      delay: 10,
      duration: 35
    }, {
      color: "#00CED1",
      size: 160,
      opacity: 0.1848,
      blur: 65,
      left: 75,
      top: 55,
      animation: 'cloud-float-4',
      delay: 15,
      duration: 28
    }, {
      color: "#32CD32",
      size: 140,
      opacity: 0.1344,
      blur: 70,
      left: 55,
      top: 70,
      animation: 'cloud-float-5',
      delay: 20,
      duration: 32
    }, {
      color: "#9370DB",
      size: 170,
      opacity: 0.168,
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
      opacity: 0.1176,
      blur: 75,
      left: 80,
      top: 30,
      animation: 'cloud-float-2',
      delay: 12,
      duration: 40
    }, {
      color: "#DDA0DD",
      size: 110,
      opacity: 0.084,
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
  return <div className="min-h-screen scroll-smooth relative">
      {/* Single unified background for entire page */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {getLandingBackground()}
      </div>

      {/* Hero Section */}
    <header className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Navigation - Positioned absolutely at top */}
      <nav className="absolute top-0 left-0 w-full z-10 pt-0 mt-0" role="navigation" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-8 lg:px-12 py-4">
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer transition-opacity hover:opacity-80 focus:outline-none focus-visible:outline-none">
                    <img src="/lifestring-header-logo.png" alt="LifeString Logo - Find Your House" className="h-32 w-auto object-cover object-[50%_52%] scale-[1.75] overflow-hidden" />
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
            <div className="flex items-center space-x-6">
              <Button variant="ghost" onClick={onSignIn} aria-label="Sign in to LifeString" className="font-medium">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Content - Centered on First Screen */}
      <div className="flex flex-col items-center justify-center w-full h-full relative z-10">
        <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-sans mb-4 leading-tight tracking-tight text-accent">
            Connect with new friends and find people like you
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light max-w-3xl mx-auto mb-12">
            Our Ai helps you make new friends and find people like you, or use Lifestring to find things to do with friends you already have
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-4 text-lg font-medium h-14" onClick={onStartJourney} aria-label="Create your LifeString account">
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </header>

    {/* Download Section - Below the Fold */}
    <section className="relative flex items-center justify-center overflow-hidden py-16">

      <div className="max-w-4xl w-full mx-auto px-8 lg:px-12 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold font-sans text-foreground mb-3">Download The App</h2>
        <p className="text-lg text-muted-foreground mb-8">Coming Soon</p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <a href="#" className="inline-flex items-center px-8 py-4 bg-foreground text-background rounded-lg font-medium text-lg hover:opacity-90 transition-opacity" aria-label="Download on the App Store">
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Download for iOS
          </a>
          <a href="#" className="inline-flex items-center px-8 py-4 bg-foreground text-background rounded-lg font-medium text-lg hover:opacity-90 transition-opacity" aria-label="Get it on Google Play">
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
            </svg>
            Get on Android
          </a>
        </div>
      </div>
    </section>

      {/* Personality Discovery Section */}


      {/* Our Story Section */}


      {/* Footer */}
      <footer className="relative text-foreground overflow-hidden" role="contentinfo">
        {/* Gradient mask - orbs fade out gradually from top to bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 via-50% to-background pointer-events-none z-[1]" />
        <div className="max-w-5xl mx-auto px-8 lg:px-12 py-8">
          {/* Resources links horizontally below logo, left-aligned */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12 relative z-10">
            <Link
              to="/our-story"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => window.scrollTo(0, 0)}
            >
              About
            </Link>
            <button
              onClick={onStartJourney}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Create an Account
            </button>
            <button
              onClick={onSignIn}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </button>
            <a
              href="mailto:hello@lifestring.ai"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </div>

          <div className="mt-16 pt-8 border-t border-border relative z-10">
            <div className="text-center">
              <h3 className="text-lg font-semibold font-sans mb-8">Follow Us</h3>
              <div className="flex justify-center space-x-8 mb-12">
                <a href="https://www.instagram.com/lifestringai/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram className="h-8 w-8" />
                  <span className="sr-only">Instagram</span>
                </a>
                <a href="https://www.tiktok.com/@lifestringai" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                  <span className="sr-only">TikTok</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center relative z-10">
            <p className="text-muted-foreground">
              © 2025 LifeString. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default LandingPage;