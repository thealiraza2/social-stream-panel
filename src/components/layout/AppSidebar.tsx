import {
  LayoutDashboard, ShoppingCart, ClipboardList, Wallet, Server, MessageSquare, Layers,
  Users, CreditCard, BarChart3, FolderOpen, FileText, Shield, Globe, Newspaper, PackagePlus,
  BookOpen, UserPlus, Activity, Ban, Link2, Mail, PenTool, Tags, UserCheck,
  Monitor, Settings, Plug, Package, Languages, HelpCircle, AlertTriangle, Gift,
  ChevronDown, Repeat, XCircle,
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

const userItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "New Order", url: "/new-order", icon: ShoppingCart },
  { title: "Bulk Order", url: "/bulk-order", icon: Layers },
  { title: "Order Logs", url: "/orders", icon: ClipboardList },
  { title: "Add Funds", url: "/add-funds", icon: Wallet },
  { title: "Services", url: "/services", icon: Server },
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
  const { profile } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const isAdmin = profile?.role === "admin";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-purple text-white text-sm font-bold">S</div>
            <span className="text-lg font-bold text-gradient">SMM Panel</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-purple text-white text-sm font-bold">S</div>
          </div>
        )}
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <ScrollArea className="flex-1">
          {isAdmin ? (
            adminGroups.map((group) => (
              <Collapsible key={group.label} defaultOpen className="group/collapsible">
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/30 rounded-md transition-colors">
                      {group.label}
                      <ChevronDown className="ml-auto h-3.5 w-3.5 transition-transform group-data-[state=closed]/collapsible:rotate-[-90deg]" />
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
                                className="hover:bg-sidebar-accent/50"
                                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              >
                                <item.icon className="mr-2 h-4 w-4" />
                                {!collapsed && <span>{item.title}</span>}
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
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {userItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/dashboard"}
                          className="hover:bg-sidebar-accent/50"
                          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
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
          <div className="rounded-lg bg-sidebar-accent/50 p-3 text-xs text-muted-foreground text-center">
            {isAdmin ? "Admin Panel" : `Balance: Rs.${profile?.balance?.toFixed(2) ?? "0.00"}`}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
