import { Request, Response } from "express";
import { NewsService } from "../services/newsService";

/**
 * Controller for handling news-related requests
 */
export class NewsController {
  /**
   * Get latest cybersecurity and breach news
   * GET /api/news/latest
   * Query params: limit (optional, default: 20)
   */
  static async getLatestNews(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      
      // Validate limit
      if (limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: "Limit must be between 1 and 100",
        });
        return;
      }

      const newsData = await NewsService.fetchLatestNews(limit);

      res.status(200).json(newsData);
    } catch (error) {
      console.error("Error in getLatestNews:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch latest news",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Search news by keywords
   * GET /api/news/search
   * Query params: q (required), limit (optional, default: 20)
   */
  static async searchNews(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: "Search query (q) is required",
        });
        return;
      }

      // Validate limit
      if (limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: "Limit must be between 1 and 100",
        });
        return;
      }

      const newsData = await NewsService.searchNews(query.trim(), limit);

      res.status(200).json(newsData);
    } catch (error) {
      console.error("Error in searchNews:", error);
      res.status(500).json({
        success: false,
        error: "Failed to search news",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

