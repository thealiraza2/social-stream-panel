import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageLoader } from "@/components/PageLoader";

// Critical path — loaded eagerly
import Index from "./pages/Index";

// Auth pages — lazy loaded
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Banned = lazy(() => import("./pages/Banned"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ReferralRedirect = lazy(() => import("./pages/ReferralRedirect"));
const AccountDeleted = lazy(() => import("./pages/AccountDeleted"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Pricing = lazy(() => import("./pages/Pricing"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const NotFound = lazy(() => import("./pages/NotFound"));

// User pages — lazy loaded
const UserDashboard = lazy(() => import("./pages/user/Dashboard"));
const NewOrder = lazy(() => import("./pages/user/NewOrder"));
const BulkOrder = lazy(() => import("./pages/user/BulkOrder"));
const OrderLogs = lazy(() => import("./pages/user/OrderLogs"));
const AddFunds = lazy(() => import("./pages/user/AddFunds"));
const Services = lazy(() => import("./pages/user/Services"));
const Tickets = lazy(() => import("./pages/user/Tickets"));
const Profile = lazy(() => import("./pages/user/Profile"));
const Influencer = lazy(() => import("./pages/user/Influencer"));
const InfluencerAssets = lazy(() => import("./pages/user/InfluencerAssets"));
const InfluencerPayouts = lazy(() => import("./pages/user/InfluencerPayouts"));

// Admin pages — lazy loaded
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const ServiceManagement = lazy(() => import("./pages/admin/ServiceManagement"));
const CategoryManagement = lazy(() => import("./pages/admin/CategoryManagement"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const OrderManagement = lazy(() => import("./pages/admin/OrderManagement"));
const PaymentManagement = lazy(() => import("./pages/admin/PaymentManagement"));
const TicketManagement = lazy(() => import("./pages/admin/TicketManagement"));
const TransactionLogs = lazy(() => import("./pages/admin/TransactionLogs"));
const DripFeed = lazy(() => import("./pages/admin/DripFeed"));
const Subscriptions = lazy(() => import("./pages/admin/Subscriptions"));
const CancelledOrders = lazy(() => import("./pages/admin/CancelledOrders"));
const BlacklistIP = lazy(() => import("./pages/admin/BlacklistIP"));
const BlacklistLink = lazy(() => import("./pages/admin/BlacklistLink"));
const BlacklistEmail = lazy(() => import("./pages/admin/BlacklistEmail"));
const BlogCategories = lazy(() => import("./pages/admin/BlogCategories"));
const BlogPosts = lazy(() => import("./pages/admin/BlogPosts"));
const Subscribers = lazy(() => import("./pages/admin/Subscribers"));
const UserActivity = lazy(() => import("./pages/admin/UserActivity"));
const StaffManagement = lazy(() => import("./pages/admin/StaffManagement"));
const StaffActivity = lazy(() => import("./pages/admin/StaffActivity"));
const ChildPanels = lazy(() => import("./pages/admin/ChildPanels"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Providers = lazy(() => import("./pages/admin/Providers"));
const ImportServices = lazy(() => import("./pages/admin/ImportServices"));
const Modules = lazy(() => import("./pages/admin/Modules"));
const News = lazy(() => import("./pages/admin/News"));
const LanguagesPage = lazy(() => import("./pages/admin/Languages"));
const FAQs = lazy(() => import("./pages/admin/FAQs"));
const SystemLogs = lazy(() => import("./pages/admin/SystemLogs"));
const PaymentBonuses = lazy(() => import("./pages/admin/PaymentBonuses"));
const PaymentMethodsAdmin = lazy(() => import("./pages/admin/PaymentMethods"));
const InfluencerManagement = lazy(() => import("./pages/admin/InfluencerManagement"));
const MarketingAssetsAdmin = lazy(() => import("./pages/admin/MarketingAssets"));

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
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/banned" element={<Banned />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/ref/:slug" element={<ReferralRedirect />} />
                <Route path="/account-deleted" element={<AccountDeleted />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/refund" element={<RefundPolicy />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/api-docs" element={<ApiDocs />} />

                {/* User Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><AppLayout><UserDashboard /></AppLayout></ProtectedRoute>} />
                <Route path="/new-order" element={<ProtectedRoute><AppLayout><NewOrder /></AppLayout></ProtectedRoute>} />
                <Route path="/bulk-order" element={<ProtectedRoute><AppLayout><BulkOrder /></AppLayout></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><AppLayout><OrderLogs /></AppLayout></ProtectedRoute>} />
                <Route path="/add-funds" element={<ProtectedRoute><AppLayout><AddFunds /></AppLayout></ProtectedRoute>} />
                <Route path="/services" element={<ProtectedRoute><AppLayout><Services /></AppLayout></ProtectedRoute>} />
                <Route path="/tickets" element={<ProtectedRoute><AppLayout><Tickets /></AppLayout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
                <Route path="/influencer" element={<ProtectedRoute><AppLayout><Influencer /></AppLayout></ProtectedRoute>} />
                <Route path="/influencer/assets" element={<ProtectedRoute><AppLayout><InfluencerAssets /></AppLayout></ProtectedRoute>} />
                <Route path="/influencer/payouts" element={<ProtectedRoute><AppLayout><InfluencerPayouts /></AppLayout></ProtectedRoute>} />

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
                <Route path="/admin/payment-methods" element={<AdminPage><PaymentMethodsAdmin /></AdminPage>} />
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
                <Route path="/admin/influencers" element={<AdminPage><InfluencerManagement /></AdminPage>} />
                <Route path="/admin/marketing-assets" element={<AdminPage><MarketingAssetsAdmin /></AdminPage>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
