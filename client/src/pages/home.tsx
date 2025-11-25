import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, ShoppingBag, Video, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const needsProfile = !user?.username || !user?.selectedPlatform || !user?.age;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="font-heading font-bold text-4xl md:text-5xl" data-testid="heading-home">
          Welcome back, {user?.username || user?.firstName || "Player"}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Ready to connect with gamers and start playing?
        </p>
      </div>

      {/* Profile Setup Prompt */}
      {needsProfile && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Complete Your Profile</CardTitle>
            <CardDescription>
              Set up your gaming profile to start finding players and joining games
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile-setup">
              <Button variant="default" data-testid="button-setup-profile">
                Setup Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Find Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              Discover gamers on your platform
            </p>
            <Link href="/find-player">
              <Button variant="outline" size="sm" className="mt-4 w-full" data-testid="button-find-players">
                Browse Players
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shopping</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">New Items</div>
            <p className="text-xs text-muted-foreground mt-1">
              Check out gaming gear
            </p>
            <Link href="/shopping">
              <Button variant="outline" size="sm" className="mt-4 w-full" data-testid="button-shop">
                Browse Shop
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Stories</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">Trending</div>
            <p className="text-xs text-muted-foreground mt-1">
              Watch epic gaming moments
            </p>
            <Link href="/stories">
              <Button variant="outline" size="sm" className="mt-4 w-full" data-testid="button-stories">
                View Stories
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">Connect</div>
            <p className="text-xs text-muted-foreground mt-1">
              Chat with other gamers
            </p>
            <Link href="/messages">
              <Button variant="outline" size="sm" className="mt-4 w-full" data-testid="button-messages">
                View Messages
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Getting Started
          </CardTitle>
          <CardDescription>
            Here's what you can do on GameHub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-chart-1 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold">Find Your Squad</h4>
                <p className="text-sm text-muted-foreground">
                  Browse players by platform, age, and name to find the perfect teammates
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <ShoppingBag className="h-5 w-5 text-chart-3 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold">Shop Gaming Gear</h4>
                <p className="text-sm text-muted-foreground">
                  Request the latest gaming equipment and accessories
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Video className="h-5 w-5 text-chart-2 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold">Share Your Stories</h4>
                <p className="text-sm text-muted-foreground">
                  Post video highlights and epic gaming moments with the community
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
