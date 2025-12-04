import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import breachRoutes from "./routes/breachRoutes";
import emailRoutes from "./routes/emailRoutes";
import { connectDatabase } from "./config/database";

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - must be before other middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
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

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/health`);
      console.log(
        `🔍 Breach Check API: http://localhost:${PORT}/api/breach/check/:email`
      );
      console.log(
        `📧 Email Management API: http://localhost:${PORT}/api/emails`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
