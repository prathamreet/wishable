'use client';
import { useState } from 'react';
import Image from 'next/image';
import { SITE_CATEGORIES } from '../lib/siteCategories';

function ProfileWishlistItem({ item, isFirst }) {
  const [imageError, setImageError] = useState(false);
  
  function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  }

  function getSiteIcon(site) {
    // Marketplaces
    if (site.includes('amazon')) return '🛒';
    if (site.includes('flipkart')) return '🛍️';
    if (site.includes('snapdeal')) return '🏪';
    if (site.includes('walmart')) return '🛒';
    if (site.includes('target')) return '🎯';
    if (site.includes('bestbuy')) return '🔌';
    if (site.includes('ebay')) return '📦';
    if (site.includes('newegg')) return '💻';
    
    // Fashion
    if (site.includes('myntra')) return '👕';
    if (site.includes('ajio')) return '👔';
    if (site.includes('nykaa')) return '💄';
    if (site.includes('zara')) return '👗';
    if (site.includes('asos')) return '👚';
    if (site.includes('hm')) return '👖';
    
    // Electronics
    if (site.includes('croma')) return '📱';
    if (site.includes('reliancedigital')) return '🔌';
    if (site.includes('apple')) return '🍎';
    if (site.includes('samsung')) return '📱';
    if (site.includes('dell')) return '💻';
    if (site.includes('hp')) return '🖥️';
    if (site.includes('lenovo')) return '💻';
    
    // Gaming
    if (site.includes('steam')) return '🎮';
    if (site.includes('epic')) return '🎮';
    if (site.includes('gog')) return '🎮';
    if (site.includes('nintendo')) return '🎮';
    if (site.includes('playstation')) return '🎮';
    if (site.includes('xbox')) return '🎮';
    if (site.includes('humble')) return '🎮';
    if (site.includes('greenmangaming')) return '🎮';
    if (site.includes('fanatical')) return '🎮';
    if (site.includes('cdkeys')) return '🎮';
    if (site.includes('gamersgate')) return '🎮';
    if (site.includes('gamestheshop')) return '🎮';
    
    // Default
    return '🌐';
  }

  return (
    <li className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full">
        <div className="relative h-48 bg-gray-100 dark:bg-gray-900">
          {!imageError ? (
            <Image
              src={item.thumbnail}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain"
              onError={() => setImageError(true)}
              priority={isFirst}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span title={item.site}>{getSiteIcon(item.site)}</span>
            <span className="text-sm font-medium truncate">
              {item.site.replace(/\..+$/, '')}
            </span>
          </div>

          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
            {item.name}
          </h3>

          <div className="mt-auto">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatPrice(item.price)}
            </div>
            
            <div className="mt-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View Product
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function ProfileContent({ initialUser }) {
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [showContact, setShowContact] = useState(false);

  // Get items from user's wishlist
  const items = initialUser.wishlist || [];
  
  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
    return a.name.localeCompare(b.name);
  });
  
  // Filter items
  const filteredItems = sortedItems.filter(item => {
    let matchesCategory = true;
    let matchesSite = true;
    
    if (filterCategory) {
      matchesCategory = Object.entries(SITE_CATEGORIES).some(([category, sites]) => 
        category === filterCategory && Object.keys(sites).some(site => item.site.includes(site))
      );
    }
    
    if (filterSite) {
      matchesSite = item.site.includes(filterSite);
    }
    
    return matchesCategory && matchesSite;
  });

  // Format address for display
  const formatAddress = () => {
    const address = initialUser.address || {};
    if (!address.street && !address.city && !address.state) return 'No address provided';

    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);
    
    return parts.join(', ');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
            {initialUser.profilePicture ? (
              <Image 
                src={initialUser.profilePicture} 
                alt={initialUser.username} 
                fill 
                className="object-cover"
                priority={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold">
                {initialUser.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold">
              {initialUser.displayName || initialUser.username}
              <span className="ml-2 text-gray-500 dark:text-gray-400 text-base font-normal">@{initialUser.username}</span>
            </h1>
            
            {initialUser.contactDetails?.phone || initialUser.contactDetails?.alternateEmail || initialUser.address?.city ? (
              <div className="mt-2">
                {!showContact ? (
                  <button 
                    onClick={() => setShowContact(true)}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Show contact information
                  </button>
                ) : (
                  <div className="space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                    {initialUser.contactDetails?.phone && (
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {initialUser.contactDetails.phone}
                      </p>
                    )}
                    
                    {initialUser.contactDetails?.alternateEmail && (
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {initialUser.contactDetails.alternateEmail}
                      </p>
                    )}
                    
                    {(initialUser.address?.street || initialUser.address?.city) && (
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {formatAddress()}
                      </p>
                    )}
                    
                    <button 
                      onClick={() => setShowContact(false)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Hide contact information
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span>{items.length} items in wishlist</span>
          <span className="mx-2">•</span>
          <span>Joined {new Date(initialUser.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      
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
              setFilterSite('');
            }}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Categories</option>
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
            <option value="">All Sites</option>
            {filterCategory && Object.entries(SITE_CATEGORIES[filterCategory]).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          {items.length === 0 ? (
            <p className="text-xl">This user hasn&apos;t added any items to their wishlist yet</p>
          ) : (
            <p>No items match your current filters</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredItems.length} of {items.length} items
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item, index) => (
              <ProfileWishlistItem 
                key={item._id || item.clientId || `item-${index}-${item.url?.slice(0, 20)}`} 
                item={item}
                isFirst={index === 0} 
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 