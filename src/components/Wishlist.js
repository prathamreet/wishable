'use client';
import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import WishlistItem from './WishlistItem';
import WishlistForm from './WishlistForm';

// Site categories for better organization
export const SITE_CATEGORIES = {
  'Popular Marketplaces': {
    amazon: 'Amazon',
    flipkart: 'Flipkart',
    snapdeal: 'Snapdeal'
  },
  'Fashion & Beauty': {
    myntra: 'Myntra',
    ajio: 'Ajio',
    nykaa: 'Nykaa'
  },
  'Electronics & Tech': {
    croma: 'Croma',
    reliancedigital: 'Reliance Digital',
    apple: 'Apple Store',
    samsung: 'Samsung',
    dell: 'Dell',
    hp: 'HP',
    lenovo: 'Lenovo'
  },
  'Gaming': {
    gamestheshop: 'Games The Shop',
    epicgames: 'Epic Games',
    steam: 'Steam'
  }
};

export default function Wishlist() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterSite, setFilterSite] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      if (!user || !user.token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/wishlist', {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Cache-Control': 'no-store'
        }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          setError('Session expired. Please log in again.');
          return;
        }
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch wishlist');
      }
      
      const data = await res.json();
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err.message || 'Failed to load wishlist');
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
        throw new Error('Authentication required');
      }
      
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}` 
        },
        body: JSON.stringify({ url }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add item');
      }
      
      const data = await res.json();
      setItems(prev => [...prev, data.item]);
      setError(null);
      
      return { success: true };
    } catch (err) {
      console.error('Error adding item:', err);
      return { 
        success: false, 
        error: err.message || 'Failed to add item' 
      };
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }
      
      const res = await fetch(`/api/wishlist/${id}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${user.token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete item');
      }
      
      setItems(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err.message);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWishlist();
  };

  // Get unique categories from items
  const uniqueCategories = [...new Set(items.map(item => {
    for (const [category, sites] of Object.entries(SITE_CATEGORIES)) {
      if (Object.keys(sites).some(site => item.site.includes(site))) {
        return category;
      }
    }
    return 'Other';
  }))];

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'date') return new Date(b.scrapedAt) - new Date(a.scrapedAt);
    return a.name.localeCompare(b.name);
  });
  
  const filteredItems = sortedItems.filter(item => {
    if (filterCategory && filterSite) {
      const categoryMatch = Object.entries(SITE_CATEGORIES).some(([category, sites]) => 
        category === filterCategory && Object.keys(sites).some(site => item.site.includes(site))
      );
      const siteMatch = item.site.includes(filterSite);
      return categoryMatch && siteMatch;
    }
    if (filterCategory) {
      return Object.entries(SITE_CATEGORIES).some(([category, sites]) => 
        category === filterCategory && Object.keys(sites).some(site => item.site.includes(site))
      );
    }
    if (filterSite) {
      return item.site.includes(filterSite);
    }
    return true;
  });

  return (
    <div>
      <WishlistForm onAdd={handleAdd} isLoading={isAdding} />
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="date">Sort by Date Added</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setFilterSite(''); // Reset site filter when category changes
            }}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="" key="all-categories">All Categories</option>
            {Object.keys(SITE_CATEGORIES).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
            disabled={!filterCategory}
          >
            <option value="" key="all-sites">All Sites</option>
            {filterCategory && Object.entries(SITE_CATEGORIES[filterCategory]).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 border rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white transition disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
            {error}
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading your wishlist...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          {items.length === 0 ? (
            <>
              <p className="text-xl mb-2">Your wishlist is empty</p>
              <p className="text-sm">Add items from your favorite stores using the form above</p>
            </>
          ) : (
            <p>No items match your current filters</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Showing {filteredItems.length} of {items.length} items
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <WishlistItem key={item._id} item={item} onDelete={handleDelete} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}