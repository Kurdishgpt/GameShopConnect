import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  updateProfileSchema, 
  insertShopItemSchema, 
  insertShopRequestSchema, 
  insertPlayRequestSchema, 
  insertMessageSchema, 
  insertVideoStorySchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth middleware
  await setupAuth(app);

  // ===== AUTH ROUTES =====
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ===== PROFILE ROUTES =====
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = updateProfileSchema.parse(req.body);
      const user = await storage.updateUserProfile(userId, validatedData);
      res.json(user);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: error.message || "Failed to update profile" });
    }
  });

  // ===== PLAYER ROUTES =====
  app.get('/api/players', isAuthenticated, async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      res.json(players);
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  // ===== SHOP ROUTES =====
  app.get('/api/shop/items', isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getAllShopItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching shop items:", error);
      res.status(500).json({ message: "Failed to fetch shop items" });
    }
  });

  app.post('/api/shop/items', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertShopItemSchema.parse(req.body);
      const item = await storage.createShopItem(validatedData);
      res.json(item);
    } catch (error: any) {
      console.error("Error creating shop item:", error);
      res.status(400).json({ message: error.message || "Failed to create shop item" });
    }
  });

  app.post('/api/shop/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertShopRequestSchema.parse(req.body);
      const request = await storage.createShopRequest({ ...validatedData, userId });
      res.json(request);
    } catch (error: any) {
      console.error("Error creating shop request:", error);
      res.status(400).json({ message: error.message || "Failed to create shop request" });
    }
  });

  app.get('/api/shop/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getUserShopRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching shop requests:", error);
      res.status(500).json({ message: "Failed to fetch shop requests" });
    }
  });

  // ===== PLAY REQUEST ROUTES =====
  app.post('/api/play-requests', isAuthenticated, async (req: any, res) => {
    try {
      const fromUserId = req.user.claims.sub;
      const validatedData = insertPlayRequestSchema.parse(req.body);
      const request = await storage.createPlayRequest({ ...validatedData, fromUserId });
      res.json(request);
    } catch (error: any) {
      console.error("Error creating play request:", error);
      res.status(400).json({ message: error.message || "Failed to create play request" });
    }
  });

  app.get('/api/play-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getUserPlayRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching play requests:", error);
      res.status(500).json({ message: "Failed to fetch play requests" });
    }
  });

  app.patch('/api/play-requests/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const request = await storage.updatePlayRequestStatus(id, status);
      res.json(request);
    } catch (error: any) {
      console.error("Error updating play request:", error);
      res.status(400).json({ message: error.message || "Failed to update play request" });
    }
  });

  // ===== MESSAGE ROUTES =====
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/messages/:otherUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { otherUserId } = req.params;
      const messages = await storage.getMessages(userId, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const fromUserId = req.user.claims.sub;
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage({ ...validatedData, fromUserId });
      res.json(message);
    } catch (error: any) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: error.message || "Failed to create message" });
    }
  });

  // ===== VIDEO STORY ROUTES =====
  app.get('/api/stories', isAuthenticated, async (req, res) => {
    try {
      const stories = await storage.getAllVideoStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.post('/api/stories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertVideoStorySchema.parse(req.body);
      const story = await storage.createVideoStory({ ...validatedData, userId });
      res.json(story);
    } catch (error: any) {
      console.error("Error creating story:", error);
      res.status(400).json({ message: error.message || "Failed to create story" });
    }
  });

  app.post('/api/stories/:id/like', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const story = await storage.likeVideoStory(id);
      res.json(story);
    } catch (error: any) {
      console.error("Error liking story:", error);
      res.status(400).json({ message: error.message || "Failed to like story" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
