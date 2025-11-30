import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, hashPassword } from "../auth";
import { updateProfileSchema } from "@shared/schema";

export function setupProfileRoutes(app: Express) {
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

  app.patch('/api/profile/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { role, password } = req.body;

      const ROLE_PASSWORD = "rahand20115";
      if (password !== ROLE_PASSWORD) {
        return res.status(403).json({ message: "Invalid password for role selection" });
      }

      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error: any) {
      console.error("Error updating role:", error);
      res.status(400).json({ message: error.message || "Failed to update role" });
    }
  });
}
