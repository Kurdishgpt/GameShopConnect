import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { VideoStory, User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, Heart, Plus, Play } from "lucide-react";

export default function Stories() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

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

  const { data: stories, isLoading } = useQuery<(VideoStory & { user: User })[]>({
    queryKey: ["/api/stories"],
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; videoUrl: string; thumbnailUrl: string }) => {
      await apiRequest("POST", "/api/stories", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your story has been posted!",
      });
      setIsCreateOpen(false);
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setThumbnailUrl("");
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
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
        description: error.message || "Failed to post story",
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (storyId: string) => {
      await apiRequest("POST", `/api/stories/${storyId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
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
    },
  });

  const handleCreateStory = () => {
    if (title && videoUrl) {
      createMutation.mutate({ title, description, videoUrl, thumbnailUrl });
    }
  };

  const getUserInitials = (storyUser: User) => {
    if (storyUser.username) {
      return storyUser.username.substring(0, 2).toUpperCase();
    }
    if (storyUser.firstName && storyUser.lastName) {
      return `${storyUser.firstName[0]}${storyUser.lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <h1 className="font-heading font-bold text-4xl md:text-5xl flex items-center gap-3" data-testid="heading-stories">
            <Video className="h-10 w-10 text-primary" />
            Video Stories
          </h1>
          <p className="text-muted-foreground text-lg">
            Share and discover epic gaming moments
          </p>
        </div>
        
        {user?.role === 'media' ? (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-story">
                <Plus className="h-5 w-5 mr-2" />
                Post Story
              </Button>
            </DialogTrigger>
          <DialogContent data-testid="dialog-create-story">
            <DialogHeader>
              <DialogTitle>Post a Video Story</DialogTitle>
              <DialogDescription>
                Share your gaming highlights and epic moments with the community
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="Epic clutch in ranked match..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="input-story-title"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                <Textarea
                  placeholder="Describe what happened..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  data-testid="input-story-description"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Video URL</label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  data-testid="input-story-video-url"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Thumbnail URL (Optional)</label>
                <Input
                  placeholder="https://..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  data-testid="input-story-thumbnail-url"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                data-testid="button-cancel-story"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateStory}
                disabled={!title || !videoUrl || createMutation.isPending}
                data-testid="button-submit-story"
              >
                {createMutation.isPending ? "Posting..." : "Post Story"}
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        ) : (
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Only media creators can post stories</p>
          </div>
        )}
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stories?.map((story) => (
          <Card key={story.id} className="hover-elevate flex flex-col" data-testid={`card-story-${story.id}`}>
            <CardHeader className="pb-3">
              <div
                className="aspect-video rounded-md bg-gradient-to-br from-primary/20 to-accent/20 mb-3 overflow-hidden relative cursor-pointer group"
                onClick={() => window.open(story.videoUrl, '_blank')}
              >
                {story.thumbnailUrl ? (
                  <img
                    src={story.thumbnailUrl}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardTitle className="line-clamp-2 text-lg" data-testid={`text-story-title-${story.id}`}>
                {story.title}
              </CardTitle>
              {story.description && (
                <CardDescription className="line-clamp-2">
                  {story.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pb-3 flex-1">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={story.user.profileImageUrl || undefined} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getUserInitials(story.user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {story.user.username || story.user.firstName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(story.createdAt!)}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => likeMutation.mutate(story.id)}
                className="gap-2"
                data-testid={`button-like-${story.id}`}
              >
                <Heart className="h-4 w-4" />
                {story.likes || 0}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(story.videoUrl, '_blank')}
                data-testid={`button-watch-${story.id}`}
              >
                Watch
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {stories?.length === 0 && (
        <div className="text-center py-12">
          <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No stories yet</h3>
          <p className="text-muted-foreground mb-4">Be the first to share your gaming moments!</p>
          <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-story">
            <Plus className="h-4 w-4 mr-2" />
            Post Your First Story
          </Button>
        </div>
      )}
    </div>
  );
}
