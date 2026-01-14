import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Services from "./pages/Services";
import ProviderProfile from "./pages/ProviderProfile";
import ProviderDashboard from "./pages/ProviderDashboard";
import LogoSelection from "./pages/LogoSelection";
import Auth from "./pages/Auth";
import Booking from "./pages/Booking";
import CreateListing from "./pages/CreateListing";
import CustomerDashboard from "./pages/CustomerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/provider/:id" element={<ProviderProfile />} />
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
            <Route path="/logo-selection" element={<LogoSelection />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/booking/:listingId" element={<Booking />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/dashboard" element={<CustomerDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
