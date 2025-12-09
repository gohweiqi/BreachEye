/**
 * Notification Routes
 * API routes for notification management
 */

import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
} from "../controllers/notificationController";

const router = Router();

// GET /api/notifications - Get all notifications for user
router.get("/", getNotifications);

// POST /api/notifications - Create a new notification
router.post("/", createNotification);

// PUT /api/notifications/:id/read - Mark a notification as read
router.put("/:id/read", markAsRead);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put("/read-all", markAllAsRead);

export default router;
