import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { insertPlayRequestSchema } from "@shared/schema";

export function setupPlayRequestRoutes(app: Express) {
  app.post('/api/play-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const validatedData = insertPlayRequestSchema.parse(req.body);
      const request = await storage.createPlayRequest({
        ...validatedData,
        fromUserId: userId,
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

  app.patch('/api/play-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.body;
      const request = await storage.updatePlayRequestStatus(req.params.id, status);
      res.json(request);
    } catch (error: any) {
      console.error("Error updating play request:", error);
      res.status(400).json({ message: error.message || "Failed to update play request" });
    }
  });
}
