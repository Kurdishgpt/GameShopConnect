import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Star, Send } from "lucide-react";

export default function Feedback() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [feedbackType, setFeedbackType] = useState("general");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

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

  const submitMutation = useMutation({
    mutationFn: async (data: { type: string; rating: number; title: string; message: string }) => {
      await apiRequest("POST", "/api/feedback", data);
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully",
      });
      setFeedbackType("general");
      setTitle("");
      setMessage("");
      setRating(0);
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
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (title && message) {
      submitMutation.mutate({
        type: feedbackType,
        rating,
        title,
        message,
      });
    } else {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and message",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-12 w-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-3">
            <MessageSquare className="h-10 w-10 text-primary" />
            <h1 className="font-heading font-bold text-4xl md:text-5xl" data-testid="heading-feedback">
              Send Feedback
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Help us improve by sharing your thoughts, reporting bugs, or suggesting features
          </p>
        </div>

        {/* Main Feedback Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-4 pb-6">
            <div>
              <CardTitle className="text-xl mb-2">Feedback Type</CardTitle>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger data-testid="select-feedback-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="improvement">Improvement Suggestion</SelectItem>
                  <SelectItem value="general">General Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Rating Section */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">How would you rate your experience?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                    data-testid={`button-rating-${star}`}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
                {(hoveredRating || rating) > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground flex items-center">
                    {hoveredRating || rating} out of 5
                  </span>
                )}
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold">
                Subject
              </label>
              <Input
                id="title"
                placeholder="Brief subject of your feedback..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-feedback-title"
              />
            </div>

            {/* Message Textarea */}
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-semibold">
                Details
              </label>
              <Textarea
                id="message"
                placeholder="Tell us more about your feedback. Be as detailed as possible..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none min-h-40"
                data-testid="input-feedback-message"
              />
              <p className="text-xs text-muted-foreground">{message.length} / 5000 characters</p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !title || !message}
                size="lg"
                className="w-full"
                data-testid="button-submit-feedback"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitMutation.isPending ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-2 text-center">
                <MessageSquare className="h-6 w-6 text-primary mx-auto" />
                <p className="font-semibold text-sm">Be Specific</p>
                <p className="text-xs text-muted-foreground">Provide detailed information to help us better understand</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <div className="space-y-2 text-center">
                <Star className="h-6 w-6 text-accent mx-auto" />
                <p className="font-semibold text-sm">Rate It</p>
                <p className="text-xs text-muted-foreground">Help us prioritize with your honest rating</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="space-y-2 text-center">
                <Send className="h-6 w-6 text-green-600 mx-auto" />
                <p className="font-semibold text-sm">Make Impact</p>
                <p className="text-xs text-muted-foreground">Your feedback shapes the platform</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
