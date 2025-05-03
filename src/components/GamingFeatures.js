'use client';
import { useState } from 'react';

export default function GamingFeatures() {
  const [activeTab, setActiveTab] = useState('platforms');
  
  const tabs = {
    platforms: {
      title: 'Supported Platforms',
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: 'Steam', icon: '🎮' },
            { name: 'Epic Games Store', icon: '🎮' },
            { name: 'GOG', icon: '🎮' },
            { name: 'PlayStation Store', icon: '🎮' },
            { name: 'Xbox Store', icon: '🎮' },
            { name: 'Nintendo eShop', icon: '🎮' },
            { name: 'Humble Bundle', icon: '🎮' },
            { name: 'Green Man Gaming', icon: '🎮' },
            { name: 'Fanatical', icon: '🎮' },
            { name: 'CDKeys', icon: '🎮' },
            { name: 'GamersGate', icon: '🎮' },
            { name: 'Games The Shop', icon: '🎮' }
          ].map(platform => (
            <div key={platform.name} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded">
              <span className="text-xl">{platform.icon}</span>
              <span className="text-sm">{platform.name}</span>
            </div>
          ))}
        </div>
      )
    },
    metadata: {
      title: 'Game Metadata',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Our enhanced scraper automatically extracts rich metadata from gaming sites:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'Genre', description: 'RPG, FPS, Strategy, etc.' },
              { name: 'Platform', description: 'PC, PlayStation, Xbox, etc.' },
              { name: 'Publisher', description: 'Who published the game' },
              { name: 'Developer', description: 'Studio that created the game' },
              { name: 'Release Date', description: 'When the game was released' }
            ].map(field => (
              <div key={field.name} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <h4 className="font-medium text-indigo-600 dark:text-indigo-400">{field.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{field.description}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    features: {
      title: 'Special Features',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { 
                name: 'Sale Detection', 
                description: 'Automatically detects and tracks discounted prices on games',
                icon: '💰'
              },
              { 
                name: 'Free Game Detection', 
                description: 'Identifies when games are available for free',
                icon: '🎁'
              },
              { 
                name: 'Game Collections', 
                description: 'Group games by platform, genre, or custom collections',
                icon: '📚'
              },
              { 
                name: 'Release Tracking', 
                description: 'Keep track of upcoming game releases',
                icon: '📅'
              }
            ].map(feature => (
              <div key={feature.name} className="bg-gray-50 dark:bg-gray-700 p-3 rounded flex gap-3">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h4 className="font-medium text-indigo-600 dark:text-indigo-400">{feature.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">🎮</span>
        Enhanced Gaming Support
      </h2>
      
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap -mb-px">
          {Object.entries(tabs).map(([key, tab]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === key
                  ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>
      
      <div className="py-2">
        {tabs[activeTab].content}
      </div>
      
      <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
        <p className="text-sm text-indigo-700 dark:text-indigo-300">
          <span className="font-medium">Pro Tip:</span> Add games from any supported platform by copying the URL from the game&apos;s store page and pasting it into the &quot;Add to Wishlist&quot; form.
        </p>
      </div>
    </div>
  );
}