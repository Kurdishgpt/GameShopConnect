import { Home, ShoppingBag, Users, Video } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Shopping", url: "/shopping", icon: ShoppingBag },
  { title: "Find Player", url: "/find-player", icon: Users },
  { title: "Stories", url: "/stories", icon: Video },
];

const roleConfig = {
  owner: { label: "Owner", color: "bg-chart-5 text-white" },
  admin: { label: "Admin", color: "bg-chart-1 text-white" },
  media: { label: "Media", color: "bg-chart-2 text-white" },
  developer: { label: "Developer", color: "bg-chart-3 text-white" },
  player: { label: "Player", color: "bg-chart-4 text-white" },
};

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const getRoleBadge = () => {
    if (!user?.role) return null;
    const config = roleConfig[user.role];
    return (
      <Badge className={`${config.color} text-xs`} data-testid={`badge-role-${user.role}`}>
        {config.label}
      </Badge>
    );
  };

  const getUserInitials = () => {
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12" data-testid="avatar-user">
            <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" data-testid="text-username">
              {user?.username || user?.firstName || "Player"}
            </p>
            {getRoleBadge()}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} data-testid={`link-${item.title.toLowerCase().replace(" ", "-")}`}>
                      <Link href={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
