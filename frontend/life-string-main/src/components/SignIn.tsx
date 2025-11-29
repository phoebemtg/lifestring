import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import lifestringLogo from '@/assets/lifestring-header-logo.png';
interface SignInProps {
  onSignInComplete: (user: {
    name: string;
  }) => void;
  onBack: () => void;
}
const SignIn = ({
  onSignInComplete,
  onBack
}: SignInProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();

  // Development bypass flag - set to false to remove
  const SHOW_DEV_BYPASS = false;
  const handleDevBypass = () => {
    onSignInComplete({
      name: "Dev User"
    });
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    try {
      switch (provider) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'apple':
          await signInWithApple();
          break;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to sign in with ${provider}`,
        variant: "destructive",
      });
    } finally {
      setSocialLoading(null);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
      const name = email.split('@')[0];
      onSignInComplete({
        name
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = "Please check your email and password";

      // Provide more specific error messages
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Please check your email and click the confirmation link before signing in.";
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = "Too many sign-in attempts. Please wait a moment before trying again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      
      <Card className="w-full max-w-md bg-white shadow-sm border border-gray-200 relative z-10">
        <CardHeader className="text-center pb-8 relative">
          <Button onClick={onBack} variant="ghost" className="absolute top-4 left-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <img src={lifestringLogo} alt="Lifestring" className="h-12 mx-auto object-cover" style={{ transform: 'scale(5)' }} />
          <div className="text-sm font-light text-gray-600 mt-4">Welcome Back to Lifestring</div>
          
        </CardHeader>
        <CardContent className="space-y-6">
          {!showEmailForm ? (
            // Social login buttons
            <div className="space-y-4">
              <Button
  onClick={() => handleSocialLogin('google')}
  variant="outline"
  className="w-full h-12 border-gray-300 hover:bg-gray-50"
  disabled={socialLoading !== null}
>
  {socialLoading === 'google' ? (
    "Connecting..."
  ) : (
    <>
      <svg
        className="w-5 h-5 mr-3 pointer-events-none" // 👈 add this
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Continue with Google
    </>
  )}
</Button>




              <Button
                onClick={() => handleSocialLogin('apple')}
                variant="outline"
                className="w-full h-12 border-gray-300 hover:bg-gray-50"
                disabled={socialLoading !== null}
              >
                {socialLoading === 'apple' ? (
                  "Connecting..."
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Continue with Apple
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button
                onClick={() => setShowEmailForm(true)}
                variant="outline"
                className="w-full h-12 border-gray-300 hover:bg-gray-50"
              >
                <Mail className="w-5 h-5 mr-3" />
                Continue with email
              </Button>
            </div>
          ) : (
            // Email form
            <form onSubmit={handleSubmit} className="space-y-6">
              <Button
                type="button"
                onClick={() => setShowEmailForm(false)}
                variant="ghost"
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to social login
              </Button>
              
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 border-gray-300 focus:border-gray-900 focus:ring-gray-900" placeholder="your@email.com" required />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 border-gray-300 focus:border-gray-900 focus:ring-gray-900" placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                <p>Having trouble signing in?</p>
                <p className="mt-1">Make sure you've confirmed your email address if you recently signed up.</p>
              </div>
            </form>
          )}
          
          {SHOW_DEV_BYPASS && <div className="pt-4 border-t border-gray-200">
              <Button onClick={handleDevBypass} variant="outline" className="w-full text-xs bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100">
                DEV: Skip Sign In
              </Button>
            </div>}
        </CardContent>
      </Card>
    </div>;
};
export default SignIn;