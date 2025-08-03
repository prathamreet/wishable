'use client';
import { useState, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';
import { SITE_CATEGORIES } from '../lib/siteCategories';

function ProfileWishlistItem({ item, isFirst }) {
  const [imageError, setImageError] = useState(false);
  
  // Initialize image error state
  useEffect(() => {
    setImageError(!item.thumbnail);
  }, [item.thumbnail]);
  
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
    <li className="relative bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 rounded-xl shadow-xl hover:shadow-2xl hover:bg-white/15 dark:hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-102 overflow-hidden group">
      <div className="flex flex-col h-full">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-700/30 dark:to-gray-800/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10"></div>
          
          <OptimizedImage
            src={item.thumbnail}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
            priority={isFirst}
          />
          
          {/* Site Badge */}
          <div className="absolute top-3 left-3 z-20">
            <div className="bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-lg px-2 py-1 flex items-center gap-1.5">
              <span className="text-sm" title={item.site}>
                {getSiteIcon(item.site)}
              </span>
              <span 
                className="text-xs font-medium text-white dark:text-gray-200"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
              >
                {item.site.replace(/\..+$/, '')}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow space-y-3">
          {/* Product Name */}
          <h3 className="font-semibold text-white dark:text-gray-200 text-sm leading-tight line-clamp-2 group-hover:text-indigo-100 dark:group-hover:text-gray-100 transition-colors duration-300">
            {item.name}
          </h3>

          {/* Price and Actions */}
          <div className="mt-auto space-y-3">
            {/* Price */}
            <div className="bg-white/10 dark:bg-gray-700/30 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg p-2">
              <div className="text-lg font-bold bg-gradient-to-r from-green-300 to-green-400 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent">
                {formatPrice(item.price)}
              </div>
            </div>
            
            {/* View Link */}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link bg-white/20 dark:bg-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 px-3 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-600/30 flex items-center justify-center gap-2 text-sm shadow-lg"
            >
              <span>View Product</span>
              <svg className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"></div>
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
    <div className="p-6 space-y-8">
      {/* Profile Header */}
      <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-6 sm:p-8 rounded-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
          {/* Profile Picture */}
          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500/80 to-purple-600/80 dark:from-indigo-400/60 dark:to-purple-500/60 flex-shrink-0 shadow-xl border-4 border-white/20 dark:border-gray-600/30">
            {initialUser.profilePicture ? (
              <OptimizedImage 
                src={initialUser.profilePicture} 
                alt={initialUser.username} 
                fill 
                className="object-cover"
                priority={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white text-2xl font-bold">
                {initialUser.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 dark:from-gray-100 dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
              {initialUser.displayName || initialUser.username}
            </h1>
            <p className="text-indigo-200 dark:text-gray-400 text-lg">@{initialUser.username}</p>
            
            {/* Contact Information Toggle */}
            {initialUser.contactDetails?.phone || initialUser.contactDetails?.alternateEmail || initialUser.address?.city ? (
              <div className="mt-4">
                {!showContact ? (
                  <button 
                    onClick={() => setShowContact(true)}
                    className="bg-white/20 dark:bg-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-600/30 flex items-center gap-2 text-sm"
                  >
                    <span>📞</span>
                    Show Contact Information
                  </button>
                ) : (
                  <div className="bg-white/10 dark:bg-gray-700/30 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg p-4 space-y-3">
                    {initialUser.contactDetails?.phone && (
                      <div className="flex items-center gap-3 text-indigo-100 dark:text-gray-300">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400/80 to-blue-500/80 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">{initialUser.contactDetails.phone}</span>
                      </div>
                    )}
                    
                    {initialUser.contactDetails?.alternateEmail && (
                      <div className="flex items-center gap-3 text-indigo-100 dark:text-gray-300">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400/80 to-pink-500/80 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">{initialUser.contactDetails.alternateEmail}</span>
                      </div>
                    )}
                    
                    {(initialUser.address?.street || initialUser.address?.city) && (
                      <div className="flex items-center gap-3 text-indigo-100 dark:text-gray-300">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400/80 to-orange-500/80 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">{formatAddress()}</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setShowContact(false)}
                      className="bg-white/20 dark:bg-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 px-3 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-600/30 text-sm"
                    >
                      Hide Contact Information
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
        
        {/* Stats */}
        <div className="pt-6 border-t border-white/20 dark:border-gray-600/30">
          <div className="flex flex-wrap items-center gap-4 text-indigo-100 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="text-sm font-medium">{items.length} items in wishlist</span>
            </div>
            <span className="text-white/40">•</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              <span className="text-sm font-medium">Joined {new Date(initialUser.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-6 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400/80 to-indigo-500/80 dark:from-blue-400/60 dark:to-indigo-500/60 rounded-full flex items-center justify-center">
            <span className="text-lg">🔧</span>
          </div>
          <h2 className="text-xl font-bold text-white dark:text-gray-200">Filter & Sort Wishlist</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col space-y-1">
            <label className="text-sm text-indigo-100 dark:text-gray-300 font-medium">Sort By</label>
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
            <label className="text-sm text-indigo-100 dark:text-gray-300 font-medium">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSite('');
              }}
              className="px-4 py-2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none transition-all duration-300"
            >
              <option value="">All Categories</option>
              {Object.keys(SITE_CATEGORIES).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col space-y-1">
            <label className="text-sm text-indigo-100 dark:text-gray-300 font-medium">Site</label>
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="px-4 py-2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-lg text-gray-800 dark:text-gray-200 focus:border-white dark:focus:border-gray-400 focus:outline-none transition-all duration-300 disabled:opacity-50"
              disabled={!filterCategory}
            >
              <option value="">All Sites</option>
              {filterCategory && Object.entries(SITE_CATEGORIES[filterCategory]).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Wishlist Content */}
      <div className="bg-white/5 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-600/20 rounded-xl shadow-xl p-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-400/80 to-gray-500/80 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            {items.length === 0 ? (
              <div className="space-y-2">
                <p className="text-xl text-white dark:text-gray-200 font-medium">This user hasn{"'"}t added any items yet</p>
                <p className="text-sm text-indigo-100 dark:text-gray-400">Check back later to see their wishlist!</p>
              </div>
            ) : (
              <p className="text-white dark:text-gray-200">No items match your current filters</p>
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
                <span className="text-sm">Live wishlist</span>
              </div>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
