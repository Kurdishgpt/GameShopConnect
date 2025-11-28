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
import { Phone, Video, Send, Camera, Smile, Gift, Plus, ArrowLeft, Zap, Heart, Image as ImageIcon, Check } from "lucide-react";

// Mock conversations with different message types
const MOCK_CONVERSATIONS = [
  {
    id: "user1",
    name: "Pro Gamer Jake",
    avatar: "JG",
    color: "bg-gradient-to-br from-cyan-400 to-blue-500",
    status: "online",
    lastMessage: "GG! 🎮",
    unread: 2,
    messages: [
      { type: "text", content: "Hey! You free to play?", sent: false, time: "10:30" },
      { type: "emoji", content: "🎮", sent: false, time: "10:31" },
      { type: "text", content: "Let's go! I'm in", sent: true, time: "10:32" },
      { type: "image", content: "Screenshot of victory", sent: true, time: "10:35" },
      { type: "text", content: "GG! Great match", sent: false, time: "10:36" },
    ]
  },
  {
    id: "user2",
    name: "Luna Gaming",
    avatar: "LG",
    color: "bg-gradient-to-br from-pink-400 to-purple-500",
    status: "online",
    lastMessage: "See you in squad soon!",
    unread: 0,
    messages: [
      { type: "text", content: "Squad up tonight?", sent: false, time: "09:15" },
      { type: "emoji", content: "✨💜", sent: false, time: "09:16" },
    ]
  },
  {
    id: "user3",
    name: "Shadow King",
    avatar: "SK",
    color: "bg-gradient-to-br from-lime-400 to-green-500",
    status: "offline",
    lastMessage: "Let's play ranked!",
    unread: 0,
    messages: [
      { type: "text", content: "Ranked match in 5?", sent: false, time: "08:45" },
    ]
  },
  {
    id: "user4",
    name: "Pixel Master",
    avatar: "PM",
    color: "bg-gradient-to-br from-orange-400 to-red-500",
    status: "online",
    lastMessage: "Call me when ready",
    unread: 1,
    messages: [
      { type: "text", content: "Video call?", sent: false, time: "11:00" },
    ]
  },
];

export default function Messages() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [localMessages, setLocalMessages] = useState<any[]>([]);

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

  // Load mock messages when user is selected
  useEffect(() => {
    if (selectedUserId) {
      const conversation = MOCK_CONVERSATIONS.find(c => c.id === selectedUserId);
      if (conversation) {
        setLocalMessages(conversation.messages);
      }
    }
  }, [selectedUserId]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage = {
        type: "text",
        content: messageText,
        sent: true,
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      };
      setLocalMessages([...localMessages, newMessage]);
      setMessageText("");
      toast({
        description: "Message sent!",
      });
    }
  };

  const selectedConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedUserId);

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
            {MOCK_CONVERSATIONS.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedUserId(conversation.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all hover-elevate ${
                  selectedUserId === conversation.id
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30"
                    : "hover:bg-white/5"
                }`}
              >
                {/* Avatar */}
                <div className={`relative w-12 h-12 rounded-full ${conversation.color} flex items-center justify-center font-black text-white shadow-lg`}>
                  {conversation.avatar}
                  {conversation.status === "online" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-950"></div>
                  )}
                </div>

                {/* Message Info */}
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-bold text-white truncate">{conversation.name}</p>
                  <p className="text-xs text-white/60 truncate">{conversation.lastMessage}</p>
                </div>

                {/* Unread Badge */}
                {conversation.unread > 0 && (
                  <Badge className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-black ml-auto">
                    {conversation.unread}
                  </Badge>
                )}
              </button>
            ))}
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
              <div className={`w-12 h-12 rounded-full ${selectedConversation.color} flex items-center justify-center font-black text-white shadow-lg`}>
                {selectedConversation.avatar}
              </div>
              <div>
                <p className="font-black text-white">{selectedConversation.name}</p>
                <p className={`text-xs font-semibold ${selectedConversation.status === "online" ? "text-green-400" : "text-white/50"}`}>
                  {selectedConversation.status === "online" ? "🟢 Active now" : "⚪ Offline"}
                </p>
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
              {localMessages.length > 0 ? (
                localMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex flex-col gap-2 max-w-xs ${msg.sent ? "items-end" : "items-start"}`}>
                      {msg.type === "text" && (
                        <div className={`px-4 py-3 rounded-3xl ${
                          msg.sent
                            ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-purple-500/30 font-bold"
                            : "bg-white/10 text-white border border-white/20"
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      )}
                      {msg.type === "emoji" && (
                        <div className="text-4xl">{msg.content}</div>
                      )}
                      {msg.type === "image" && (
                        <div className={`px-4 py-3 rounded-2xl border-2 ${
                          msg.sent
                            ? "bg-gradient-to-br from-cyan-400 to-purple-500 border-cyan-400 text-white"
                            : "bg-white/10 border-white/20 text-white"
                        } flex items-center gap-2 font-bold`}>
                          <ImageIcon className="w-5 h-5" />
                          {msg.content}
                        </div>
                      )}
                      <span className="text-xs text-white/50 px-2">{msg.time}</span>
                    </div>
                  </div>
                ))
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
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="p-3 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover-elevate"
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
