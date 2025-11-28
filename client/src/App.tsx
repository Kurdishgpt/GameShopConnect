import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";

import Landing from "@/pages/landing";
import Home from "@/pages/home";
import ProfileSetup from "@/pages/profile-setup";
import Shopping from "@/pages/shopping";
import FindPlayer from "@/pages/find-player";
import Stories from "@/pages/stories";
import Messages from "@/pages/messages";
import ManagePlayers from "@/pages/manage-players";
import SellItems from "@/pages/sell-items";
import Seller from "@/pages/seller";
import Notifications from "@/pages/notifications";
import Feedback from "@/pages/feedback";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-white dark:bg-background">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <HeaderWithNotifications />
          <main className="flex-1 overflow-auto bg-white dark:bg-background">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/profile-setup" component={ProfileSetup} />
              <Route path="/shopping" component={Shopping} />
              <Route path="/find-player" component={FindPlayer} />
              <Route path="/stories" component={Stories} />
              <Route path="/messages" component={Messages} />
              <Route path="/manage-players" component={ManagePlayers} />
              <Route path="/sell-items" component={SellItems} />
              <Route path="/seller" component={Seller} />
              <Route path="/notifications" component={Notifications} />
              <Route path="/feedback" component={Feedback} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function HeaderWithNotifications() {
  const [, navigate] = useLocation();
  const { data: notificationsData } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
  });
  const notifications = notificationsData || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/notifications")}
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              data-testid="badge-unread-count"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/api/logout'}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
