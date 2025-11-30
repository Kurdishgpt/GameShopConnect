import type { Express } from "express";
import { storage } from "../storage";
import { setupAuth, isAuthenticated, hashPassword } from "../auth";
import passport from "passport";
import { signupSchema, loginSchema } from "@shared/schema";

export async function setupAuthRoutes(app: Express) {
  await setupAuth(app);

  app.post('/api/auth/signup', async (req: any, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const passwordHash = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        username: validatedData.username,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : undefined,
        gender: validatedData.gender,
      });

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

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.redirect("/");
    });
  });
}
