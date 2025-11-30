import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { User, Crown, Shield, Camera, Code, Gamepad2, Store, Edit2, Check, X } from "lucide-react";
import { useEffect, useState } from "react";

const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().optional(),
  selectedPlatform: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Account() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: user?.bio || "",
      selectedPlatform: user?.selectedPlatform || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || "",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        selectedPlatform: user.selectedPlatform || "",
      });
    }
  }, [user, form]);

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

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

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
      <div className="max-w-5xl mx-auto space-y-8">
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
              <p className="text-muted-foreground">Manage your profile and view available roles</p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </div>
              <Button
                variant={isEditing ? "destructive" : "default"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                data-testid={`button-${isEditing ? "cancel" : "edit"}-profile`}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-2 border-primary/20" data-testid="avatar-user-profile">
                    <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-2">Profile Picture</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.profileImageUrl ? "Your profile picture is set" : "No profile picture set yet"}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  {!isEditing ? (
                    // View Mode
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Username</label>
                        <p className="text-lg font-semibold" data-testid="text-username">
                          {user?.username || "Not set"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-lg font-semibold" data-testid="text-email">
                          {user?.email || "Not set"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">First Name</label>
                        <p className="text-lg font-semibold" data-testid="text-firstname">
                          {user?.firstName || "Not set"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                        <p className="text-lg font-semibold" data-testid="text-lastname">
                          {user?.lastName || "Not set"}
                        </p>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Platform</label>
                        <p className="text-lg font-semibold" data-testid="text-platform">
                          {user?.selectedPlatform || "Not set"}
                        </p>
                      </div>
                      {user?.bio && (
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Bio</label>
                          <p className="text-base" data-testid="text-bio">
                            {user.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Edit Mode
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter username" {...field} data-testid="input-username" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter email" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter first name" {...field} data-testid="input-firstname" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter last name" {...field} data-testid="input-lastname" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="selectedPlatform"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gaming Platform</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., PlayStation, Xbox, PC" {...field} data-testid="input-platform" />
                            </FormControl>
                            <FormDescription>Your favorite gaming platform</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about yourself..."
                                className="resize-none"
                                rows={4}
                                {...field}
                                data-testid="input-bio"
                              />
                            </FormControl>
                            <FormDescription>Maximum 500 characters</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-3 justify-end pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          data-testid="button-cancel-save"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          data-testid="button-save-profile"
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Role</p>
                <Badge className="w-fit text-white" data-testid={`badge-current-role-${user?.role}`}>
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "None"}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Account Status</p>
                <Badge variant="secondary" data-testid="badge-account-status">
                  Active
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Online Status</p>
                <Badge variant={user?.isOnline ? "default" : "secondary"} data-testid="badge-online-status">
                  {user?.isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Member Since</p>
                <p className="font-semibold" data-testid="text-created-date">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => {
              const roleInfo = roleDescriptions[role];
              const isCurrentRole = user?.role === role;

              return (
                <Card
                  key={role}
                  className={`transition-all hover-elevate ${isCurrentRole ? "ring-2 ring-primary" : ""}`}
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
                    <CardTitle className="capitalize mt-2 text-base" data-testid={`title-role-${role}`}>
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
      </div>
    </div>
  );
}
