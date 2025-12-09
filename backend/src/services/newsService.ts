import Parser from "rss-parser";
import axios from "axios";

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  imageUrl?: string;
}

export interface NewsResponse {
  success: boolean;
  news: NewsItem[];
  lastUpdated: string;
}

/**
 * Service for fetching cybersecurity and data breach news from various RSS feeds
 */
export class NewsService {
  private static parser: Parser = new Parser({
    timeout: 10000,
    customFields: {
      item: [
        ["media:content", "mediaContent", { keepArray: true }],
        ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
        ["enclosure", "enclosure", { keepArray: false }],
      ],
    },
  });

  // RSS Feed URLs for cybersecurity and breach news
  private static readonly RSS_FEEDS = [
    {
      url: "https://feeds.feedburner.com/TheHackersNews",
      source: "The Hacker News",
    },
    {
      url: "https://www.bleepingcomputer.com/feed/",
      source: "BleepingComputer",
    },
    {
      url: "https://krebsonsecurity.com/feed/",
      source: "Krebs on Security",
    },
    {
      url: "https://feeds.feedburner.com/darknet",
      source: "Dark Reading",
    },
    {
      url: "https://www.securityweek.com/feed",
      source: "SecurityWeek",
    },
  ];

  /**
   * Fetch news from all RSS feeds
   * @param limit Maximum number of news items to return (default: 20)
   * @returns Array of news items sorted by date (newest first)
   */
  static async fetchLatestNews(limit: number = 20): Promise<NewsResponse> {
    try {
      const allNews: NewsItem[] = [];

      // Fetch news from all feeds in parallel
      const feedPromises = this.RSS_FEEDS.map((feed) =>
        this.fetchNewsFromFeed(feed.url, feed.source).catch((error) => {
          console.error(`Error fetching from ${feed.source}:`, error.message);
          return []; // Return empty array on error to continue with other feeds
        })
      );

      const feedResults = await Promise.all(feedPromises);

      // Flatten all news items into a single array
      feedResults.forEach((news) => {
        allNews.push(...news);
      });

      // Sort by date (newest first)
      allNews.sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime();
        const dateB = new Date(b.pubDate).getTime();
        return dateB - dateA;
      });

      // Remove duplicates based on title similarity
      const uniqueNews = this.removeDuplicates(allNews);

      // Limit the number of results
      const limitedNews = uniqueNews.slice(0, limit);

      return {
        success: true,
        news: limitedNews,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching latest news:", error);
      throw new Error("Failed to fetch latest news");
    }
  }

  /**
   * Fetch news from a single RSS feed
   */
  private static async fetchNewsFromFeed(
    feedUrl: string,
    source: string
  ): Promise<NewsItem[]> {
    try {
      const feed = await this.parser.parseURL(feedUrl);
      const newsItems: NewsItem[] = [];

      if (feed.items && feed.items.length > 0) {
        feed.items.forEach((item) => {
          // Extract image URL from various possible fields
          let imageUrl: string | undefined;
          if (item.enclosure?.url) {
            imageUrl = item.enclosure.url;
          } else if ((item as any).mediaContent?.[0]?.$.url) {
            imageUrl = (item as any).mediaContent[0].$.url;
          } else if ((item as any).mediaThumbnail?.[0]?.$.url) {
            imageUrl = (item as any).mediaThumbnail[0].$.url;
          }

          // Extract image from content if available
          if (!imageUrl && item.content) {
            const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/i);
            if (imgMatch) {
              imageUrl = imgMatch[1];
            }
          }

          // Clean description HTML tags
          const description = this.cleanHtml(item.contentSnippet || item.content || "");

          newsItems.push({
            title: item.title || "No title",
            link: item.link || "",
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            description: description.substring(0, 300), // Limit description length
            source: source,
            imageUrl: imageUrl,
          });
        });
      }

      return newsItems;
    } catch (error) {
      console.error(`Error parsing feed ${feedUrl}:`, error);
      return [];
    }
  }

  /**
   * Remove duplicate news items based on title similarity
   */
  private static removeDuplicates(news: NewsItem[]): NewsItem[] {
    const seen = new Set<string>();
    const unique: NewsItem[] = [];

    for (const item of news) {
      // Normalize title for comparison (lowercase, remove special chars)
      const normalizedTitle = item.title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim();

      // Check if we've seen a similar title (exact match or very similar)
      if (!seen.has(normalizedTitle)) {
        seen.add(normalizedTitle);
        unique.push(item);
      }
    }

    return unique;
  }

  /**
   * Clean HTML tags from text
   */
  private static cleanHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Search news by keywords (searches in title and description)
   */
  static async searchNews(
    keywords: string,
    limit: number = 20
  ): Promise<NewsResponse> {
    try {
      const allNews = await this.fetchLatestNews(100); // Fetch more for search

      const searchTerms = keywords.toLowerCase().split(/\s+/);
      const filteredNews = allNews.news.filter((item) => {
        const searchableText = `${item.title} ${item.description}`.toLowerCase();
        return searchTerms.some((term) => searchableText.includes(term));
      });

      return {
        success: true,
        news: filteredNews.slice(0, limit),
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error searching news:", error);
      throw new Error("Failed to search news");
    }
  }
}

