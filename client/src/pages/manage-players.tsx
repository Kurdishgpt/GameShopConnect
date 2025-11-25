import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Camera, Code, Gamepad2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roleConfig = {
  owner: { label: "Owner", color: "bg-chart-5 text-white", icon: Crown },
  admin: { label: "Admin", color: "bg-chart-1 text-white", icon: Shield },
  media: { label: "Media", color: "bg-chart-2 text-white", icon: Camera },
  developer: { label: "Developer", color: "bg-chart-3 text-white", icon: Code },
  player: { label: "Player", color: "bg-chart-4 text-white", icon: Gamepad2 },
};

export default function ManagePlayers() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "owner")) {
      toast({
        title: "Access Denied",
        description: "Only owners can manage players",
        variant: "destructive",
      });
      window.location.href = "/";
      return;
    }
  }, [isAuthenticated, isLoading, user?.role, toast]);

  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ["/api/players"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/players");
      return (await response.json()) as any[];
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ targetUserId, role }: { targetUserId: string; role: string }) => {
      const response = await apiRequest("PATCH", "/api/admin/assign-role", { targetUserId, role });
      return (await response.json()) as any;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: `Role updated to ${roleConfig[data.role as keyof typeof roleConfig]?.label}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    },
  });

  if (isLoading || playersLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user?.role !== "owner") {
    return null;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-bold text-4xl" data-testid="heading-manage-players">
            Manage Players
          </h1>
          <p className="text-muted-foreground mt-2">
            Assign and manage player roles in your gaming community
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Community Members</CardTitle>
            <CardDescription>
              View and manage roles for all players in your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {players && players.length > 0 ? (
                players.map((player: any) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                    data-testid={`player-card-${player.id}`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold" data-testid={`player-name-${player.id}`}>
                        {player.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {player.firstName} {player.lastName}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge className={`${roleConfig[player.role as keyof typeof roleConfig]?.color} text-xs`}>
                        {roleConfig[player.role as keyof typeof roleConfig]?.label}
                      </Badge>

                      {player.id !== user?.id && (
                        <Select
                          onValueChange={(newRole) =>
                            assignRoleMutation.mutate({
                              targetUserId: player.id,
                              role: newRole,
                            })
                          }
                          defaultValue={player.role}
                        >
                          <SelectTrigger
                            className="w-40"
                            data-testid={`select-role-${player.id}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="media">Media</SelectItem>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="player">Player</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {player.id === user?.id && (
                        <Badge variant="outline">Your Account</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No players found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
