import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Message, User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Video, Send, Camera, Smile, Gift, Plus, ArrowLeft, Zap } from "lucide-react";

export default function Messages() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  // Get userId from query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    if (userId) {
      setSelectedUserId(userId);
    }
  }, []);

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

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery<Array<{
    user: User;
    lastMessage: Message;
    unreadCount: number;
  }>>({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
  });

  // Fetch messages for selected user
  const { data: messages, isLoading: messagesLoading } = useQuery<(Message & {
    fromUser: User;
    toUser: User;
  })[]>({
    queryKey: ["/api/messages", selectedUserId],
    enabled: isAuthenticated && !!selectedUserId,
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (data: { toUserId: string; content: string }) => {
      await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        description: "Message sent!",
      });
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

  const selectedConversation = conversations?.find(c => c.user.id === selectedUserId);

  const getInitials = (u: User) => {
    if (u.username) return u.username.substring(0, 2).toUpperCase();
    if (u.firstName && u.lastName) return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
    return "U";
  };

  const getGradientColor = (userId: string, index: number) => {
    const colors = [
      "bg-gradient-to-br from-cyan-400 to-blue-500",
      "bg-gradient-to-br from-pink-400 to-purple-500",
      "bg-gradient-to-br from-lime-400 to-green-500",
      "bg-gradient-to-br from-orange-400 to-red-500",
    ];
    return colors[Math.abs(userId.charCodeAt(0) + index) % colors.length];
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Conversations List */}
      <div className={`${selectedUserId ? "hidden md:flex" : "flex"} w-full md:w-80 flex-col bg-slate-950/80 backdrop-blur-xl border-r border-white/10`}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-black text-white mb-1">Messages</h2>
          <p className="text-cyan-200 text-sm font-semibold">Connect with gamers</p>
        </div>

        {/* Search */}
        <div className="p-4">
          <Input
            placeholder="Search conversations..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400 focus:bg-cyan-500/5 rounded-xl"
          />
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-3">
            {conversations && conversations.length > 0 ? (
              conversations.map((conversation, idx) => (
                <button
                  key={conversation.user.id}
                  onClick={() => setSelectedUserId(conversation.user.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all hover-elevate ${
                    selectedUserId === conversation.user.id
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30"
                      : "hover:bg-white/5"
                  }`}
                  data-testid={`conversation-${conversation.user.id}`}
                >
                  {/* Avatar */}
                  <div className={`relative w-12 h-12 rounded-full ${getGradientColor(conversation.user.id, idx)} flex items-center justify-center font-black text-white shadow-lg`}>
                    {getInitials(conversation.user)}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-950"></div>
                  </div>

                  {/* Message Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-bold text-white truncate">
                      {conversation.user.username || `${conversation.user.firstName} ${conversation.user.lastName}`}
                    </p>
                    <p className="text-xs text-white/60 truncate">{conversation.lastMessage.content}</p>
                  </div>

                  {/* Unread Badge */}
                  {conversation.unreadCount > 0 && (
                    <Badge className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-black ml-auto">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-white/50">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-bold">No conversations yet</p>
                <p className="text-sm mt-1">Start chatting!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-slate-950/50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedUserId(null)}
                className="md:hidden text-cyan-400 hover:text-cyan-300 transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedConversation.user.profileImageUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-black">
                  {getInitials(selectedConversation.user)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-black text-white">
                  {selectedConversation.user.username || `${selectedConversation.user.firstName} ${selectedConversation.user.lastName}`}
                </p>
                <p className="text-xs font-semibold text-green-400">🟢 Active now</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/10 rounded-lg transition text-cyan-400 hover:text-cyan-300">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition text-purple-400 hover:text-purple-300">
                <Video className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4 max-w-2xl">
              {messagesLoading ? (
                <div className="text-center text-white/50">
                  <p>Loading messages...</p>
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((msg) => {
                  const isFromMe = msg.fromUserId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
                      data-testid={`message-${msg.id}`}
                    >
                      <div className={`flex flex-col gap-2 max-w-xs ${isFromMe ? "items-end" : "items-start"}`}>
                        <div className={`px-4 py-3 rounded-3xl ${
                          isFromMe
                            ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-purple-500/30 font-bold"
                            : "bg-white/10 text-white border border-white/20"
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <span className="text-xs text-white/50 px-2">{formatTime(msg.createdAt!)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full text-white/50 text-center">
                  <div>
                    <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">No messages yet</p>
                    <p className="text-sm mt-1">Start the conversation!</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition text-orange-400 hover:text-orange-300">
                  <Camera className="w-6 h-6" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition text-yellow-400 hover:text-yellow-300">
                  <Smile className="w-6 h-6" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition text-pink-400 hover:text-pink-300">
                  <Gift className="w-6 h-6" />
                </button>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-lg transition text-cyan-400 hover:text-cyan-300">
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Send a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400 focus:bg-cyan-500/5 rounded-full px-5"
                data-testid="input-message"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendMutation.isPending}
                className="p-3 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover-elevate"
                data-testid="button-send-message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center text-white/50">
          <div className="text-center">
            <Zap className="w-20 h-20 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-bold">Select a conversation</p>
            <p className="text-sm mt-1">Choose a chat from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
