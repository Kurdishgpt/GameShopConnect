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
import { Phone, Video, Send, Camera, Smile, Gift, Plus, ArrowLeft, Zap, PhoneOff, Mic, MicOff } from "lucide-react";

export default function Messages() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [activeCall, setActiveCall] = useState<{ userId: string; type: "phone" | "video"; status: "ringing" | "connected" } | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Send heartbeat to mark user as online
  useEffect(() => {
    if (!isAuthenticated) return;

    const sendHeartbeat = async () => {
      try {
        await apiRequest("POST", "/api/heartbeat", {});
        queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      } catch (error) {
        console.error("Heartbeat error:", error);
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Send every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);

    // Mark offline when leaving
    const handleBeforeUnload = async () => {
      try {
        await apiRequest("POST", "/api/offline", {});
      } catch (error) {
        console.error("Offline error:", error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [isAuthenticated, queryClient]);

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

  // Fetch all available users
  const { data: allUsers, isLoading: allUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/players"],
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
  const selectedUser = allUsers?.find(u => u.id === selectedUserId);

  // Get conversation user IDs
  const conversationUserIds = new Set(conversations?.map(c => c.user.id) || []);

  // Get users not in conversations
  const availableUsers = allUsers?.filter(u => u.id !== user?.id && !conversationUserIds.has(u.id)) || [];

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

        {/* Conversations & Users */}
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-3">
            {/* Existing Conversations */}
            {conversations && conversations.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-black text-cyan-300 uppercase">Conversations</div>
                {conversations.map((conversation, idx) => (
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
                ))}
              </>
            )}

            {/* Available Users */}
            {availableUsers && availableUsers.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-black text-purple-300 uppercase mt-4">Available Players</div>
                {availableUsers.map((u, idx) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all hover-elevate ${
                      selectedUserId === u.id
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30"
                        : "hover:bg-white/5"
                    }`}
                    data-testid={`user-${u.id}`}
                  >
                    {/* Avatar */}
                    <div className={`relative w-12 h-12 rounded-full ${getGradientColor(u.id, idx + (conversations?.length || 0))} flex items-center justify-center font-black text-white shadow-lg`}>
                      {getInitials(u)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-bold text-white truncate">
                        {u.username || `${u.firstName} ${u.lastName}`}
                      </p>
                      <p className="text-xs text-white/60 truncate">{u.selectedPlatform || "No messages yet"}</p>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Empty State */}
            {(!conversations || conversations.length === 0) && (!availableUsers || availableUsers.length === 0) && (
              <div className="p-8 text-center text-white/50">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-bold">No users available</p>
                <p className="text-sm mt-1">Check back soon!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {(selectedConversation || selectedUser) ? (
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
                <AvatarImage src={(selectedConversation?.user || selectedUser)?.profileImageUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-black">
                  {getInitials(selectedConversation?.user || selectedUser!)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-black text-white">
                  {(selectedConversation?.user || selectedUser)?.username || `${(selectedConversation?.user || selectedUser)?.firstName} ${(selectedConversation?.user || selectedUser)?.lastName}`}
                </p>
                <p className={`text-xs font-semibold ${(selectedConversation?.user || selectedUser)?.isOnline ? "text-green-400" : "text-white/50"}`}>
                  {(selectedConversation?.user || selectedUser)?.isOnline ? "🟢 Online" : "⚪ Offline"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!selectedUserId) return;
                  const selectedUserData = selectedConversation?.user || selectedUser;
                  if (!selectedUserData?.isOnline) {
                    toast({
                      title: "User Offline",
                      description: "This user is not currently online",
                      variant: "destructive",
                    });
                    return;
                  }
                  setActiveCall({ userId: selectedUserId, type: "phone", status: "ringing" });
                  toast({
                    title: "Calling...",
                    description: `Calling ${selectedUserData?.username || 'user'}`,
                  });
                }}
                disabled={activeCall !== null || !(selectedConversation?.user || selectedUser)?.isOnline}
                className="p-2 hover:bg-white/10 rounded-lg transition text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (!selectedUserId) return;
                  const selectedUserData = selectedConversation?.user || selectedUser;
                  if (!selectedUserData?.isOnline) {
                    toast({
                      title: "User Offline",
                      description: "This user is not currently online",
                      variant: "destructive",
                    });
                    return;
                  }
                  setActiveCall({ userId: selectedUserId, type: "video", status: "ringing" });
                  toast({
                    title: "Calling...",
                    description: `Video calling ${selectedUserData?.username || 'user'}`,
                  });
                }}
                disabled={activeCall !== null || !(selectedConversation?.user || selectedUser)?.isOnline}
                className="p-2 hover:bg-white/10 rounded-lg transition text-purple-400 hover:text-purple-300 disabled:opacity-50"
              >
                <Video className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Call Overlay */}
          {activeCall && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center rounded-lg z-50">
              <div className="text-center space-y-6">
                <div>
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={(selectedConversation?.user || selectedUser)?.profileImageUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-purple-500 text-white font-black text-3xl">
                      {getInitials(selectedConversation?.user || selectedUser!)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-2xl font-black text-white">
                    {(selectedConversation?.user || selectedUser)?.username || `${(selectedConversation?.user || selectedUser)?.firstName}`}
                  </p>
                  <p className={`text-sm font-bold mt-2 ${activeCall.status === "ringing" ? "text-yellow-400 animate-pulse" : "text-green-400"}`}>
                    {activeCall.status === "ringing" ? "Ringing..." : `${activeCall.type === "video" ? "Video Call" : "Call"} Connected`}
                  </p>
                </div>

                {activeCall.status === "connected" && (
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-4 rounded-full transition-all ${
                        isMuted ? "bg-red-500 hover:bg-red-600" : "bg-cyan-500 hover:bg-cyan-600"
                      } text-white`}
                    >
                      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={() => {
                        setActiveCall(null);
                        setIsMuted(false);
                        toast({
                          title: "Call Ended",
                          description: "The call has been disconnected",
                        });
                      }}
                      className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </button>
                  </div>
                )}

                {activeCall.status === "ringing" && (
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => {
                        setActiveCall(null);
                        toast({
                          title: "Call Declined",
                          description: "You declined the call",
                        });
                      }}
                      className="px-6 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all font-bold"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

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
