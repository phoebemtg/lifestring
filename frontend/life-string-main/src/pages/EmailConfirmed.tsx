import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EmailConfirmed: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    // Handle email confirmation when page loads
    const handleEmailConfirmation = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (accessToken && type === 'signup') {
        console.log('Email confirmation detected, setting session...');

        try {
          // Set the session with the tokens from the URL
          const refreshToken = hashParams.get('refresh_token');
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (!error) {
            console.log('Email confirmation successful');
            setIsConfirmed(true);
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            toast({
              title: "Email Confirmed!",
              description: "Welcome to Lifestring! Your account has been verified.",
            });
          } else {
            console.error('Error setting session:', error);
          }
        } catch (error) {
          console.error('Error during email confirmation:', error);
        }
      } else {
        // If no confirmation tokens, assume already confirmed
        setIsConfirmed(true);
      }

      setIsProcessing(false);
    };

    handleEmailConfirmation();
  }, [toast]);

  useEffect(() => {
    // Auto-redirect to main app after 5 seconds if user is authenticated and confirmed
    if (user && isConfirmed && !isProcessing) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [user, isConfirmed, isProcessing, navigate]);

  const handleContinue = () => {
    navigate('/');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Confirming your email...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Email Confirmed!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-3">
            <p className="text-gray-600 text-lg">
              Welcome to Lifestring! 🎉
            </p>
            <p className="text-gray-500">
              Your account has been successfully verified. You can now access all features and start connecting with others.
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleContinue}
              className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700"
            >
              Continue to Lifestring
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            {user && isConfirmed && (
              <p className="text-sm text-gray-500">
                Automatically redirecting in 5 seconds...
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Ready to start your journey of meaningful connections
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmed;
