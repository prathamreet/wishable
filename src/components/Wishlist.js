'use client';
import { useState, useEffect, useCallback } from 'react';
import WishlistItem from './WishlistItem';
import WishlistForm from './WishlistForm';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterSite, setFilterSite] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          setError('Session expired. Please log in again.');
          return;
        }
        throw new Error('Failed to fetch wishlist');
      }
      
      const data = await res.json();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAdd = async (url) => {
    try {
      setIsAdding(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ url }),
      });
      
      if (!res.ok) throw new Error('Failed to add item');
      
      const data = await res.json();
      setItems(prev => [...prev, data.item]);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/wishlist/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Failed to delete item');
      
      setItems(prev => prev.filter(item => item._id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRefresh = () => {
    fetchWishlist();
  };

  const sortedItems = [...items].sort((a, b) =>
    sortBy === 'price' ? a.price - b.price : a.name.localeCompare(b.name)
  );
  
  const filteredItems = filterSite 
    ? sortedItems.filter(item => item.site === filterSite) 
    : sortedItems;

  return (
    <div>
      <WishlistForm onAdd={handleAdd} isLoading={isAdding} />
      
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
          </select>
          
          <select
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Sites</option>
            <option value="amazon">Amazon</option>
            <option value="flipkart">Flipkart</option>
            <option value="myntra">Myntra</option>
          </select>
        </div>
        
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 border rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white transition"
        >
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-5">{error}</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Your wishlist is empty</div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <WishlistItem key={item._id} item={item} onDelete={handleDelete} />
          ))}
        </ul>
      )}
    </div>
  );
}