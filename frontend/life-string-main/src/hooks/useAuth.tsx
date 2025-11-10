
import { useState, useEffect, createContext, useContext } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  full_name?: string
  phone?: string
  address?: string
  house_id?: number
  enneagram_type?: number
  background_color?: string
  created_at?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, name: string, phone?: string, address?: string) => Promise<{ error?: any }>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  signOut: () => Promise<void>
  updateUserEnneagram: (enneagramType: number, backgroundColor?: string) => Promise<void>
  completeProfile: (name: string, phone: string, address: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Handle OAuth callback and email confirmation redirect
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      // Handle OAuth callback (Google, Apple, etc.)
      if (accessToken && refreshToken && !type) {
        console.log('🔵 OAuth callback detected, setting session...');

        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (!error && data.user) {
            console.log('✅ OAuth callback successful, user signed in:', data.user.id);
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            toast({
              title: "Welcome to Lifestring!",
              description: "You've successfully signed in with Google.",
            });
          } else {
            console.error('❌ OAuth callback error:', error);
          }
        } catch (error) {
          console.error('❌ Error handling OAuth callback:', error);
        }
      }
      // Handle email confirmation
      else if (accessToken && type === 'signup') {
        console.log('📧 Email confirmation detected, setting session...');

        try {
          if (refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (!error && data.user) {
              console.log('✅ Email confirmation successful, user signed in:', data.user.id);
              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname);
              toast({
                title: "Email Confirmed!",
                description: "Welcome to Lifestring! Your account has been verified.",
              });
            }
          }
        } catch (error) {
          console.error('❌ Error handling email confirmation:', error);
        }
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      // First handle any auth callback
      await handleAuthCallback();

      const { data: { session } } = await supabase.auth.getSession()
      console.log('Initial session check:', session?.user?.id)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchOrCreateUserProfile(session.user)
      }
      setLoading(false)
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        setUser(session?.user ?? null)

        if (session?.user) {
          setTimeout(() => {
            fetchOrCreateUserProfile(session.user)
          }, 100)
        } else {
          setUserProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchOrCreateUserProfile = async (user: User) => {
    try {
      console.log('Fetching or creating user profile for:', user.id)

      // Try to fetch from user_profiles table first
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', fetchError)
      }

      if (existingProfile) {
        console.log('Found existing user profile:', existingProfile)
        setUserProfile(existingProfile)
      } else {
        // User profile should be created automatically by database trigger
        // If not found, wait a moment and try again, then fall back to mock profile
        console.log('No user profile found, waiting for trigger to create it...')

        setTimeout(async () => {
          try {
            const { data: retryProfile, error: retryError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle()

            if (retryProfile && !retryError) {
              console.log('Found user profile after retry:', retryProfile)
              const formattedProfile = {
                id: retryProfile.id,
                user_id: retryProfile.user_id,
                full_name: retryProfile.contact_info?.name || 'User',
                phone: retryProfile.meta?.phone || null,
                address: retryProfile.meta?.address || null,
                house_id: null,
                enneagram_type: retryProfile.enneagram_type || null,
                background_color: retryProfile.background_color || '#3B82F6',
                created_at: retryProfile.created_at
              }
              setUserProfile(formattedProfile)
            } else {
              // Fall back to mock profile if trigger didn't work
              console.log('Trigger did not create profile, using mock profile')
              const mockProfile = {
                id: user.id,
                full_name: user.user_metadata?.name || 'User',
                phone: user.user_metadata?.phone || null,
                address: user.user_metadata?.address || null,
                house_id: null,
                enneagram_type: null,
                background_color: '#3B82F6',
                created_at: new Date().toISOString()
              }
              setUserProfile(mockProfile)
            }
          } catch (error) {
            console.error('Error in retry fetch:', error)
            // Final fallback
            const mockProfile = {
              id: user.id,
              full_name: user.user_metadata?.name || 'User',
              phone: user.user_metadata?.phone || null,
              address: user.user_metadata?.address || null,
              house_id: null,
              enneagram_type: null,
              background_color: '#3B82F6',
              created_at: new Date().toISOString()
            }
            setUserProfile(mockProfile)
          }
        }, 1000) // Wait 1 second for trigger to complete
      }
    } catch (error) {
      console.error('Error in fetchOrCreateUserProfile:', error)
    }
  }

  const signUp = async (email: string, password: string, name: string, phone?: string, address?: string) => {
    console.log('Starting signup process for:', email)

    // Always redirect to production URL for email confirmation
    const redirectUrl = 'https://life-string-main.vercel.app/email-confirmed';
    console.log('Using redirect URL:', redirectUrl);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl, // Redirect to production domain after email confirmation
        data: {
          name: name,
          phone: phone,
          address: address
        }
      }
    })

    if (error) {
      console.error('Signup error:', error)
      return { error }
    }

    console.log('Signup successful, user data:', data)

    // For now, just return success and let user know they need to check email
    // We'll implement auto-confirmation later when backend is stable
    return {}
  }

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign in error:', error)
      throw error
    }

    console.log('Sign in successful:', data.user?.id)
  }

  const signInWithGoogle = async () => {
    try {
      console.log('🔵 Attempting Google OAuth sign in...');

      // Use current origin, but fallback to main production URL if localhost
      let redirectUrl = window.location.origin;
      if (redirectUrl.includes('localhost')) {
        redirectUrl = 'https://life-string-main.vercel.app';
      }
      console.log('🔗 OAuth redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('❌ Google OAuth error:', error);
        if (error.message.includes('provider is not enabled')) {
          toast({
            title: "Google Sign In Not Available",
            description: "Google authentication needs to be configured in Supabase. Please use email/password sign in for now.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Google Sign In Error",
            description: error.message || "Failed to sign in with Google. Please try again.",
            variant: "destructive",
          });
        }
        throw error;
      }

      console.log('✅ Google OAuth initiated successfully');
      // OAuth redirect will happen automatically if successful

    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      if (!error.message?.includes('provider is not enabled')) {
        toast({
          title: "Google Sign In Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    }
  }



  const signInWithApple = async () => {
    try {
      console.log('🍎 Attempting Apple OAuth sign in...');

      // Use current origin, but fallback to main production URL if localhost
      let redirectUrl = window.location.origin;
      if (redirectUrl.includes('localhost')) {
        redirectUrl = 'https://life-string-main.vercel.app';
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl
        }
      })

      if (error) {
        console.error('❌ Apple OAuth error:', error);
        if (error.message.includes('provider is not enabled')) {
          toast({
            title: "Apple Sign In Not Available",
            description: "Apple authentication needs to be configured in Supabase. Please use email/password sign in for now.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Apple Sign In Error",
            description: error.message || "Failed to sign in with Apple. Please try again.",
            variant: "destructive",
          });
        }
        throw error;
      }

      console.log('✅ Apple OAuth initiated successfully');
      // OAuth redirect will happen automatically if successful

    } catch (error: any) {
      console.error('❌ Apple sign in error:', error);
      if (!error.message?.includes('provider is not enabled')) {
        toast({
          title: "Apple Sign In Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUserProfile(null)
  }

  const updateUserEnneagram = async (enneagramType: number, backgroundColor: string = '#3B82F6') => {
    if (!user || !userProfile) return

    try {
      setLoading(true);

      // Skip database update due to user_profiles schema issues
      // Just update local state
      setUserProfile(prev => prev ? {
        ...prev,
        enneagram_type: enneagramType,
        background_color: backgroundColor
      } : null);
    } catch (error) {
      console.error('Error updating user Enneagram type:', error);
      setError((error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (name: string, phone: string, address: string) => {
    if (!user) return

    console.log('Completing user profile for:', user.id)

    // Skip database update due to user_profiles schema issues
    // Just update local state
    setUserProfile(prev => prev ? {
      ...prev,
      full_name: name,
      phone,
      address,
      needsCompletion: false
    } : null);
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    updateUserEnneagram,
    completeProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
