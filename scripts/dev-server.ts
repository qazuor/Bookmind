/**
 * Development Server for API Routes
 *
 * Runs the API serverless functions locally using Node.js http server.
 * This is more reliable than vercel dev for local development.
 */

import { config } from "dotenv";

// Load environment variables from .env.local BEFORE any other imports
config({ path: ".env.local" });

import { createServer } from "node:http";

const PORT = 3001;

// Dynamically import auth after env vars are loaded
async function startServer() {
  const { toNodeHandler } = await import("better-auth/node");
  const { auth } = await import("../src/lib/auth");

  // Better Auth handler
  const authHandler = toNodeHandler(auth);

  const server = createServer(async (req, res) => {
    const url = req.url || "/";

    // CORS headers for development
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Handle preflight
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check
    if (url === "/api/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
      );
      return;
    }

    // Auth routes
    if (url.startsWith("/api/auth")) {
      return authHandler(req, res);
    }

    // 404 for unknown routes
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  server.listen(PORT, () => {
    console.log(`🚀 API dev server running at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Auth:   http://localhost:${PORT}/api/auth/*`);
  });
}

// Start the server
startServer().catch(console.error);
