import { Router } from "express";
import { BreachController } from "../controllers/breachController";

const router = Router();

/**
 * @route   POST /api/breach/check
 * @desc    Check email breach with detailed information
 * @access  Public
 * IMPORTANT: This route must be defined BEFORE the GET /check/:email route
 * to prevent Express from matching POST requests to the parameterized route
 */
router.post("/check", BreachController.checkEmailWithDetails);

/**
 * @route   GET /api/breach/check/:email
 * @desc    Check if an email has been breached
 * @access  Public
 */
router.get("/check/:email", BreachController.checkEmail);

/**
 * @route   GET /api/breach/analytics/:email
 * @desc    Get comprehensive breach analytics for an email
 * @access  Public
 */
router.get("/analytics/:email", BreachController.getAnalytics);

export default router;
