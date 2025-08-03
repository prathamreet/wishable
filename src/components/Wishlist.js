"use client";
import { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import WishlistItem from "./WishlistItem";
import WishlistForm from "./WishlistForm";
import logger from "../lib/logger";
import { wishlist as wishlistApi } from "../lib/apiClient";
import { SITE_CATEGORIES } from "../lib/siteCategories";

export default function Wishlist() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [filterSite, setFilterSite] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      if (!user || !user.token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      // Use our simplified wishlistApi.getItems function
      const response = await wishlistApi.getItems();

      // Check if the response has the expected format
      if (response && response.items && Array.isArray(response.items)) {
        setItems(response.items);
      } else if (Array.isArray(response)) {
        // Handle old API format for backward compatibility
        setItems(response);
      } else {
        // If response is not in expected format, set empty array
        console.warn("Unexpected response format from API:", response);
        setItems([]);
      }

      setError(null);
    } catch (err) {
      logger.error("Error fetching wishlist:", err);
      if (err.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError(err.message || "Failed to load wishlist");
      }
      // Set empty array on error
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [fetchWishlist, user]);

  const handleAdd = async (url) => {
    try {
      setIsAdding(true);
      if (!user || !user.token) {
        throw new Error("Authentication required");
      }

      // Use our simplified wishlistApi.addItem function
      const data = await wishlistApi.addItem({ url });

      if (data && data.item) {
        setItems((prev) => [...(Array.isArray(prev) ? prev : []), data.item]);
        setError(null);
        setIsAdding(false);
        return { success: true };
      } else {
        throw new Error("Failed to add item: Invalid response");
      }
    } catch (err) {
      logger.error("Error adding item:", err);

      // Provide more user-friendly error messages for specific error types
      let errorMessage = err.message || "Failed to add item";

      // Check for rate limiting errors
      if (
        err.status === 429 ||
        err.status === 529 ||
        (errorMessage && errorMessage.includes("Rate limited"))
      ) {
        errorMessage =
          "This website is currently blocking our automatic product detection. " +
          "Please try again later or provide manual details.";
      } else if (errorMessage.includes("HTTP 529")) {
        errorMessage =
          "This website is currently blocking our automatic product detection. " +
          "Please try again later or provide manual details.";
      }

      // Make sure we set isAdding back to false
      setIsAdding(false);

      // Create a new error with the improved message
      const enhancedError = new Error(errorMessage);
      // Preserve the original status code if available
      if (err.status) enhancedError.status = err.status;

      // Throw the enhanced error to be caught by the form component
      throw enhancedError;
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!user || !user.token) {
        throw new Error("Authentication required");
      }

      // Use our simplified wishlistApi.deleteItem function
      await wishlistApi.deleteItem(id);

      // Filter out the deleted item by id
      setItems((prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.filter((item) => {
          // Handle both string and ObjectId comparison
          const itemId = item._id || item.clientId;
          return String(itemId) !== String(id);
        });
      });
    } catch (err) {
      logger.error("Error deleting item:", err);
      setError(err.message || "Failed to delete item");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWishlist();
  };

  // Get unique categories from items
  const uniqueCategories =
    items && items.length > 0
      ? [
          ...new Set(
            items.map((item) => {
              if (!item || !item.site) return "Other";

              for (const [category, sites] of Object.entries(SITE_CATEGORIES)) {
                if (
                  Object.keys(sites).some((site) => item.site.includes(site))
                ) {
                  return category;
                }
              }
              return "Other";
            })
          ),
        ]
      : [];

  const sortedItems =
    items && items.length > 0
      ? [...items].sort((a, b) => {
          if (!a || !b) return 0;

          if (sortBy === "price") {
            return (a.price || 0) - (b.price || 0);
          }
          if (sortBy === "date") {
            const dateA = a.scrapedAt ? new Date(a.scrapedAt) : new Date(0);
            const dateB = b.scrapedAt ? new Date(b.scrapedAt) : new Date(0);
            return dateB - dateA;
          }
          return (a.name || "").localeCompare(b.name || "");
        })
      : [];

  const filteredItems = sortedItems.filter((item) => {
    if (filterCategory && filterSite) {
      const categoryMatch = Object.entries(SITE_CATEGORIES).some(
        ([category, sites]) =>
          category === filterCategory &&
          Object.keys(sites).some((site) => item.site.includes(site))
      );
      const siteMatch = item.site.includes(filterSite);
      return categoryMatch && siteMatch;
    }
    if (filterCategory) {
      return Object.entries(SITE_CATEGORIES).some(
        ([category, sites]) =>
          category === filterCategory &&
          Object.keys(sites).some((site) => item.site.includes(site))
      );
    }
    if (filterSite) {
      return item.site.includes(filterSite);
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Add Item Form */}
      <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-6 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400/80 to-blue-500/80 dark:from-green-400/60 dark:to-blue-500/60 rounded-full flex items-center justify-center">
            <span className="text-lg">➕</span>
          </div>
          <h2 className="text-xl font-bold text-white dark:text-gray-200">
            Add New Item
          </h2>
        </div>
        <WishlistForm onAdd={handleAdd} isLoading={isAdding} />
      </div>

      {/* Controls */}
      <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-6 rounded-xl shadow-xl space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400/80 to-pink-500/80 dark:from-purple-400/60 dark:to-pink-500/60 rounded-full flex items-center justify-center">
            <span className="text-lg">🔧</span>
          </div>
          <h2 className="text-xl font-bold text-white dark:text-gray-200">
            Filter & Sort
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col space-y-1">
            <label className="text-sm text-indigo-100 dark:text-gray-300 font-medium">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none transition-all duration-300"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="date">Sort by Date Added</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm text-indigo-100 dark:text-gray-300 font-medium">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSite(""); // Reset site filter when category changes
              }}
              className="px-4 py-2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none transition-all duration-300"
            >
              <option value="" key="all-categories">
                All Categories
              </option>
              {Object.keys(SITE_CATEGORIES).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm text-indigo-100 dark:text-gray-300 font-medium">
              Site
            </label>
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="px-4 py-2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none transition-all duration-300 disabled:opacity-50"
              disabled={!filterCategory}
            >
              <option value="" key="all-sites">
                All Sites
              </option>
              {filterCategory &&
                Object.entries(SITE_CATEGORIES[filterCategory]).map(
                  ([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  )
                )}
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm text-indigo-100 dark:text-gray-300 font-medium invisible">
              Action
            </label>
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="px-4 py-2 bg-white/20 dark:bg-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 border border-white/20 dark:border-gray-600/30 flex items-center gap-2 transform hover:scale-105"
            >
              <span className="text-sm">🔄</span>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-400/20 dark:bg-red-500/20 border border-red-400/30 dark:border-red-500/30 text-red-200 dark:text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="bg-white/5 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-600/20 rounded-xl shadow-xl p-6">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-400/80 to-purple-500/80 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white dark:text-gray-200 text-lg">
              Loading your wishlist...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-400/80 to-gray-500/80 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            {items.length === 0 ? (
              <div className="space-y-2">
                <p
                  className="text-xl text-white dark:text-gray-200 font-medium"
                  key="empty-title"
                >
                  Your wishlist is empty
                </p>
                <p
                  className="text-sm text-indigo-100 dark:text-gray-400"
                  key="empty-subtitle"
                >
                  Add items from your favorite stores using the form above
                </p>
              </div>
            ) : (
              <p className="text-white dark:text-gray-200">
                No items match your current filters
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-indigo-100 dark:text-gray-300">
                Showing {filteredItems.length} of {items.length} items
              </p>
              <div className="flex items-center gap-2 text-indigo-100 dark:text-gray-300">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm">Live data</span>
              </div>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item, index) => (
                <WishlistItem
                  key={
                    item._id ||
                    item.clientId ||
                    `item-${index}-${item.url?.slice(0, 20)}`
                  }
                  item={item}
                  onDelete={handleDelete}
                  isFirst={index === 0}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Compact Supported Sites List */}
      <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 rounded-xl shadow-xl p-4">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400/80 to-orange-500/80 dark:from-yellow-400/60 dark:to-orange-500/60 rounded-full flex items-center justify-center">
              <span className="text-sm">🌐</span>
            </div>
            <h2 className="text-lg font-bold text-white dark:text-gray-200">
              Supported Sites
            </h2>
          </div>
          <p className="text-indigo-100 dark:text-gray-300 text-xs">
            Add items from these popular stores
          </p>
        </div>

        <div className="space-y-3">
          {Object.entries(SITE_CATEGORIES).map(([category, sites]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white dark:text-gray-200 mb-2 flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-400/80 to-purple-500/80 rounded-full"></div>
                {category}
              </h3>
              <div className="text-xs text-indigo-100 dark:text-gray-300 leading-relaxed">
                {Object.entries(sites).map(([key, name], index) => (
                  <span
                    key={key}
                    className="hover:text-white dark:hover:text-gray-100 transition-colors cursor-pointer"
                  >
                    {name}
                    {index < Object.entries(sites).length - 1 && (
                      <span className="text-white/40 mx-1">•</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
