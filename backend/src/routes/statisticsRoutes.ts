/**
 * Statistics Routes
 * API routes for global breach statistics
 */

import { Router } from "express";
import { StatisticsController } from "../controllers/statisticsController";

const router = Router();

// GET /api/statistics - Get global breach statistics
router.get("/", StatisticsController.getGlobalStatistics);

export default router;

