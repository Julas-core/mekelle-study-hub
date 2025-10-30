import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import AnalyticsWrapper from "./components/AnalyticsWrapper";
import CookieConsent from "./components/CookieConsent";
import { Footer } from "./components/Footer";
import Header from "./components/Header";
import { supabase } from "@/integrations/supabase/client";
import MuslimNameDetectionWrapper from "./components/MuslimNameDetectionWrapper";
import { useAuth } from '@/hooks/useAuth';
import FirstTimeUploadModal from './components/FirstTimeUploadModal';
import { ClerkProvider } from './providers/ClerkProvider';
import Index from "./pages/Index";
import ClerkAuth from "./pages/ClerkAuth";
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import Profile from "./pages/Profile";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import StudyGroups from "./pages/StudyGroups";

const queryClient = new QueryClient();

declare global {
  interface Window {
    dataLayer: any[];
    gtag: any;
  }
}

// AppContent component that uses Clerk hooks (must be inside ClerkProvider)
function AppContent() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showFirstUploadModal, setShowFirstUploadModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Show first-time upload modal once per user after sign-in
    const key = user ? `mu_first_upload_shown:${user.id}` : null;
    if (user && key && !localStorage.getItem(key)) {
      setShowFirstUploadModal(true);
    }
    // If user signed out, hide modal
    if (!user) setShowFirstUploadModal(false);
  }, [user]);

  const handleCloseFirstUpload = () => {
    if (user) localStorage.setItem(`mu_first_upload_shown:${user.id}`, '1');
    setShowFirstUploadModal(false);
  };

  const handleUploadFromModal = () => {
    if (user) localStorage.setItem(`mu_first_upload_shown:${user.id}`, '1');
    setShowFirstUploadModal(false);
  };

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url, updated_at')
          .eq('id', user.id)
          .single();
        
        if (data?.avatar_url) {
          const version = data.updated_at ? new Date(data.updated_at as string).getTime() : Date.now();
          setAvatarUrl(`${data.avatar_url}?u=${user.id}&v=${version}`);
        } else {
          setAvatarUrl(null);
        }
      } else {
        setAvatarUrl(null);
      }
    };

    fetchUserAvatar();

    const onProfileUpdated = (e: any) => {
      const avatar = e?.detail?.avatarUrl ?? null;
      if (avatar) setAvatarUrl(avatar);
      else setAvatarUrl(null);
    };

    window.addEventListener('profile-updated', onProfileUpdated as EventListener);

    return () => {
      window.removeEventListener('profile-updated', onProfileUpdated as EventListener);
    };
  }, [user]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AnalyticsWrapper>
          <div className="flex flex-col min-h-screen">
            <Header avatarUrl={avatarUrl} />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<ClerkAuth />} />
                <Route path="/register" element={<ClerkAuth />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/help" element={<Help />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/study-groups" element={<StudyGroups />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <CookieConsent />
            <MuslimNameDetectionWrapper />
            <FirstTimeUploadModal
              open={showFirstUploadModal}
              onClose={handleCloseFirstUpload}
              onUpload={handleUploadFromModal}
            />
          </div>
        </AnalyticsWrapper>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
