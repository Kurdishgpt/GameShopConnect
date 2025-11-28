import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { VideoStory, User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, Heart, Trash2, Edit } from "lucide-react";

export default function ManageStories() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();

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

    // Check if user is media role
    if (user && user.role !== "media") {
      toast({
        title: "Access Denied",
        description: "Only media creators can access this page",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, authLoading, user, toast]);

  const { data: myStories, isLoading } = useQuery<VideoStory[]>({
    queryKey: ["/api/stories/my-stories"],
    enabled: isAuthenticated && user?.role === "media",
  });

  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      await apiRequest("DELETE", `/api/stories/${storyId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Story deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stories/my-stories"] });
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
        description: error.message || "Failed to delete story",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="font-heading font-bold text-4xl md:text-5xl flex items-center gap-3" data-testid="heading-manage-stories">
          <Video className="h-10 w-10 text-primary" />
          Manage Story Games
        </h1>
        <p className="text-muted-foreground text-lg">
          View and manage all your uploaded story games
        </p>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myStories && myStories.length > 0 ? (
          myStories.map((story) => (
            <Card key={story.id} className="hover-elevate flex flex-col" data-testid={`card-story-manage-${story.id}`}>
              <CardHeader className="pb-3">
                <div className="aspect-video rounded-md bg-gradient-to-br from-primary/20 to-accent/20 mb-3 overflow-hidden relative cursor-pointer group">
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
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>{story.likes || 0} likes</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Posted: {formatDate(story.createdAt!)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled
                  data-testid={`button-edit-story-${story.id}`}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      data-testid={`button-delete-story-${story.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Story Game</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{story.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-2 justify-end">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteStoryMutation.mutate(story.id)}
                        disabled={deleteStoryMutation.isPending}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {deleteStoryMutation.isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No story games yet</h3>
            <p className="text-muted-foreground">Start uploading story games to see them here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
