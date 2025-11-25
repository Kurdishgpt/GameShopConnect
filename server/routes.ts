import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import passport from "passport";
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
      const ROLE_PASSWORD = "client_look";
      if (password !== ROLE_PASSWORD) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Validate role
      const validRoles = ["owner", "admin", "media", "developer", "player"];
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
      const userId = req.user?.id;
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
