import express, { type Request, Response, NextFunction } from "express";
import os from "os";
import { registerRoutes } from "./routes";
import { registerDiagnosticRoutes } from "./diagnosticRoutes";
import { initRealtime } from "./realtime";
import { serveStatic } from "./static";
import { storagePromise } from "./storage";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize storage first
  await storagePromise;
  
  await initRealtime(httpServer);
  await registerRoutes(httpServer, app);
  await registerDiagnosticRoutes(app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    try {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    } catch (error: any) {
      // Vite might fail due to crypto.hash compatibility issues on older Node versions
      // Fallback to serving static files
      console.error("⚠️  Vite setup failed:", error.message);
      console.log("📦 Falling back to static file serving");
      serveStatic(app);
    }
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Default to 5000 if not specified. Bind host can be configured via HOST env.
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";

  httpServer.listen(port, host, () => {
    const displayHost = host === "0.0.0.0" ? "localhost" : host;
    log(`serving on http://${displayHost}:${port}`);

    // If bound to 0.0.0.0, also log a LAN-accessible IP for convenience
    if (host === "0.0.0.0") {
      const nets = os.networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name] || []) {
          if (net.family === "IPv4" && !net.internal) {
            log(`also accessible on http://${net.address}:${port}`);
          }
        }
      }
    }
  });
})();
