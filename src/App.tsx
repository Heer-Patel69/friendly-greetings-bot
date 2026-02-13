import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Customers from "./pages/Customers";
import Purchase from "./pages/Purchase";
import Expenses from "./pages/Expenses";
import OnlineStore from "./pages/OnlineStore";
import SettingsPage from "./pages/Settings";
import More from "./pages/More";
import NotFound from "./pages/NotFound";
import Stores from "./pages/Stores";
import JobCards from "./pages/JobCards";
import PublicStore from "./pages/PublicStore";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Automations from "./pages/Automations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Marketing website — standalone */}
            <Route path="/" element={<Index />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/store/:slug" element={<PublicStore />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            {/* Business app — with sidebar/bottom nav */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/purchase" element={<Purchase />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/online-store" element={<OnlineStore />} />
              <Route path="/job-cards" element={<JobCards />} />
              <Route path="/automations" element={<Automations />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/more" element={<More />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
