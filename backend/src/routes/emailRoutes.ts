/**
 * Email Routes
 * API routes for email management
 */

import { Router } from "express";
import {
  getEmails,
  addEmail,
  deleteEmail,
  checkEmail,
} from "../controllers/emailController";

const router = Router();

// GET /api/emails - Get all monitored emails for user
router.get("/", getEmails);

// POST /api/emails - Add a new monitored email
router.post("/", addEmail);

// DELETE /api/emails/:id - Delete a monitored email
router.delete("/:id", deleteEmail);

// PUT /api/emails/:id/check - Re-check email for breaches
router.put("/:id/check", checkEmail);

export default router;

