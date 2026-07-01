import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from "@/context/SettingsContext";
import { ChatProvider } from "@/context/ChatContext";

// Authentication Flow Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyResetOTP from "./pages/auth/VerifyResetOTP";
import { AuthCallback } from "./pages/auth/AuthCallback";

// Standard pages
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Roadmap from "./pages/Roadmap";
import ProjectBuilder from "./pages/ProjectBuilder";
import Planner from "./pages/Planner";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Voice from "./pages/Voice";

// New AI Configuration Pages
import AIConfiguration from "./pages/settings/AIConfiguration";
import AIEngineSettings from "./pages/settings/AIEngineSettings";
import FeatureRouting from "./pages/settings/FeatureRouting";
import ProviderManagement from "./pages/settings/ProviderManagement";

// Profile Page
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  return !token ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SettingsProvider>
        <ChatProvider>
          <BrowserRouter>
            <Routes>
              {/* Public auth routes */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Google OAuth callback */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Dashboard and Core App */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              
              {/* Core Learning Routes */}
              <Route path="/chat/new" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><ProjectBuilder /></ProtectedRoute>} />
              <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
              
              {/* Nested settings routes */}
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/settings/language" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* AI Configuration Section Routes */}
              <Route path="/settings/ai-configuration" element={<ProtectedRoute><AIConfiguration /></ProtectedRoute>} />
              <Route path="/settings/ai-configuration/engine" element={<ProtectedRoute><AIEngineSettings /></ProtectedRoute>} />
              <Route path="/settings/ai-configuration/routing" element={<ProtectedRoute><FeatureRouting /></ProtectedRoute>} />
              <Route path="/settings/ai-configuration/providers" element={<ProtectedRoute><ProviderManagement /></ProtectedRoute>} />

              {/* Profile System Routes */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/:tab" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ChatProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
