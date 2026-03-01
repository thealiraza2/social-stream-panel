import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Wallet,
  Server,
  MessageSquare,
  Users,
  Settings,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const userItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "New Order", url: "/new-order", icon: ShoppingCart },
  { title: "Order Logs", url: "/orders", icon: ClipboardList },
  { title: "Add Funds", url: "/add-funds", icon: Wallet },
  { title: "Services", url: "/services", icon: Server },
  { title: "Support", url: "/tickets", icon: MessageSquare },
];

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: BarChart3 },
  { title: "Services", url: "/admin/services", icon: Server },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Orders", url: "/admin/orders", icon: ClipboardList },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Tickets", url: "/admin/tickets", icon: MessageSquare },
];

export function AppSidebar() {
  const { profile } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const isAdmin = profile?.role === "admin";
  const items = isAdmin ? adminItems : userItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-purple text-white text-sm font-bold">
              S
            </div>
            <span className="text-lg font-bold text-gradient">SMM Panel</span>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-purple text-white text-sm font-bold">
              S
            </div>
          </div>
        )}
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isAdmin ? "Admin" : "Menu"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard" || item.url === "/admin"}
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
      </SidebarContent>
      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-lg bg-sidebar-accent/50 p-3 text-xs text-muted-foreground text-center">
            {isAdmin ? "Admin Panel" : `Balance: $${profile?.balance?.toFixed(2) ?? "0.00"}`}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
