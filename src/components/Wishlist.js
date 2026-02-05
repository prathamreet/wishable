"use client";
import { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import WishlistItem from "./WishlistItem";
import WishlistForm from "./WishlistForm";
import logger from "../lib/logger";
import { wishlist as wishlistApi } from "../lib/apiClient";
import { SITE_CATEGORIES } from "../scraper/siteCategories";

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

      const response = await wishlistApi.getItems();

      if (response && response.items && Array.isArray(response.items)) {
        setItems(response.items);
      } else if (Array.isArray(response)) {
        setItems(response);
      } else {
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

      let errorMessage = err.message || "Failed to add item";

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

      setIsAdding(false);

      const enhancedError = new Error(errorMessage);
      if (err.status) enhancedError.status = err.status;

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

      await wishlistApi.deleteItem(id);

      setItems((prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.filter((item) => {
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
      <div className="border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold tracking-tight mb-4">
          Add New Item
        </h2>
        <WishlistForm onAdd={handleAdd} isLoading={isAdding} />
      </div>

      {/* Controls */}
      <div className="border border-neutral-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight mb-4">
          Filter & Sort
        </h2>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col space-y-2 flex-1 min-w-40">
            <label className="form-label">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="date">Date Added</option>
            </select>
          </div>

          <div className="flex flex-col space-y-2 flex-1 min-w-40">
            <label className="form-label">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSite("");
              }}
              className="form-input"
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

          <div className="flex flex-col space-y-2 flex-1 min-w-40">
            <label className="form-label">Site</label>
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="form-input disabled:opacity-50"
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

          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="btn-secondary disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="border border-red-600 bg-red-50 text-red-900 px-4 py-3 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="border border-neutral-200 p-6">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">
              Loading your wishlist...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            {items.length === 0 ? (
              <div className="space-y-2">
                <p className="text-xl font-medium">
                  Your wishlist is empty
                </p>
                <p className="text-sm text-neutral-600">
                  Add items from your favorite stores using the form above
                </p>
              </div>
            ) : (
              <p className="text-neutral-600">
                No items match your current filters
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <p className="text-sm text-neutral-600">
                Showing {filteredItems.length} of {items.length} items
              </p>
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

      {/* Supported Sites */}
      <div className="border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold tracking-tight mb-4">
          Supported Sites
        </h2>
        <div className="space-y-4">
          {Object.entries(SITE_CATEGORIES).map(([category, sites]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-2">
                {category}
              </h3>
              <div className="text-xs text-neutral-600 leading-relaxed">
                {Object.entries(sites).map(([key, name], index) => (
                  <span key={key}>
                    {name}
                    {index < Object.entries(sites).length - 1 && (
                      <span className="mx-1">•</span>
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
