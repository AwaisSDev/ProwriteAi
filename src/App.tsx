import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ConfirmEmail from "./pages/ConfirmEmail";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<Index />} />

            {/* Login / Signup */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />

            {/* Figma-Style Onboarding Flow */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Main App Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;