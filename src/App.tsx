import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/hooks/useLanguage";
import { useEffect } from "react";
import { initRemoteConfig } from "@/lib/admin-config";
import Index from "./pages/Index";
import Install from "./pages/Install";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // 1. Fetch remote config from Firebase on app startup
    initRemoteConfig();

    // 2. Extract Puter Token from URL callback if present and save it to localStorage
    try {
      const url = new URL(window.location.href);
      const puterToken = url.searchParams.get('puter_token') || url.searchParams.get('token');
      if (puterToken) {
        console.log("🔑 Puter token found in URL, saving to localStorage...");
        localStorage.setItem('puter.auth.token', puterToken);
        
        // Remove token from query parameters so it's clean
        url.searchParams.delete('token');
        url.searchParams.delete('puter_token');
        url.searchParams.delete('code');
        
        // Redirect back to clean URL
        window.location.href = url.origin + url.pathname + url.hash;
      }
    } catch (e) {
      console.error("Error parsing Puter callback token:", e);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/install" element={<Install />} />
                <Route path="/admin" element={<Admin />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

