'use client';
import { useState } from 'react';
import { SITE_CATEGORIES } from '../lib/siteCategories';

export default function SupportedSites() {
  const [activeCategory, setActiveCategory] = useState('Gaming');
  
  // Count total sites
  const totalSites = Object.values(SITE_CATEGORIES).reduce(
    (total, sites) => total + Object.keys(sites).length, 
    0
  );
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Supported Sites</h2>
        <span className="text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">
          {totalSites}+ sites
        </span>
      </div>
      
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {Object.keys(SITE_CATEGORIES).map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                activeCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {Object.entries(SITE_CATEGORIES[activeCategory] || {}).map(([key, name]) => (
          <div 
            key={key}
            className="bg-gray-50 dark:bg-gray-700 p-2 rounded flex items-center gap-2"
          >
            <div className="w-6 h-6 flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
              <img 
                src={`https://www.google.com/s2/favicons?domain=${key}.com&sz=64`} 
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z'/%3E%3C/svg%3E";
                }}
              />
            </div>
            <span className="text-sm truncate">{name}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add items from any of these sites using the URL of the product page.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Many other sites are also supported automatically.
        </p>
      </div>
    </div>
  );
}