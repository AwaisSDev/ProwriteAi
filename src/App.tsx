import { Toaster } from "@/components/ui/toaster"; // Main toaster for notifications
import { Toaster as Sonner } from "@/components/ui/sonner"; // Sonner toaster for alternative notifications
import { TooltipProvider } from "@/components/ui/tooltip"; // Wraps app to provide tooltips
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // React Query setup
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Routing components
import { HelmetProvider } from "react-helmet-async"; // Handles <head> changes
import Index from "./pages/Index"; // Home page component
import NotFound from "./pages/NotFound"; // 404 page component
import Auth from "./pages/Auth"; // Added this
import Dashboard from "./pages/Dashboard"; // Added this

const queryClient = new QueryClient(); // Initialize React Query client

const App = () => (
  <HelmetProvider> {/* Wrap app with HelmetProvider */}
    <QueryClientProvider client={queryClient}> {/* Provide React Query client */}
      <TooltipProvider> {/* Provide tooltips to all children */}
        <Toaster /> {/* Default toaster for notifications */}
        <Sonner /> {/* Sonner toaster alternative */}
        <BrowserRouter> {/* Enable routing */}
          <Routes> {/* Define all routes */}
            <Route path="/" element={<Index />} /> {/* Home page */}
            <Route path="/auth" element={<Auth />} /> {/* Added this */}
            <Route path="/dashboard" element={<Dashboard />} /> {/* Added this */}
            <Route path="*" element={<NotFound />} /> {/* Catch-all 404 */}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App; // Export App component