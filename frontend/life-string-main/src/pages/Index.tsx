import { useState, useEffect } from "react";
import LandingPage from "../components/LandingPage";
import CommonRoom from "../components/CommonRoom";
import AuthPage from "../components/AuthPage";
import SignIn from "../components/SignIn";
import ViewProfile from "../components/ViewProfile";
import { useAuth } from "../hooks/useAuth";
import lifestringLogo from '@/assets/lifestring-header-logo.png';

// Removed Community interface and franklinCommunity object - no longer needed

function AppContent() {
  const { user, userProfile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'loading' | 'landing' | 'auth' | 'signin' | 'commonroom' | 'viewprofile'>('loading');
  const [userName, setUserName] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [intendedDestination, setIntendedDestination] = useState<string | null>(null);

  useEffect(() => {
    console.log('AppContent useEffect triggered');
    console.log('Loading:', loading, 'User:', !!user, 'User ID:', user?.id, 'UserProfile:', !!userProfile, 'Profile ID:', userProfile?.id);
    console.log('HasInitialized:', hasInitialized, 'CurrentView:', currentView);
    
    // Check URL parameters for journey start  
    const urlParams = new URLSearchParams(window.location.search);
    const startJourney = urlParams.get('startJourney');

    // Check for startJourney parameter
    if (startJourney === 'true') {
      console.log('StartJourney parameter detected, triggering journey start');
      // Clean up URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (user && userProfile) {
        // Direct all users to Franklin Community
        setUserName(userProfile.full_name);
        setCurrentView('commonroom');
      } else {
        // No user, go to auth
        setCurrentView('auth');
      }
      setHasInitialized(true);
      return;
    }

    // Handle auth logic - run when loading is complete
    if (!loading) {
      if (!hasInitialized) {
        console.log('Initializing app state...');
        setHasInitialized(true);
      }

      // Always check if we should redirect to common room when both user and profile exist
      if (user && userProfile && (currentView === 'loading' || currentView === 'landing')) {
        console.log('✅ User and profile loaded, redirecting to common room');
        setUserName(userProfile.full_name || user.email?.split('@')[0] || 'User');
        setCurrentView('commonroom');
      } else if (!user && (currentView === 'loading' || (currentView !== 'landing' && currentView !== 'auth' && currentView !== 'signin'))) {
        // User signed out or no user, redirect to landing
        console.log('❌ No user, redirecting to landing');
        setCurrentView('landing');
      }
    }
  }, [user, userProfile, loading, hasInitialized]);

  const handleStartJourney = () => {
    console.log('handleStartJourney called - User:', user, 'UserProfile:', userProfile);
    console.log('User ID:', user?.id, 'Loading:', loading);

    // FORCE AUTHENTICATION - Always go to auth page for Create Account
    console.log('Create Account clicked - forcing authentication flow');
    setIntendedDestination('commonroom');
    setCurrentView('auth');
    return;
  };

  const handleSignInClick = () => {
    setCurrentView('signin');
  };

  const handleAuthComplete = (user: { name: string }) => {
    setUserName(user.name);
    
    // Handle intended destination after auth completion
    if (intendedDestination === 'commonroom') {
      setCurrentView('commonroom');
      setIntendedDestination(null);
    } else {
      setCurrentView('commonroom');
    }
  };

  const handleSignInComplete = (user: { name: string }) => {
    setUserName(user.name);
    setCurrentView('commonroom');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleJoinHouse = () => {
    console.log('handleJoinHouse called - User:', user, 'UserProfile:', userProfile);
    
    // BLOCK ACCESS - Always require authentication first
    if (!user || !userProfile) {
      console.log('No user/profile found for join house, redirecting to auth');
      setIntendedDestination('commonroom');
      setCurrentView('auth');
      return;
    }
    
    console.log('User authenticated, directing to Franklin Community');
    setCurrentView('commonroom');
  };

  const handleViewProfile = (user: any) => {
    setSelectedUser(user);
    setCurrentView('viewprofile');
  };

  const handleBackToCommonRoom = () => {
    setCurrentView('commonroom');
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  switch (currentView) {
    case 'loading':
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <img
              src={lifestringLogo}
              alt="Lifestring"
              className="h-16 w-auto mx-auto mb-4 object-contain animate-pulse"
            />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    case 'auth':
      return (
        <AuthPage
          onAuthComplete={handleAuthComplete}
          onBack={handleBackToLanding}
        />
      );
    case 'signin':
      return (
        <SignIn
          onSignInComplete={handleSignInComplete}
          onBack={handleBackToLanding}
        />
      );
    case 'viewprofile':
      return selectedUser ? (
        <ViewProfile
          user={selectedUser}
          onBack={handleBackToCommonRoom}
        />
      ) : null;
    case 'commonroom':
      return (
        <CommonRoom
          onBack={handleBackToLanding}
          onBackToLanding={handleBackToLanding}
          userName={userName || userProfile?.full_name || 'User'}
        />
      );
    default:
      return (
        <LandingPage
          onStartJourney={handleStartJourney}
          onSignIn={handleSignInClick}
          onCommunityClick={handleJoinHouse}
        />
      );
  }
}

const Index = () => {
  return <AppContent />;
};

export default Index;