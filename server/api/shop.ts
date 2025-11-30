import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { insertShopItemSchema, insertShopRequestSchema } from "@shared/schema";

export function setupShopRoutes(app: Express) {
  app.get('/api/shop-items', async (req: any, res) => {
    try {
      const items = await storage.getAllShopItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching shop items:", error);
      res.status(500).json({ message: "Failed to fetch shop items" });
    }
  });

  app.post('/api/shop-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const validatedData = insertShopItemSchema.parse(req.body);
      const item = await storage.createShopItem({
        ...validatedData,
        ownerId: userId,
      });
      res.json(item);
    } catch (error: any) {
      console.error("Error creating shop item:", error);
      res.status(400).json({ message: error.message || "Failed to create shop item" });
    }
  });

  app.delete('/api/shop-items/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteShopItem(req.params.id);
      res.json({ message: "Item deleted" });
    } catch (error) {
      console.error("Error deleting shop item:", error);
      res.status(500).json({ message: "Failed to delete shop item" });
    }
  });

  app.post('/api/shop-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const validatedData = insertShopRequestSchema.parse(req.body);
      const request = await storage.createShopRequest({
        ...validatedData,
        userId,
      });
      res.json(request);
    } catch (error: any) {
      console.error("Error creating shop request:", error);
      res.status(400).json({ message: error.message || "Failed to create shop request" });
    }
  });

  app.get('/api/shop-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const requests = await storage.getUserShopRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching shop requests:", error);
      res.status(500).json({ message: "Failed to fetch shop requests" });
    }
  });
}
