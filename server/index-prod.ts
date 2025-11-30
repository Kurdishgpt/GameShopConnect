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

  console.log("[prod] Attempting to serve static files from:", distPath);
  console.log("[prod] Directory exists:", fs.existsSync(distPath));

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files
  app.use(express.static(distPath, { 
    maxAge: "1d",
    etag: false 
  }));

  // fall through to index.html for all other routes (SPA routing)
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("index.html not found");
    }
  });
}

(async () => {
  await runApp(serveStatic);
})();
