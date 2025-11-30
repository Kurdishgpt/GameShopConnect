// Main online/production entry point for Vercel deployment
import { createOnlineServer } from "./online";

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    const app = await createOnlineServer();
    
    const server = app.listen(PORT, () => {
      console.log(`[online] Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("[online] SIGTERM received, closing server");
      server.close(() => {
        console.log("[online] Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("[online] Failed to start server:", error);
    process.exit(1);
  }
})();
