import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Send, MessageSquare } from "lucide-react";

export default function FindPlayer() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user: currentUser } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const [searchName, setSearchName] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterAge, setFilterAge] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  const [selectedGame, setSelectedGame] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [messageMode, setMessageMode] = useState<'request' | 'message'>('request');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  const { data: players, isLoading } = useQuery<User[]>({
    queryKey: ["/api/players"],
    enabled: isAuthenticated,
  });

  const playRequestMutation = useMutation({
    mutationFn: async (data: { toUserId: string; game: string; message: string }) => {
      await apiRequest("POST", "/api/play-requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Play request sent successfully!",
      });
      setSelectedPlayer(null);
      setSelectedGame("");
      setRequestMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/play-requests"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message || "Failed to send play request",
        variant: "destructive",
      });
    },
  });


  const filteredPlayers = players?.filter((player) => {
    if (player.id === currentUser?.id) return false;
    
    const matchesName = searchName === "" ||
      player.username?.toLowerCase().includes(searchName.toLowerCase()) ||
      player.firstName?.toLowerCase().includes(searchName.toLowerCase()) ||
      player.lastName?.toLowerCase().includes(searchName.toLowerCase());
    
    const matchesPlatform = filterPlatform === "all" || player.selectedPlatform === filterPlatform;
    
    const matchesAge = filterAge === "" || 
      (player.age && player.age.toString() === filterAge);
    
    return matchesName && matchesPlatform && matchesAge;
  });

  const handleSendRequest = (player: User) => {
    setSelectedPlayer(player);
    setMessageMode('request');
  };

  const handleSendMessage = (player: User) => {
    // Navigate to messages page with the player ID as a query parameter
    navigate(`/messages?userId=${player.id}`);
  };

  const handleSubmitRequest = () => {
    if (selectedPlayer && selectedGame) {
      playRequestMutation.mutate({
        toUserId: selectedPlayer.id,
        game: selectedGame,
        message: requestMessage,
      });
    }
  };


  const getPlayerInitials = (player: User) => {
    if (player.username) {
      return player.username.substring(0, 2).toUpperCase();
    }
    if (player.firstName && player.lastName) {
      return `${player.firstName[0]}${player.lastName[0]}`.toUpperCase();
    }
    return "P";
  };

  const getPlatformLabel = (platform: string | null) => {
    if (!platform) return null;
    const labels: Record<string, string> = {
      playstation: "PlayStation",
      xbox: "Xbox",
      pc: "PC",
      switch: "Switch",
      mobile: "Mobile",
    };
    return labels[platform] || platform;
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-4">
        <h1 className="font-heading font-bold text-4xl md:text-5xl flex items-center gap-3" data-testid="heading-find-player">
          <Users className="h-10 w-10 text-primary" />
          Find Players
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover gamers and find your perfect squad
        </p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-10"
              data-testid="input-search-name"
            />
          </div>
          
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger data-testid="select-filter-platform">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="playstation">PlayStation</SelectItem>
              <SelectItem value="xbox">Xbox</SelectItem>
              <SelectItem value="pc">PC</SelectItem>
              <SelectItem value="switch">Nintendo Switch</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Filter by age..."
            value={filterAge}
            onChange={(e) => setFilterAge(e.target.value)}
            data-testid="input-filter-age"
          />
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers?.map((player) => (
          <Card key={player.id} className="hover-elevate" data-testid={`card-player-${player.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16" data-testid={`avatar-player-${player.id}`}>
                  <AvatarImage src={player.profileImageUrl || undefined} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {getPlayerInitials(player)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl truncate" data-testid={`text-player-name-${player.id}`}>
                    {player.username || `${player.firstName} ${player.lastName}`}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {player.selectedPlatform && (
                      <Badge variant="secondary" className="text-xs" data-testid={`badge-platform-${player.id}`}>
                        {getPlatformLabel(player.selectedPlatform)}
                      </Badge>
                    )}
                    {player.age && (
                      <Badge variant="outline" className="text-xs" data-testid={`badge-age-${player.id}`}>
                        {player.age}y
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            {(player.bio || player.favoriteGames) && (
              <CardContent className="pb-3 space-y-2">
                {player.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{player.bio}</p>
                )}
                {player.favoriteGames && player.favoriteGames.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {player.favoriteGames.slice(0, 3).map((game, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {game}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
            <CardFooter className="gap-2">
              <Button
                className="flex-1"
                onClick={() => handleSendRequest(player)}
                data-testid={`button-send-request-${player.id}`}
              >
                <Send className="h-4 w-4 mr-2" />
                Request
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleSendMessage(player)}
                data-testid={`button-send-message-${player.id}`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredPlayers?.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No players found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}

      {/* Play Request Dialog */}
      <Dialog open={!!selectedPlayer && messageMode === 'request'} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
        <DialogContent data-testid="dialog-play-request">
          <DialogHeader>
            <DialogTitle>Send Play Request to {selectedPlayer?.username || selectedPlayer?.firstName}</DialogTitle>
            <DialogDescription>
              Choose a game and send a message to invite them to play
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Game</label>
              <Select value={selectedGame} onValueChange={setSelectedGame}>
                <SelectTrigger data-testid="select-game">
                  <SelectValue placeholder="Choose a game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call of Duty: BO3">Call of Duty: BO3</SelectItem>
                  <SelectItem value="Forza">Forza</SelectItem>
                  <SelectItem value="Halo">Halo</SelectItem>
                  <SelectItem value="FIFA">FIFA</SelectItem>
                  <SelectItem value="Apex Legends">Apex Legends</SelectItem>
                  <SelectItem value="Valorant">Valorant</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message (Optional)</label>
              <Textarea
                placeholder="Hey! Want to team up?"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                data-testid="input-play-message"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedPlayer(null)}
              data-testid="button-cancel-play-request"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={!selectedGame || playRequestMutation.isPending}
              data-testid="button-submit-play-request"
            >
              {playRequestMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
