'use client';
import { useState, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';
import { SITE_CATEGORIES } from '../scraper/siteCategories';

function ProfileWishlistItem({ item, isFirst }) {
  const [imageError, setImageError] = useState(false);
  
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

  return (
    <li className="border border-neutral-200 hover:border-neutral-900 transition-all duration-200">
      <div className="flex flex-col h-full">
        {/* Image Section */}
        <div className="relative h-48 bg-neutral-50 overflow-hidden border-b border-neutral-200">
          <OptimizedImage
            src={item.thumbnail}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
            onError={() => setImageError(true)}
            priority={isFirst}
          />
          
          {/* Site Badge */}
          <div className="absolute top-3 left-3 bg-white border border-neutral-900 px-2 py-1 text-xs font-medium">
            {item.site.replace(/\..+$/, '')}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow space-y-3">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {item.name}
          </h3>

          {/* Price and Actions */}
          <div className="mt-auto space-y-3">
            <div className="border-t border-neutral-200 pt-3">
              <div className="text-2xl font-semibold tracking-tight">
                {formatPrice(item.price)}
              </div>
            </div>
            
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-neutral-900 hover:bg-neutral-950 hover:text-white px-3 py-2 transition-colors text-xs font-medium flex items-center justify-center gap-2"
            >
              <span>View Product</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
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

  const items = initialUser.wishlist || [];
  
  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
    return a.name.localeCompare(b.name);
  });
  
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
      <div className="border border-neutral-200 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
          {/* Profile Picture */}
          <div className="relative h-24 w-24 overflow-hidden bg-neutral-950 flex-shrink-0 border border-neutral-900">
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
            <h1 className="text-3xl font-semibold tracking-tight">
              {initialUser.displayName || initialUser.username}
            </h1>
            <p className="text-neutral-600 text-lg">@{initialUser.username}</p>
            
            {/* Contact Information Toggle */}
            {initialUser.contactDetails?.phone || initialUser.contactDetails?.alternateEmail || initialUser.address?.city ? (
              <div className="mt-4">
                {!showContact ? (
                  <button 
                    onClick={() => setShowContact(true)}
                    className="btn-secondary text-sm"
                  >
                    Show Contact Information
                  </button>
                ) : (
                  <div className="border border-neutral-200 p-4 space-y-3">
                    {initialUser.contactDetails?.phone && (
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-sm font-medium">{initialUser.contactDetails.phone}</span>
                      </div>
                    )}
                    
                    {initialUser.contactDetails?.alternateEmail && (
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">{initialUser.contactDetails.alternateEmail}</span>
                      </div>
                    )}
                    
                    {(initialUser.address?.street || initialUser.address?.city) && (
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-medium">{formatAddress()}</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setShowContact(false)}
                      className="btn-outline text-sm"
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
        <div className="pt-6 border-t border-neutral-200">
          <div className="flex flex-wrap items-center gap-4 text-neutral-600 text-sm">
            <div>{items.length} items in wishlist</div>
            <span>•</span>
            <div>Joined {new Date(initialUser.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Filter & Sort Wishlist</h2>
        
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
                setFilterSite('');
              }}
              className="form-input"
            >
              <option value="">All Categories</option>
              {Object.keys(SITE_CATEGORIES).map(category => (
                <option key={category} value={category}>{category}</option>
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
              <option value="">All Sites</option>
              {filterCategory && Object.entries(SITE_CATEGORIES[filterCategory]).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Wishlist Content */}
      <div className="border border-neutral-200 p-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            {items.length === 0 ? (
              <div className="space-y-2">
                <p className="text-xl font-medium">This user hasn{"'"}t added any items yet</p>
                <p className="text-sm text-neutral-600">Check back later to see their wishlist!</p>
              </div>
            ) : (
              <p className="text-neutral-600">No items match your current filters</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <p className="text-sm text-neutral-600">
                Showing {filteredItems.length} of {items.length} items
              </p>
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
