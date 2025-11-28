import { useState } from "react";
import { Home, ShoppingBag, Users, Video, Crown, Shield, Camera, Code, Gamepad2, MessageSquare, Store } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const menuItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Shopping", url: "/shopping", icon: ShoppingBag },
  { title: "Find Player", url: "/find-player", icon: Users },
  { title: "Story Games", url: "/stories", icon: Video },
  { title: "Feedback", url: "/feedback", icon: MessageSquare },
];

const ownerMenuItems = [
  { title: "Manage Players", url: "/manage-players", icon: Shield },
  { title: "Sell Items", url: "/sell-items", icon: ShoppingBag },
];

const sellerMenuItems = [
  { title: "Seller", url: "/seller", icon: Store },
];

const roleConfig = {
  owner: { label: "Owner", color: "bg-chart-5 text-white", icon: Crown },
  admin: { label: "Admin", color: "bg-chart-1 text-white", icon: Shield },
  media: { label: "Media", color: "bg-chart-2 text-white", icon: Camera },
  developer: { label: "Developer", color: "bg-chart-3 text-white", icon: Code },
  player: { label: "Player", color: "bg-chart-4 text-white", icon: Gamepad2 },
  seller: { label: "Seller", color: "bg-chart-5 text-white", icon: Store },
};

const roles = ["owner", "admin", "media", "developer", "player", "seller"] as const;

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState("");

  const roleUpdateMutation = useMutation({
    mutationFn: async (newRole: string) => {
      const response = await apiRequest("PATCH", "/api/profile/role", { role: newRole, password });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsDialogOpen(false);
      setPassword("");
      setSelectedRole(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
      setPassword("");
    },
  });

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
    setPassword("");
  };

  const handleConfirmRole = () => {
    if (!selectedRole) return;
    roleUpdateMutation.mutate(selectedRole);
  };

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
        {/* Navigation Menu */}
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

              {/* Owner-only menu */}
              {user?.role === "owner" && (
                <>
                  {ownerMenuItems.map((item) => {
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
                </>
              )}

              {/* Seller-only menu */}
              {user?.role === "seller" && (
                <>
                  {sellerMenuItems.map((item) => {
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
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Role Selection */}
        <SidebarGroup>
          <SidebarGroupLabel>Select Role</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => {
                const config = roleConfig[role];
                const RoleIcon = config.icon;
                const isActive = user?.role === role;
                return (
                  <Button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="flex flex-col items-center gap-1 h-auto py-2 px-2"
                    data-testid={`button-role-${role}`}
                  >
                    <RoleIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold">{config.label}</span>
                  </Button>
                );
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Password Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="dialog-role-password">
          <DialogHeader>
            <DialogTitle>Enter Password for Role</DialogTitle>
            <DialogDescription>
              Enter the password to select <span className="font-semibold">{selectedRole && roleConfig[selectedRole as keyof typeof roleConfig]?.label}</span> role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmRole();
              }}
              data-testid="input-role-password"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                data-testid="button-cancel-role"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRole}
                disabled={!password || roleUpdateMutation.isPending}
                data-testid="button-confirm-role"
              >
                {roleUpdateMutation.isPending ? "Updating..." : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
