import React from 'react';
import { Button } from '@/components/ui/button';
import { Instagram } from 'lucide-react';
import lifestringLogo from '@/assets/lifestring-header-logo.png';

const MobileComingSoon = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
      {/* Header */}
      <header className="p-6 text-center">
        <img 
          src={lifestringLogo} 
          alt="LifeString Logo" 
          className="h-16 w-auto mx-auto mb-4"
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Coming Soon to Mobile
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            We're working hard to bring Lifestring to your mobile device. 
            In the meantime, visit us on desktop to start connecting!
          </p>

          <div className="space-y-4 mb-12">
            <Button 
              size="lg" 
              className="w-full px-8 py-4 text-lg font-medium h-14"
              onClick={() => window.open('https://lifestring.ai', '_blank')}
            >
              Visit Desktop Version
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Or get notified when our mobile app launches
            </p>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full px-8 py-4 text-lg font-medium h-14"
              onClick={() => window.open('mailto:hello@lifestring.ai?subject=Mobile App Notification', '_blank')}
            >
              Notify Me
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-8">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Follow us on TikTok"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
              </svg>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          © 2025 LifeString. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default MobileComingSoon;
