import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuthRoutes } from "./api/auth";
import { setupProfileRoutes } from "./api/profile";
import { setupShopRoutes } from "./api/shop";
import { setupMessageRoutes } from "./api/messages";
import { setupStoryRoutes } from "./api/stories";
import { setupPlayRequestRoutes } from "./api/play-requests";
import { setupNotificationRoutes } from "./api/notifications";
import { requestLogger, errorHandler } from "./api/middleware";

export async function setupOnlineApp(app: Express) {
  // Global middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(requestLogger);

  // Setup all API routes
  await setupAuthRoutes(app);
  setupProfileRoutes(app);
  setupShopRoutes(app);
  setupMessageRoutes(app);
  setupStoryRoutes(app);
  setupPlayRequestRoutes(app);
  setupNotificationRoutes(app);

  // Error handling middleware
  app.use(errorHandler);

  return app;
}

export async function createOnlineServer() {
  const app = express();
  await setupOnlineApp(app);
  return app;
}
