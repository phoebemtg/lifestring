
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const SupabaseConfigError = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white shadow-sm border border-red-200">
        <CardHeader className="text-center pb-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-xl font-semibold text-red-700">
            Supabase Configuration Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your Supabase environment variables are not configured. 
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">Required variables:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• VITE_SUPABASE_URL</li>
              <li>• VITE_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600">
            Please set these in your Supabase project settings to enable authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseConfigError;
