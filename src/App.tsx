import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

import UserDashboard from "./pages/user/Dashboard";
import NewOrder from "./pages/user/NewOrder";
import OrderLogs from "./pages/user/OrderLogs";
import AddFunds from "./pages/user/AddFunds";
import Services from "./pages/user/Services";
import Tickets from "./pages/user/Tickets";
import Profile from "./pages/user/Profile";

import AdminDashboard from "./pages/admin/Dashboard";
import ServiceManagement from "./pages/admin/ServiceManagement";
import UserManagement from "./pages/admin/UserManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import PaymentManagement from "./pages/admin/PaymentManagement";
import TicketManagement from "./pages/admin/TicketManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* User Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><AppLayout><UserDashboard /></AppLayout></ProtectedRoute>} />
              <Route path="/new-order" element={<ProtectedRoute><AppLayout><NewOrder /></AppLayout></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><AppLayout><OrderLogs /></AppLayout></ProtectedRoute>} />
              <Route path="/add-funds" element={<ProtectedRoute><AppLayout><AddFunds /></AppLayout></ProtectedRoute>} />
              <Route path="/services" element={<ProtectedRoute><AppLayout><Services /></AppLayout></ProtectedRoute>} />
              <Route path="/tickets" element={<ProtectedRoute><AppLayout><Tickets /></AppLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute><AdminRoute><AppLayout><AdminDashboard /></AppLayout></AdminRoute></ProtectedRoute>} />
              <Route path="/admin/services" element={<ProtectedRoute><AdminRoute><AppLayout><ServiceManagement /></AppLayout></AdminRoute></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><AppLayout><UserManagement /></AppLayout></AdminRoute></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute><AdminRoute><AppLayout><OrderManagement /></AppLayout></AdminRoute></ProtectedRoute>} />
              <Route path="/admin/payments" element={<ProtectedRoute><AdminRoute><AppLayout><PaymentManagement /></AppLayout></AdminRoute></ProtectedRoute>} />
              <Route path="/admin/tickets" element={<ProtectedRoute><AdminRoute><AppLayout><TicketManagement /></AppLayout></AdminRoute></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
