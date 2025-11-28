import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, ShoppingBag, Video, Gamepad2, Sparkles, ArrowRight, Zap, Trophy, Radio } from "lucide-react";
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
      <div className="min-h-screen p-6 space-y-8 bg-gradient-to-b from-background via-background to-muted/20">
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="mb-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/40 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Welcome to Gaming Hub</span>
          </div>

          <div className="space-y-6">
            <h1 
              className="font-heading font-bold text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent animate-pulse leading-tight" 
              data-testid="heading-home"
            >
              Level Up Your Gaming
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Connect with pro gamers, find your perfect squad, shop the latest gear, share epic moments, and dominate the competition
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Link href="/find-player">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all" data-testid="button-find-players">
                <Users className="h-5 w-5" />
                Find Players
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/shopping">
              <Button size="lg" variant="outline" className="gap-2 hover:shadow-lg transition-all" data-testid="button-shop">
                <ShoppingBag className="h-5 w-5" />
                Shop Gear
              </Button>
            </Link>
            <Link href="/stories">
              <Button size="lg" variant="outline" className="gap-2 hover:shadow-lg transition-all" data-testid="button-stories">
                <Video className="h-5 w-5" />
                Watch Stories
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Setup Alert */}
        {needsProfile && (
          <div className="mb-16 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 border border-primary/50 rounded-2xl p-8 md:p-10 backdrop-blur-sm shadow-2xl shadow-primary/20">
            <div className="flex items-start gap-6">
              <div className="rounded-xl bg-gradient-to-br from-primary/40 to-accent/40 p-4 flex-shrink-0 shadow-lg">
                <Gamepad2 className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold mb-3">Complete Your Gaming Profile</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  Unlock all features by setting up your gaming profile. Start finding teammates, earning badges, and joining an epic community.
                </p>
                <Link href="/profile-setup">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent">
                    Setup Profile Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Feature Cards - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Players Card */}
          <Link href="/find-player">
            <Card className="hover-elevate h-full cursor-pointer group relative overflow-hidden bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-blue-500/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <CardContent className="p-7 relative h-full flex flex-col">
                <div className="rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-500/10 p-4 w-fit mb-5 shadow-lg">
                  <Users className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">Find Players</h3>
                <p className="text-sm text-muted-foreground mb-8 flex-1 leading-relaxed">
                  Discover epic gamers on your favorite platforms and build your ultimate squad
                </p>
                <Button variant="outline" className="w-full gap-2 group">
                  Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Shopping Card */}
          <Link href="/shopping">
            <Card className="hover-elevate h-full cursor-pointer group relative overflow-hidden bg-gradient-to-br from-purple-500/15 to-purple-500/5 border-purple-500/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <CardContent className="p-7 relative h-full flex flex-col">
                <div className="rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-500/10 p-4 w-fit mb-5 shadow-lg">
                  <ShoppingBag className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-400 transition-colors">Gaming Shop</h3>
                <p className="text-sm text-muted-foreground mb-8 flex-1 leading-relaxed">
                  Get the hottest gaming gear, controllers, headsets, and pro accessories
                </p>
                <Button variant="outline" className="w-full gap-2 group">
                  Browse <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Story Games Card */}
          <Link href="/stories">
            <Card className="hover-elevate h-full cursor-pointer group relative overflow-hidden bg-gradient-to-br from-pink-500/15 to-pink-500/5 border-pink-500/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <CardContent className="p-7 relative h-full flex flex-col">
                <div className="rounded-xl bg-gradient-to-br from-pink-500/30 to-pink-500/10 p-4 w-fit mb-5 shadow-lg">
                  <Video className="h-7 w-7 text-pink-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-pink-400 transition-colors">Story Games</h3>
                <p className="text-sm text-muted-foreground mb-8 flex-1 leading-relaxed">
                  Watch epic highlights, showcase your wins, and celebrate gaming moments
                </p>
                <Button variant="outline" className="w-full gap-2 group">
                  Watch <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Messages Card */}
          <Link href="/messages">
            <Card className="hover-elevate h-full cursor-pointer group relative overflow-hidden bg-gradient-to-br from-green-500/15 to-green-500/5 border-green-500/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <CardContent className="p-7 relative h-full flex flex-col">
                <div className="rounded-xl bg-gradient-to-br from-green-500/30 to-green-500/10 p-4 w-fit mb-5 shadow-lg">
                  <MessageSquare className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-green-400 transition-colors">Messages</h3>
                <p className="text-sm text-muted-foreground mb-8 flex-1 leading-relaxed">
                  Real-time chat with teammates and coordinate your gaming sessions
                </p>
                <Button variant="outline" className="w-full gap-2 group">
                  Chat <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Grid - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 md:p-10 border border-primary/40 text-center shadow-xl hover:shadow-2xl transition-all hover-elevate backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 mb-4 shadow-lg">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">Connect</div>
            <p className="text-muted-foreground text-lg">Find and join gaming squads</p>
          </div>
          <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl p-8 md:p-10 border border-accent/40 text-center shadow-xl hover:shadow-2xl transition-all hover-elevate backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-accent/30 to-primary/30 mb-4 shadow-lg">
              <Zap className="h-8 w-8 text-accent" />
            </div>
            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">Play</div>
            <p className="text-muted-foreground text-lg">Team up and dominate together</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-8 md:p-10 border border-pink-500/40 text-center shadow-xl hover:shadow-2xl transition-all hover-elevate backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 mb-4 shadow-lg">
              <Trophy className="h-8 w-8 text-pink-400" />
            </div>
            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">Share</div>
            <p className="text-muted-foreground text-lg">Celebrate your victories</p>
          </div>
        </div>

        {/* Features Section - Enhanced */}
        <div className="bg-gradient-to-br from-card/50 via-card/30 to-muted/20 rounded-3xl border border-primary/20 p-8 md:p-16 backdrop-blur-sm shadow-2xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Why You'll Love Gaming Hub</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Experience the ultimate gaming social platform designed for gamers, by gamers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all hover-elevate">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-500/10 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all">
                <Gamepad2 className="h-7 w-7 text-blue-400" />
              </div>
              <h4 className="font-bold text-lg mb-3 text-foreground">Multi-Platform Support</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Play on PlayStation, Xbox, PC, Switch, or Mobile. We support all your favorite gaming platforms.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all hover-elevate">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-500/10 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all">
                <ShoppingBag className="h-7 w-7 text-purple-400" />
              </div>
              <h4 className="font-bold text-lg mb-3 text-foreground">Gaming Gear Shop</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Explore top gaming equipment from trusted sellers with multi-currency support.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20 hover:border-pink-500/40 transition-all hover-elevate">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/30 to-pink-500/10 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all">
                <Video className="h-7 w-7 text-pink-400" />
              </div>
              <h4 className="font-bold text-lg mb-3 text-foreground">Epic Story Games</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload and share your gaming highlights with the community in stunning quality.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all hover-elevate">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/30 to-green-500/10 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all">
                <MessageSquare className="h-7 w-7 text-green-400" />
              </div>
              <h4 className="font-bold text-lg mb-3 text-foreground">Live Team Chat</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Real-time messaging and presence detection to stay connected with your squad.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all hover-elevate">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-500/10 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all">
                <Users className="h-7 w-7 text-cyan-400" />
              </div>
              <h4 className="font-bold text-lg mb-3 text-foreground">Smart Matching</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get matched with teammates based on platform, skill, and gaming preferences.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-all hover-elevate">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-500/10 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all">
                <Radio className="h-7 w-7 text-amber-400" />
              </div>
              <h4 className="font-bold text-lg mb-3 text-foreground">Community Driven</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Join a vibrant global community of passionate gamers united by their love for gaming.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
