import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Crown, Shield, Camera, Code, Gamepad2, Store } from "lucide-react";
import { useEffect } from "react";

export default function Account() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 space-y-8">
        <Skeleton className="h-20 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const roleDescriptions: Record<string, { icon: React.ReactNode; description: string; color: string }> = {
    owner: {
      icon: <Crown className="h-8 w-8" />,
      description: "Platform owner with full administrative access and management capabilities",
      color: "bg-chart-5",
    },
    admin: {
      icon: <Shield className="h-8 w-8" />,
      description: "Administrator with elevated privileges for platform management",
      color: "bg-chart-1",
    },
    media: {
      icon: <Camera className="h-8 w-8" />,
      description: "Media creator authorized to post and manage Story Games with video uploads",
      color: "bg-chart-2",
    },
    developer: {
      icon: <Code className="h-8 w-8" />,
      description: "Developer with access to Data Centre and platform development tools",
      color: "bg-chart-3",
    },
    player: {
      icon: <Gamepad2 className="h-8 w-8" />,
      description: "Standard player role with access to gaming features and marketplace",
      color: "bg-chart-4",
    },
    seller: {
      icon: <Store className="h-8 w-8" />,
      description: "Seller authorized to list and manage items in the marketplace",
      color: "bg-chart-5",
    },
  };

  const roles = Object.keys(roleDescriptions);

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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/20 p-3">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold" data-testid="heading-account">
                My Account
              </h1>
              <p className="text-muted-foreground">View your profile and available roles</p>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your current account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24" data-testid="avatar-user-profile">
                <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="text-lg font-semibold" data-testid="text-username">
                      {user?.username || "Not set"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-lg font-semibold" data-testid="text-email">
                      {user?.email || "Not set"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="text-lg font-semibold" data-testid="text-fullname">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : "Not set"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Current Role</p>
                    <Badge className="w-fit text-white text-sm" data-testid={`badge-current-role-${user?.role}`}>
                      {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "None"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Account Status</p>
                <Badge variant="secondary" data-testid="badge-account-status">
                  Active
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-sm font-semibold" data-testid="text-created-date">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Online Status</p>
                <Badge variant={user?.isOnline ? "default" : "secondary"} data-testid="badge-online-status">
                  {user?.isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Roles */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold" data-testid="heading-available-roles">
              Available Roles
            </h2>
            <p className="text-muted-foreground mt-1">
              Learn about different roles and their capabilities on the platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => {
              const roleInfo = roleDescriptions[role];
              const isCurrentRole = user?.role === role;

              return (
                <Card
                  key={role}
                  className={`transition-all ${isCurrentRole ? "ring-2 ring-primary" : ""}`}
                  data-testid={`card-role-${role}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`rounded-lg ${roleInfo.color} p-3 text-white`}>
                        {roleInfo.icon}
                      </div>
                      {isCurrentRole && (
                        <Badge className="bg-primary text-white" data-testid={`badge-role-active-${role}`}>
                          Current
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="capitalize mt-2" data-testid={`title-role-${role}`}>
                      {role}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground" data-testid={`description-role-${role}`}>
                      {roleInfo.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Role Switcher Info */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Switch Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              To switch to a different role, use the role selector in the sidebar. You can change your role anytime
              using your account password for verification.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
