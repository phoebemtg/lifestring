

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import OurStory from "./pages/OurStory";
import Blog from "./pages/Blog";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import NewsArticle1 from "./pages/NewsArticle1";
import NewsArticle2 from "./pages/NewsArticle2";
import StringConversationPage from "./pages/StringConversationPage";
import EmailConfirmed from "./pages/EmailConfirmed";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/our-story" element={<OurStory />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/news/article-1" element={<NewsArticle1 />} />
              <Route path="/news/article-2" element={<NewsArticle2 />} />
              <Route path="/string/:stringId" element={<StringConversationPage />} />
              <Route path="/email-confirmed" element={<EmailConfirmed />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
