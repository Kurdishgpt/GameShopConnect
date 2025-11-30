import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { insertVideoStorySchema } from "@shared/schema";

export function setupStoryRoutes(app: Express) {
  app.get('/api/stories', async (req: any, res) => {
    try {
      const stories = await storage.getAllVideoStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get('/api/stories/:id', async (req: any, res) => {
    try {
      const story = await storage.getVideoStory(req.params.id);
      res.json(story);
    } catch (error) {
      console.error("Error fetching story:", error);
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });

  app.post('/api/stories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const validatedData = insertVideoStorySchema.parse(req.body);
      const story = await storage.createVideoStory({
        ...validatedData,
        userId,
      });
      res.json(story);
    } catch (error: any) {
      console.error("Error creating story:", error);
      res.status(400).json({ message: error.message || "Failed to create story" });
    }
  });

  app.delete('/api/stories/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteVideoStory(req.params.id);
      res.json({ message: "Story deleted" });
    } catch (error) {
      console.error("Error deleting story:", error);
      res.status(500).json({ message: "Failed to delete story" });
    }
  });

  app.post('/api/stories/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const story = await storage.likeVideoStory(req.params.id);
      res.json(story);
    } catch (error) {
      console.error("Error liking story:", error);
      res.status(500).json({ message: "Failed to like story" });
    }
  });
}
