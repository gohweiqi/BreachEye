/**
 * Notification Settings Routes
 * API routes for notification preferences
 */

import { Router } from "express";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "../controllers/notificationSettingsController";

const router = Router();

// GET /api/notification-settings - Get notification settings
router.get("/", getNotificationSettings);

// PUT /api/notification-settings - Update notification settings
router.put("/", updateNotificationSettings);

export default router;
