"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CircleChevronLeft,
  Search,
  ExternalLink,
  RefreshCw,
  Calendar,
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import { getLatestNews, searchNews, NewsItem } from "../../lib/api/newsApi";

export default function NewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchNews = async (query?: string) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (query && query.trim()) {
        setIsSearching(true);
        response = await searchNews(query.trim(), 30);
      } else {
        setIsSearching(false);
        response = await getLatestNews(30);
      }

      setNews(response.news);
      setLastUpdated(response.lastUpdated);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch news. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews(searchQuery);
  };

  const handleRefresh = () => {
    fetchNews(searchQuery || undefined);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-gray-200">
      <div className="w-full max-w-6xl mx-auto px-6 py-12">
        <Navbar />

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mt-6 mb-4 flex items-center gap-2 text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 group"
          aria-label="Go back to previous page"
        >
          <CircleChevronLeft className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="mt-8 mb-12">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-xs tracking-[0.25em] text-[#bfa76f] uppercase mb-4">
              Stay Informed
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#E5C97E] to-[#D4AF37] bg-clip-text text-transparent">
                Latest Cybersecurity News
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Stay up-to-date with the latest data breaches, security
              vulnerabilities, and cybersecurity news from trusted sources.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for breach news, vulnerabilities, or security topics..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#0b0b0b] border border-[#D4AF37]/30 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-[#B99332] hover:bg-[#D4AF37] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search className="h-5 w-5" />
                Search
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-3 rounded-lg border border-[#D4AF37]/30 hover:border-[#D4AF37] text-gray-300 hover:text-[#D4AF37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Refresh news"
              >
                <RefreshCw
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </form>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  fetchNews();
                }}
                className="mt-2 text-sm text-[#D4AF37] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="mb-6 text-sm text-gray-400 text-center">
              Last updated: {formatDate(lastUpdated)}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-[#D4AF37] mx-auto mb-4" />
              <p className="text-gray-400">Loading latest news...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center mb-8">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 rounded-lg bg-[#B99332] hover:bg-[#D4AF37] text-white transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* News List */}
          {!loading && !error && (
            <>
              {isSearching && (
                <div className="mb-6 text-center">
                  <p className="text-gray-400">
                    Found {news.length} result{news.length !== 1 ? "s" : ""} for
                    "{searchQuery}"
                  </p>
                </div>
              )}

              {news.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg mb-4">No news found</p>
                  {isSearching && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        fetchNews();
                      }}
                      className="text-[#D4AF37] hover:underline"
                    >
                      View all news
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6">
                  {news.map((item, index) => (
                    <NewsCard key={index} item={item} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24)
        return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7)
        return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-[#D4AF37]/20 bg-gradient-to-b from-[#0b0b0b] to-[#000000] p-6 hover:border-[#D4AF37]/40 transition-all duration-200 hover:shadow-lg hover:shadow-[#D4AF37]/10 group"
    >
      <div className="flex gap-4">
        {/* Image */}
        {item.imageUrl && (
          <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden border border-[#D4AF37]/20">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Source and Date */}
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="px-2 py-1 rounded text-xs font-medium bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
              {item.source}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(item.pubDate)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-[#f5d77f] mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
            {item.description}
          </p>

          {/* Read More Link */}
          <div className="flex items-center gap-2 text-[#D4AF37] text-sm font-medium group-hover:gap-3 transition-all">
            <span>Read more</span>
            <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </a>
  );
}
