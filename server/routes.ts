import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import passport from "passport";
import { z } from "zod";
import { 
  signupSchema,
  loginSchema,
  updateProfileSchema, 
  insertShopItemSchema, 
  insertShopRequestSchema, 
  insertPlayRequestSchema, 
  insertMessageSchema, 
  insertVideoStorySchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // ===== AUTH ROUTES =====
  app.post('/api/auth/signup', async (req: any, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const passwordHash = await hashPassword(validatedData.password);

      // Create user
      const user = await storage.createUser({
        username: validatedData.username,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : undefined,
        gender: validatedData.gender,
      });

      // Log user in after signup
      req.login(user, (err: Error | null) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after signup" });
        }
        res.json(user);
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: error.message || "Failed to create user" });
    }
  });

  app.post('/api/auth/login', passport.authenticate('local'), (req: any, res) => {
    res.json(req.user);
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
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
      const userId = req.user?.id;
      const validatedData = updateProfileSchema.parse(req.body);
      const user = await storage.updateUserProfile(userId, validatedData);
      res.json(user);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: error.message || "Failed to update profile" });
    }
  });

  // ===== ROLE UPDATE ROUTES =====
  app.patch('/api/profile/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { role, password } = req.body;

      // Verify password
      const ROLE_PASSWORD = "rahand20115";
      if (password !== ROLE_PASSWORD) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Validate role
      const validRoles = ["owner", "admin", "media", "developer", "player", "seller"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Update user role
      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error: any) {
      console.error("Error updating role:", error);
      res.status(400).json({ message: error.message || "Failed to update role" });
    }
  });

  // ===== OWNER ROLE ASSIGNMENT =====
  app.patch('/api/admin/assign-role', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user;
      const { targetUserId, role } = req.body;

      // Check if current user is owner
      if (currentUser?.role !== 'owner') {
        return res.status(403).json({ message: "Only owners can assign roles" });
      }

      // Validate role
      const validRoles = ["owner", "admin", "media", "developer", "player"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Update target user role
      const targetUser = await storage.updateUserRole(targetUserId, role);
      res.json(targetUser);
    } catch (error: any) {
      console.error("Error assigning role:", error);
      res.status(400).json({ message: error.message || "Failed to assign role" });
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

  // Heartbeat to mark user as online
  app.post('/api/heartbeat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      await storage.updateUserOnlineStatus(userId, true);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating heartbeat:", error);
      res.status(500).json({ message: "Failed to update heartbeat" });
    }
  });

  // Mark user as offline
  app.post('/api/offline', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      await storage.updateUserOnlineStatus(userId, false);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking user offline:", error);
      res.status(500).json({ message: "Failed to mark offline" });
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

  app.get('/api/shop/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const requests = await storage.getUserShopRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching shop requests:", error);
      res.status(500).json({ message: "Failed to fetch shop requests" });
    }
  });

  app.patch('/api/shop/requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id;

      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updated = await storage.updatePlayRequestStatus(id, status);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating shop request:", error);
      res.status(400).json({ message: error.message || "Failed to update request" });
    }
  });

  app.post('/api/shop/items', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user;

      // Check if current user is owner
      if (currentUser?.role !== 'owner') {
        return res.status(403).json({ message: "Only owners can add items to the shop" });
      }

      const validatedData = insertShopItemSchema.parse(req.body);
      const item = await storage.createShopItem({ ...validatedData, ownerId: currentUser.id });
      res.json(item);
    } catch (error: any) {
      console.error("Error creating shop item:", error);
      res.status(400).json({ message: error.message || "Failed to create shop item" });
    }
  });

  app.delete('/api/shop/items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user;

      // Check if current user is owner
      if (currentUser?.role !== 'owner') {
        return res.status(403).json({ message: "Only owners can delete items" });
      }

      const { id } = req.params;
      await storage.deleteShopItem(id);
      res.json({ message: "Item deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting shop item:", error);
      res.status(400).json({ message: error.message || "Failed to delete shop item" });
    }
  });

  app.post('/api/shop/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const currentUser = req.user;
      const validatedData = insertShopRequestSchema.parse(req.body);
      const request = await storage.createShopRequest({ ...validatedData, userId });
      
      // Get the shop item to find the owner
      const item = await storage.getShopItem(validatedData.itemId);
      if (item && item.ownerId) {
        const username = currentUser?.username || currentUser?.firstName || "A player";
        await storage.createNotification({
          userId: item.ownerId,
          title: `New Shop Request for ${item.title}`,
          message: `${username} requested to buy ${item.title}`,
          type: 'shop',
        });
      }
      
      res.json(request);
    } catch (error: any) {
      console.error("Error creating shop request:", error);
      res.status(400).json({ message: error.message || "Failed to create shop request" });
    }
  });

  app.get('/api/shop/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
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
      const fromUserId = req.user?.id;
      const fromUser = req.user;
      const { toUserId, game, message } = req.body;
      
      // Validate request body (without fromUserId which is provided by auth)
      const bodySchema = z.object({
        toUserId: z.string().min(1),
        game: z.string().min(1),
        message: z.string().optional(),
      });
      const validatedBody = bodySchema.parse({ toUserId, game, message });
      const request = await storage.createPlayRequest({ ...validatedBody, fromUserId });
      
      // Create notification for the recipient
      const username = fromUser?.username || fromUser?.firstName || "A player";
      await storage.createNotification({
        userId: toUserId,
        title: `New Play Request from ${username}`,
        message: `${username} wants to play ${game} with you`,
        type: 'play',
      });
      
      res.json(request);
    } catch (error: any) {
      console.error("Error creating play request:", error);
      res.status(400).json({ message: error.message || "Failed to create play request" });
    }
  });

  app.get('/api/play-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
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
      const userId = req.user?.id;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/messages/:otherUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
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
      const fromUserId = req.user?.id;
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage({ ...validatedData, fromUserId });
      res.json(message);
    } catch (error: any) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: error.message || "Failed to create message" });
    }
  });

  app.delete('/api/messages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMessage(id);
      res.json({ message: "Message deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting message:", error);
      res.status(400).json({ message: error.message || "Failed to delete message" });
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
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // Check if user has media role
      if (userRole !== 'media') {
        return res.status(403).json({ message: "Only users with media role can post stories" });
      }

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

  // ===== NOTIFICATION ROUTES =====
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const notifs = await storage.getUserNotifications(userId);
      res.json(notifs);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.delete('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNotification(id);
      res.json({ message: "Notification deleted" });
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      res.status(400).json({ message: error.message || "Failed to delete notification" });
    }
  });

  app.patch('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notif = await storage.markNotificationRead(id);
      res.json(notif);
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      res.status(400).json({ message: error.message || "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
