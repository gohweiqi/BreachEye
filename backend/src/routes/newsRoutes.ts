import { Router } from "express";
import { NewsController } from "../controllers/newsController";

const router = Router();

/**
 * @route   GET /api/news/latest
 * @desc    Get latest cybersecurity and breach news
 * @access  Public
 * @query   limit (optional): Number of news items to return (default: 20, max: 100)
 */
router.get("/latest", NewsController.getLatestNews);

/**
 * @route   GET /api/news/search
 * @desc    Search news by keywords
 * @access  Public
 * @query   q (required): Search query
 * @query   limit (optional): Number of news items to return (default: 20, max: 100)
 */
router.get("/search", NewsController.searchNews);

export default router;

