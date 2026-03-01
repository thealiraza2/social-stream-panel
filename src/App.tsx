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
import CategoryManagement from "./pages/admin/CategoryManagement";
import UserManagement from "./pages/admin/UserManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import PaymentManagement from "./pages/admin/PaymentManagement";
import TicketManagement from "./pages/admin/TicketManagement";
import TransactionLogs from "./pages/admin/TransactionLogs";
import DripFeed from "./pages/admin/DripFeed";
import Subscriptions from "./pages/admin/Subscriptions";
import CancelledOrders from "./pages/admin/CancelledOrders";
import BlacklistIP from "./pages/admin/BlacklistIP";
import BlacklistLink from "./pages/admin/BlacklistLink";
import BlacklistEmail from "./pages/admin/BlacklistEmail";
import BlogCategories from "./pages/admin/BlogCategories";
import BlogPosts from "./pages/admin/BlogPosts";
import Subscribers from "./pages/admin/Subscribers";
import UserActivity from "./pages/admin/UserActivity";
import StaffManagement from "./pages/admin/StaffManagement";
import StaffActivity from "./pages/admin/StaffActivity";
import ChildPanels from "./pages/admin/ChildPanels";
import Settings from "./pages/admin/Settings";
import Providers from "./pages/admin/Providers";
import ImportServices from "./pages/admin/ImportServices";
import Modules from "./pages/admin/Modules";
import News from "./pages/admin/News";
import LanguagesPage from "./pages/admin/Languages";
import FAQs from "./pages/admin/FAQs";
import SystemLogs from "./pages/admin/SystemLogs";
import PaymentBonuses from "./pages/admin/PaymentBonuses";

const queryClient = new QueryClient();

const AdminPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute><AdminRoute><AppLayout>{children}</AppLayout></AdminRoute></ProtectedRoute>
);

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
              <Route path="/admin" element={<AdminPage><AdminDashboard /></AdminPage>} />
              <Route path="/admin/orders" element={<AdminPage><OrderManagement /></AdminPage>} />
              <Route path="/admin/drip-feed" element={<AdminPage><DripFeed /></AdminPage>} />
              <Route path="/admin/subscriptions" element={<AdminPage><Subscriptions /></AdminPage>} />
              <Route path="/admin/cancelled" element={<AdminPage><CancelledOrders /></AdminPage>} />
              <Route path="/admin/services" element={<AdminPage><ServiceManagement /></AdminPage>} />
              <Route path="/admin/categories" element={<AdminPage><CategoryManagement /></AdminPage>} />
              <Route path="/admin/transactions" element={<AdminPage><TransactionLogs /></AdminPage>} />
              <Route path="/admin/payments" element={<AdminPage><PaymentManagement /></AdminPage>} />
              <Route path="/admin/payment-bonuses" element={<AdminPage><PaymentBonuses /></AdminPage>} />
              <Route path="/admin/users" element={<AdminPage><UserManagement /></AdminPage>} />
              <Route path="/admin/subscribers" element={<AdminPage><Subscribers /></AdminPage>} />
              <Route path="/admin/user-activity" element={<AdminPage><UserActivity /></AdminPage>} />
              <Route path="/admin/tickets" element={<AdminPage><TicketManagement /></AdminPage>} />
              <Route path="/admin/blacklist-ip" element={<AdminPage><BlacklistIP /></AdminPage>} />
              <Route path="/admin/blacklist-link" element={<AdminPage><BlacklistLink /></AdminPage>} />
              <Route path="/admin/blacklist-email" element={<AdminPage><BlacklistEmail /></AdminPage>} />
              <Route path="/admin/blog-categories" element={<AdminPage><BlogCategories /></AdminPage>} />
              <Route path="/admin/blog-posts" element={<AdminPage><BlogPosts /></AdminPage>} />
              <Route path="/admin/news" element={<AdminPage><News /></AdminPage>} />
              <Route path="/admin/faqs" element={<AdminPage><FAQs /></AdminPage>} />
              <Route path="/admin/staff" element={<AdminPage><StaffManagement /></AdminPage>} />
              <Route path="/admin/staff-activity" element={<AdminPage><StaffActivity /></AdminPage>} />
              <Route path="/admin/child-panels" element={<AdminPage><ChildPanels /></AdminPage>} />
              <Route path="/admin/settings" element={<AdminPage><Settings /></AdminPage>} />
              <Route path="/admin/providers" element={<AdminPage><Providers /></AdminPage>} />
              <Route path="/admin/import-services" element={<AdminPage><ImportServices /></AdminPage>} />
              <Route path="/admin/modules" element={<AdminPage><Modules /></AdminPage>} />
              <Route path="/admin/languages" element={<AdminPage><LanguagesPage /></AdminPage>} />
              <Route path="/admin/logs" element={<AdminPage><SystemLogs /></AdminPage>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
