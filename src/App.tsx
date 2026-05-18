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

    // 2. Handle Puter Auth Callback Redirection
    try {
      const url = new URL(window.location.href);
      const isNativeApp = !!(window as any).Capacitor?.isNativePlatform?.();

      // Case A: Running on the live website and received a native login callback
      if (!isNativeApp && url.searchParams.get('native_auth') === 'true') {
        const token = url.searchParams.get('puter_token') || url.searchParams.get('token');
        if (token) {
          console.log("🌐 Live website: Redirecting Puter token to native app via deep link...");
          window.location.href = `aikurdi://auth?token=${token}`;
          return;
        }
      }

      // Case B: Running in native app, check if we booted up with token in URL (fallback)
      if (isNativeApp) {
        const puterToken = url.searchParams.get('puter_token') || url.searchParams.get('token');
        if (puterToken) {
          console.log("🔑 Native App startup: Puter token found in URL, saving...");
          localStorage.setItem('puter.auth.token', puterToken);
          url.searchParams.delete('token');
          url.searchParams.delete('puter_token');
          url.searchParams.delete('code');
          window.location.href = url.origin + url.pathname + url.hash;
        }
      }
    } catch (e) {
      console.error("Error parsing Puter callback token on boot:", e);
    }

    // 3. Native App: Listen for incoming deep links (aikurdi://auth?token=...)
    let deepLinkListener: any = null;
    const setupDeepLinkListener = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        const { Browser } = await import('@capacitor/browser');
        
        deepLinkListener = await CapApp.addListener('appUrlOpen', (event) => {
          console.log("📱 Native App opened via URL scheme:", event.url);
          try {
            const parsedUrl = new URL(event.url);
            if (parsedUrl.scheme === 'aikurdi' || parsedUrl.host === 'auth' || parsedUrl.pathname.includes('auth')) {
              const token = parsedUrl.searchParams.get('token');
              if (token) {
                console.log("🔑 Deep link: Saving Puter auth token:", token);
                localStorage.setItem('puter.auth.token', token);
                
                // Automatically close the in-app browser overlay
                Browser.close().catch(() => {});
                
                // Reload the app to initialize Puter SDK
                setTimeout(() => {
                  window.location.reload();
                }, 300);
              }
            }
          } catch (err) {
            console.error("Error handling appUrlOpen event:", err);
          }
        });
      } catch (err) {
        console.error("Error setting up CapApp deep link listener:", err);
      }
    };

    setupDeepLinkListener();

    return () => {
      if (deepLinkListener) {
        deepLinkListener.remove().catch(() => {});
      }
    };
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

