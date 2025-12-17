import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import breachRoutes from "./routes/breachRoutes";
import emailRoutes from "./routes/emailRoutes";
import userRoutes from "./routes/userRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import notificationSettingsRoutes from "./routes/notificationSettingsRoutes";
import monthlySummaryRoutes from "./routes/monthlySummaryRoutes";
import newsRoutes from "./routes/newsRoutes";
import { connectDatabase } from "./config/database";
import { initializeMonthlySummaryScheduler } from "./services/monthlySummaryScheduler";

// Load environment variables (supports .env.local for local development)
dotenv.config();
// Also try loading .env.local (higher priority, typically gitignored)
dotenv.config({ path: ".env.local", override: false });

const app: Application = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// CORS configuration - must be before other middleware
// Supports multiple comma-separated origins and Vercel preview URLs.
const defaultOrigins = ["http://localhost:3000"];
const envOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
].filter(Boolean);
const allowedOrigins = [...defaultOrigins, ...envOrigins];
const vercelPreviewRegex = /^https?:\/\/.*\.vercel\.app$/;

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (like curl) with no origin
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin);

    if (isAllowed) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "user-id"], // Added user-id header
};
app.use(cors(corsOptions)); // Enable CORS for frontend

// Middleware
// Configure helmet to allow API requests
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP for API
  })
);

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Global rate limiting middleware for all API routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit specifically for breach-checking endpoints,
// to protect the external XposedOrNot API and our server from spam clicks
const breachLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // max 5 breach checks per IP per minute
  message:
    "You are checking too many emails too quickly. Please wait a bit and try again.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters
app.use("/api/", globalLimiter);
app.use("/api/breach", breachLimiter);

// Request logging middleware for debugging
app.use((req: Request, res: Response, next: express.NextFunction) => {
  if (req.path.startsWith("/api/")) {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`Request body:`, req.body);
    }
  }
  next();
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Email Breach Detection API is running",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Email Breach Detection API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      breachCheck: "/api/breach/check",
      breachAnalytics: "/api/breach/analytics/:email",
    },
  });
});

// API Routes
app.use("/api/breach", breachRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/notification-settings", notificationSettingsRoutes);
app.use("/api/monthly-summary", monthlySummaryRoutes);
app.use("/api/news", newsRoutes);

// 404 handler
app.use("*", (req: Request, res: Response) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
    availableEndpoints: {
      health: "GET /health",
      breachCheck: "POST /api/breach/check",
      breachAnalytics: "GET /api/breach/analytics/:email",
    },
  });
});

// Error handling middleware
app.use(
  (err: Error, req: Request, res: Response, next: express.NextFunction) => {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Initialize monthly summary scheduler
    initializeMonthlySummaryScheduler();

    // Start Express server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/health`);
      console.log(
        `Breach Check API: http://localhost:${PORT}/api/breach/check/:email`
      );
      console.log(`Email Management API: http://localhost:${PORT}/api/emails`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
