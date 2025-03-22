'use client';
import { useState } from 'react';

export default function WishlistForm({ onAdd, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a product URL');
      return;
    }
    
    try {
      // Validate URL format
      new URL(url); // Will throw if invalid
      setError('');
      await onAdd(url);
      setUrl('');
    } catch (err) {
      setError('Please enter a valid URL');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <h2 className="text-xl font-semibold mb-3">Add New Item</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-grow">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter product URL (Amazon, Flipkart, Myntra)"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Adding...' : 'Add to Wishlist'}
        </button>
      </div>
    </form>
  );
}