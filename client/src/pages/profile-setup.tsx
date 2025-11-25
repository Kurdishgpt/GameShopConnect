import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  age: z.coerce.number().min(13, "You must be at least 13 years old").max(120),
  selectedPlatform: z.enum(["playstation", "xbox", "pc", "switch", "mobile"]),
  bio: z.string().max(500).optional(),
  favoriteGames: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileSetup() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

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

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      age: user?.age || undefined,
      selectedPlatform: user?.selectedPlatform || undefined,
      bio: user?.bio || "",
      favoriteGames: user?.favoriteGames?.join(", ") || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const payload = {
        ...data,
        favoriteGames: data.favoriteGames
          ? data.favoriteGames.split(",").map((g) => g.trim()).filter(Boolean)
          : [],
      };
      await apiRequest("PATCH", "/api/profile", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Your profile has been updated successfully!",
      });
      setLocation("/");
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
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-bold text-4xl" data-testid="heading-profile-setup">
            Setup Your Gaming Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Tell us about yourself to connect with other gamers
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              This information will be visible to other players
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} data-testid="input-username" />
                      </FormControl>
                      <FormDescription>
                        Your unique gamer tag (3-20 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter your age" {...field} data-testid="input-age" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="selectedPlatform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-platform">
                              <SelectValue placeholder="Select your platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="playstation">PlayStation</SelectItem>
                            <SelectItem value="xbox">Xbox</SelectItem>
                            <SelectItem value="pc">PC</SelectItem>
                            <SelectItem value="switch">Nintendo Switch</SelectItem>
                            <SelectItem value="mobile">Mobile</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself..."
                          className="resize-none"
                          {...field}
                          data-testid="input-bio"
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description about your gaming style
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="favoriteGames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favorite Games (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., BO3, Forza, Call of Duty" {...field} data-testid="input-games" />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of your favorite games
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {mutation.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/")}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
