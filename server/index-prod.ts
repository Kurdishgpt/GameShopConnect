import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";
import { fileURLToPath } from "node:url";

import express, { type Express } from "express";
import runApp from "./app";

export async function serveStatic(app: Express, _server: Server) {
  // Get the directory of this file, accounting for bundling
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Public directory is alongside index.js in dist/
  const distPath = path.resolve(__dirname, "public");

  console.log("[prod] Setting up static file serving from:", distPath);
  console.log("[prod] Directory exists:", fs.existsSync(distPath));

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static assets with cache
  app.use(express.static(distPath, { 
    maxAge: "1d",
    etag: false,
    index: false  // Don't auto-serve index.html, we handle it below
  }));

  // SPA routing: serve index.html for all non-API, non-static requests
  app.use("*", (req, res) => {
    // Don't catch API requests
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "API endpoint not found" });
    }
    
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.set("Content-Type", "text/html");
      res.sendFile(indexPath);
    } else {
      res.status(404).send("index.html not found");
    }
  });
}

(async () => {
  await runApp(serveStatic);
})();
