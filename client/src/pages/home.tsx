import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, ShoppingBag, Video, Gamepad2, Sparkles, ArrowRight } from "lucide-react";
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
      <div className="min-h-screen p-6 space-y-8">
        <Skeleton className="h-20 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const needsProfile = !user?.username || !user?.selectedPlatform || !user?.age;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="mb-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Welcome to Gaming Hub</span>
          </div>

          <div className="space-y-4">
            <h1 
              className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent" 
              data-testid="heading-home"
            >
              Level Up Your Gaming
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect with gamers, find your squad, shop the latest gear, and share your epic moments
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/find-player">
              <Button size="lg" className="gap-2" data-testid="button-find-players">
                <Users className="h-5 w-5" />
                Find Players
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/shopping">
              <Button size="lg" variant="outline" className="gap-2" data-testid="button-shop">
                <ShoppingBag className="h-5 w-5" />
                Shop Now
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Setup Alert */}
        {needsProfile && (
          <div className="mb-12 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-primary/30 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/20 p-3 flex-shrink-0">
                <Gamepad2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold mb-2">Complete Your Gaming Profile</h3>
                <p className="text-muted-foreground mb-4">
                  Set up your profile to start finding teammates, earning badges, and connecting with the community
                </p>
                <Link href="/profile-setup">
                  <Button data-testid="button-setup-profile" className="gap-2">
                    Setup Profile Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Players Card */}
          <Link href="/find-player">
            <Card className="hover-elevate h-full cursor-pointer group relative overflow-hidden bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20">
              <div className="absolute inset-0 bg-gradient-to-br from-chart-1/0 to-chart-1/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative h-full flex flex-col">
                <div className="rounded-lg bg-chart-1/20 p-3 w-fit mb-4">
                  <Users className="h-6 w-6 text-chart-1" />
                </div>
                <h3 className="text-xl font-bold mb-2">Find Players</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">
                  Discover gamers on your favorite platforms and find your perfect squad
                </p>
                <Button variant="outline" className="w-full gap-2 group">
                  Browse <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Shopping Card */}
          <Link href="/shopping">
            <Card className="hover-elevate h-full cursor-pointer group relative overflow-hidden bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
              <div className="absolute inset-0 bg-gradient-to-br from-chart-3/0 to-chart-3/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative h-full flex flex-col">
                <div className="rounded-lg bg-chart-3/20 p-3 w-fit mb-4">
                  <ShoppingBag className="h-6 w-6 text-chart-3" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gaming Shop</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">
                  Browse the latest gaming gear, headsets, controllers, and accessories
                </p>
                <Button variant="outline" className="w-full gap-2 group">
                  Shop <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Stories Card */}
          <Link href="/stories">
            <Card className="hover-elevate h-full cursor-pointer group relative overflow-hidden bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
              <div className="absolute inset-0 bg-gradient-to-br from-chart-2/0 to-chart-2/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative h-full flex flex-col">
                <div className="rounded-lg bg-chart-2/20 p-3 w-fit mb-4">
                  <Video className="h-6 w-6 text-chart-2" />
                </div>
                <h3 className="text-xl font-bold mb-2">Video Stories</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">
                  Watch epic gaming highlights and share your best moments with friends
                </p>
                <Button variant="outline" className="w-full gap-2 group">
                  Watch <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Messages Card */}
          <Link href="/messages">
            <Card className="hover-elevate h-full cursor-pointer group relative overflow-hidden bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
              <div className="absolute inset-0 bg-gradient-to-br from-chart-4/0 to-chart-4/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative h-full flex flex-col">
                <div className="rounded-lg bg-chart-4/20 p-3 w-fit mb-4">
                  <MessageSquare className="h-6 w-6 text-chart-4" />
                </div>
                <h3 className="text-xl font-bold mb-2">Messages</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">
                  Chat with teammates, coordinate games, and stay connected with your squad
                </p>
                <Button variant="outline" className="w-full gap-2 group">
                  Chat <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border border-primary/20 text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">Connect</div>
            <p className="text-muted-foreground">Find and join gaming squads</p>
          </div>
          <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl p-8 border border-accent/20 text-center">
            <div className="text-4xl md:text-5xl font-bold text-accent mb-2">Play</div>
            <p className="text-muted-foreground">Team up and dominate together</p>
          </div>
          <div className="bg-gradient-to-br from-chart-2/10 to-chart-1/10 rounded-2xl p-8 border border-chart-2/20 text-center">
            <div className="text-4xl md:text-5xl font-bold text-chart-2 mb-2">Share</div>
            <p className="text-muted-foreground">Celebrate your victories</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gradient-to-br from-card via-card to-muted/20 rounded-2xl border border-border/50 p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Why You'll Love Gaming Hub</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-bold text-lg">Multi-Platform Support</h4>
              <p className="text-sm text-muted-foreground">
                Connect with players across PlayStation, Xbox, PC, Switch, and Mobile platforms
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-chart-3/20 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-chart-3" />
              </div>
              <h4 className="font-bold text-lg">Gaming Gear Shop</h4>
              <p className="text-sm text-muted-foreground">
                Browse and request the latest gaming equipment and accessories from trusted sellers
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
                <Video className="h-6 w-6 text-chart-2" />
              </div>
              <h4 className="font-bold text-lg">Share Moments</h4>
              <p className="text-sm text-muted-foreground">
                Post highlights, epic wins, and showcase your best gaming moments to the community
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-chart-4/20 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-chart-4" />
              </div>
              <h4 className="font-bold text-lg">Team Communication</h4>
              <p className="text-sm text-muted-foreground">
                Direct messaging and real-time chat to coordinate with your gaming squad
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-bold text-lg">Smart Matching</h4>
              <p className="text-sm text-muted-foreground">
                Find teammates based on platform, skill level, and gaming preferences
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <h4 className="font-bold text-lg">Community Driven</h4>
              <p className="text-sm text-muted-foreground">
                Join a vibrant community of passionate gamers from around the world
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
