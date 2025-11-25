import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Message, User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";

export default function Messages() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

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

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Array<{
    user: User;
    lastMessage: Message;
    unreadCount: number;
  }>>({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<(Message & {
    fromUser: User;
    toUser: User;
  })[]>({
    queryKey: ["/api/messages", selectedUserId],
    enabled: isAuthenticated && !!selectedUserId,
  });

  const sendMutation = useMutation({
    mutationFn: async (data: { toUserId: string; content: string }) => {
      await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
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
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (selectedUserId && messageText.trim()) {
      sendMutation.mutate({
        toUserId: selectedUserId,
        content: messageText,
      });
    }
  };

  const getUserInitials = (messageUser: User) => {
    if (messageUser.username) {
      return messageUser.username.substring(0, 2).toUpperCase();
    }
    if (messageUser.firstName && messageUser.lastName) {
      return `${messageUser.firstName[0]}${messageUser.lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const selectedConversation = conversations?.find(c => c.user.id === selectedUserId);

  if (authLoading || conversationsLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px] md:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="font-heading font-bold text-4xl md:text-5xl flex items-center gap-3" data-testid="heading-messages">
          <MessageSquare className="h-10 w-10 text-primary" />
          Messages
        </h1>
        <p className="text-muted-foreground text-lg">
          Chat with other gamers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Your recent chats</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {conversations && conversations.length > 0 ? (
                <div className="space-y-1 p-4">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.user.id}
                      onClick={() => setSelectedUserId(conversation.user.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors hover-elevate active-elevate-2 ${
                        selectedUserId === conversation.user.id
                          ? "bg-accent"
                          : ""
                      }`}
                      data-testid={`conversation-${conversation.user.id}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.user.profileImageUrl || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {getUserInitials(conversation.user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium truncate">
                          {conversation.user.username || conversation.user.firstName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="ml-auto">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-1">Start chatting with players!</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="md:col-span-2">
          {selectedUserId && selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.user.profileImageUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getUserInitials(selectedConversation.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedConversation.user.username || selectedConversation.user.firstName}
                    </CardTitle>
                    {selectedConversation.user.selectedPlatform && (
                      <CardDescription className="text-xs">
                        {selectedConversation.user.selectedPlatform}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[480px] p-4">
                  {messagesLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : messages && messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isFromMe = message.fromUserId === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
                            data-testid={`message-${message.id}`}
                          >
                            <div className={`max-w-[70%] ${isFromMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                              <div
                                className={`rounded-lg p-3 ${
                                  isFromMe
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <p className="text-xs text-muted-foreground px-2">
                                {formatTime(message.createdAt!)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">Start the conversation!</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      data-testid="input-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMutation.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-[600px] text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Choose a chat from the list to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
