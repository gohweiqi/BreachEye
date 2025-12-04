/**
 * User Routes
 * API routes for user account management
 */

import { Router } from "express";
import {
  getUserAccountData,
  deleteUserAccount,
} from "../controllers/userController";

const router = Router();

// GET /api/user/account - Get user account data
router.get("/account", getUserAccountData);

// DELETE /api/user/account - Delete user account and all data
router.delete("/account", deleteUserAccount);

export default router;

