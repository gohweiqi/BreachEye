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

const corsOptions = {
  origin: (origin: string | undefined, callback: cors.CorsCallback) => {
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

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Email Breach Detection API is running",
    timestamp: new Date().toISOString(),
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
  res.status(404).json({
    success: false,
    error: "Route not found",
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
