import {
  LayoutDashboard, ShoppingCart, ClipboardList, Wallet, Server, MessageSquare, Layers,
  Users, CreditCard, BarChart3, FolderOpen, FileText, Shield, Globe, Newspaper, PackagePlus, Smartphone,
  BookOpen, UserPlus, Activity, Ban, Link2, Mail, PenTool, Tags, UserCheck,
  Monitor, Settings, Plug, Package, Languages, HelpCircle, AlertTriangle, Gift,
  ChevronDown, Repeat, XCircle, Megaphone, Star, Image,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const userItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "New Order", url: "/new-order", icon: ShoppingCart },
  { title: "Bulk Order", url: "/bulk-order", icon: Layers },
  { title: "Order Logs", url: "/orders", icon: ClipboardList },
  { title: "Add Funds", url: "/add-funds", icon: Wallet },
  { title: "Services", url: "/services", icon: Server },
  { title: "Referral Program", url: "/influencer", icon: Star },
  { title: "Support", url: "/tickets", icon: MessageSquare },
];

const adminGroups = [
  {
    label: "Analytics",
    items: [{ title: "Dashboard", url: "/admin", icon: BarChart3 }],
  },
  {
    label: "Orders",
    items: [
      { title: "All Orders", url: "/admin/orders", icon: ClipboardList },
      { title: "Drip-feed", url: "/admin/drip-feed", icon: Repeat },
      { title: "Subscriptions", url: "/admin/subscriptions", icon: UserCheck },
      { title: "Cancelled", url: "/admin/cancelled", icon: XCircle },
    ],
  },
  {
    label: "Services",
    items: [
      { title: "Services", url: "/admin/services", icon: Server },
      { title: "Categories", url: "/admin/categories", icon: FolderOpen },
      { title: "Import Services", url: "/admin/import-services", icon: PackagePlus },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Transactions", url: "/admin/transactions", icon: FileText },
      { title: "Payments", url: "/admin/payments", icon: CreditCard },
      { title: "Payment Methods", url: "/admin/payment-methods", icon: Smartphone },
      { title: "Payment Bonuses", url: "/admin/payment-bonuses", icon: Gift },
    ],
  },
  {
    label: "Users",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Subscribers", url: "/admin/subscribers", icon: UserPlus },
      { title: "User Activity", url: "/admin/user-activity", icon: Activity },
    ],
  },
  {
    label: "Support",
    items: [{ title: "Tickets", url: "/admin/tickets", icon: MessageSquare }],
  },
  {
    label: "Security",
    items: [
      { title: "Blacklist IP", url: "/admin/blacklist-ip", icon: Shield },
      { title: "Blacklist Link", url: "/admin/blacklist-link", icon: Ban },
      { title: "Blacklist Email", url: "/admin/blacklist-email", icon: Mail },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Blog Categories", url: "/admin/blog-categories", icon: Tags },
      { title: "Blog Posts", url: "/admin/blog-posts", icon: PenTool },
      { title: "News", url: "/admin/news", icon: Newspaper },
      { title: "FAQs", url: "/admin/faqs", icon: HelpCircle },
    ],
  },
  {
    label: "Staff",
    items: [
      { title: "Staff Members", url: "/admin/staff", icon: UserCheck },
      { title: "Staff Activity", url: "/admin/staff-activity", icon: Activity },
      { title: "Child Panels", url: "/admin/child-panels", icon: Monitor },
    ],
  },
  {
    label: "Affiliates",
    items: [
      { title: "Influencers", url: "/admin/influencers", icon: Megaphone },
      { title: "Marketing Assets", url: "/admin/marketing-assets", icon: Image },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", url: "/admin/settings", icon: Settings },
      { title: "Providers", url: "/admin/providers", icon: Plug },
      { title: "Modules", url: "/admin/modules", icon: Package },
      { title: "Languages", url: "/admin/languages", icon: Languages },
      { title: "System Logs", url: "/admin/logs", icon: AlertTriangle },
    ],
  },
];

export function AppSidebar() {
  const { profile, user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const isAdmin = profile?.role === "admin";

  const [openTicketCount, setOpenTicketCount] = useState(0);

  // Listen to tickets in real-time (case-insensitive status handling)
  useEffect(() => {
    if (!user) {
      setOpenTicketCount(0);
      return;
    }

    const q = isAdmin
      ? query(collection(db, "tickets"))
      : query(collection(db, "tickets"), where("userId", "==", user.uid));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const count = snap.docs.filter((d) => {
          const status = String(d.data()?.status ?? "").toLowerCase();
          return isAdmin ? status === "open" : status === "answered";
        }).length;
        setOpenTicketCount(count);
      },
      () => setOpenTicketCount(0)
    );

    return unsub;
  }, [user, isAdmin]);

  const getTicketBadge = (url: string) => {
    const isTicketLink = url === "/tickets" || url === "/admin/tickets";
    if (!isTicketLink || openTicketCount === 0) return null;
    return (
      <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] flex items-center justify-center text-[10px] px-1.5">
        {openTicketCount}
      </Badge>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-purple text-primary-foreground text-sm font-bold shadow-md">B</div>
            <span className="text-lg font-bold font-display text-gradient tracking-tight">BudgetSMM</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-purple text-primary-foreground text-sm font-bold shadow-md">S</div>
          </div>
        )}
      </SidebarHeader>
      <Separator className="opacity-50" />
      <SidebarContent>
        <ScrollArea className="flex-1">
          {isAdmin ? (
            adminGroups.map((group) => (
              <Collapsible key={group.label} defaultOpen className="group/collapsible">
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/40 rounded-lg transition-colors text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70 px-3 py-1.5">
                      {group.label}
                      <ChevronDown className="ml-auto h-3.5 w-3.5 transition-transform duration-200 group-data-[state=closed]/collapsible:rotate-[-90deg]" />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {group.items.map((item) => (
                          <SidebarMenuItem key={item.url}>
                            <SidebarMenuButton asChild>
                              <NavLink
                                to={item.url}
                                end={item.url === "/admin"}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-150"
                                activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold shadow-sm"
                              >
                                <item.icon className="h-[18px] w-[18px] shrink-0" />
                                {!collapsed && <span>{item.title}</span>}
                                {getTicketBadge(item.url)}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            ))
          ) : (
            <SidebarGroup className="px-2 pt-3">
              <SidebarGroupLabel className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70 px-3 mb-1">Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0.5">
                  {userItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/dashboard"}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-150"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold shadow-sm"
                        >
                          <item.icon className="h-[18px] w-[18px] shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                          {getTicketBadge(item.url)}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-xl bg-sidebar-accent/60 border border-sidebar-border p-3.5 text-xs text-muted-foreground text-center font-medium">
            {isAdmin ? "Admin Panel" : `Balance: Rs.${profile?.balance?.toFixed(2) ?? "0.00"}`}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
