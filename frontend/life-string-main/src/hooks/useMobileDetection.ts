import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check for mobile user agents
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileUserAgent = mobileRegex.test(navigator.userAgent);
      
      // Check for touch capability
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Check screen width (mobile-first approach)
      const isSmallScreen = window.innerWidth <= 768;
      
      // Consider it mobile if any of these conditions are true
      setIsMobile(isMobileUserAgent || (isTouchDevice && isSmallScreen));
    };

    // Check on mount
    checkMobile();

    // Check on resize
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
};
