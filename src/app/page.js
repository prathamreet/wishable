'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [searchError, setSearchError] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            setSearchError('Please enter a username');
            return;
        }
        
        setIsSearching(true);
        setSearchError('');
        
        // Add retry capability for the search
        let retries = 2;
        let success = false;
        
        while (retries >= 0 && !success) {
            try {
                // Set a timeout to avoid hanging forever
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const res = await fetch(
                    `/api/users/search?username=${encodeURIComponent(username.trim())}`,
                    { signal: controller.signal }
                );
                clearTimeout(timeoutId);
                
                // Handle text responses (non-JSON errors)
                const contentType = res.headers.get('content-type');
                let data;
                
                if (contentType && contentType.includes('application/json')) {
                    data = await res.json();
                } else {
                    // Handle non-JSON response
                    const text = await res.text();
                    console.error('Non-JSON response:', text);
                    throw new Error('Received non-JSON response from server');
                }
                
                if (!res.ok) {
                    if (res.status === 404) {
                        setSearchError(`User "${username.trim()}" not found.`);
                    } else {
                        setSearchError(data.error || 'An error occurred while searching');
                    }
                    setIsSearching(false);
                    return;
                }
                
                // Success - navigate to the user's profile page
                success = true;
                router.push(`/profile/${data.user.slug}`);
            } catch (error) {
                console.error('Search error:', error);
                retries--;
                
                // If we have retries left, wait a bit and try again
                if (retries >= 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    console.log(`Retrying search... (${retries} attempts left)`);
                } else {
                    // We're out of retries
                    if (error.name === 'AbortError') {
                        setSearchError('Search request timed out. Please try again.');
                    } else if (error.message.includes('JSON')) {
                        setSearchError('Error processing server response. Please try again later.');
                    } else {
                        setSearchError('Failed to search for user. Please try again.');
                    }
                    setIsSearching(false);
                }
            }
        }
        
        if (!success) {
            setIsSearching(false);
        }
    };
    
    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="hero-gradient text-white py-20">
                <div className="hero-pattern w-full h-full absolute inset-0 opacity-10"></div>
                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-slide-up">
                            <h1 className="text-5xl font-bold mb-4">Track Your Wishlist Across All Stores</h1>
                            <p className="text-xl mb-8 text-indigo-100">
                                Create, manage and share your wishlists from any e-commerce site in one place. Get notified when prices drop!
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {user ? (
                                    <>
                                        <Link href="/dashboard" className="bg-white text-indigo-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors">
                                            Go to Dashboard
                                        </Link>
                                        <Link href="/profile" className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                                            View My Profile
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/signup" className="bg-white text-indigo-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors">
                                            Get Started for Free
                                        </Link>
                                        <Link href="/login" className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                                            Log In
                                        </Link>
                                    </>
                                )}
                            </div>
                            
                            {/* User Search Section */}
                            <div className="mt-8 bg-indigo-800/50 p-4 rounded-lg backdrop-blur-sm">
                                <h3 className="text-lg font-medium mb-2">Find a User</h3>
                                <form onSubmit={handleSearch} className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <input 
                                            type="text" 
                                            value={username}
                                            onChange={(e) => {
                                                setUsername(e.target.value);
                                                setSearchError('');
                                            }}
                                            placeholder="Enter username" 
                                            className="w-full px-4 py-2 rounded-lg text-gray-800 border-2 border-transparent focus:border-indigo-500 focus:outline-none"
                                            aria-label="Search for a user by username"
                                            disabled={isSearching}
                                        />
                                        {searchError && (
                                            <p className="text-red-300 text-sm mt-1">{searchError}</p>
                                        )}
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-indigo-400"
                                        disabled={isSearching}
                                    >
                                        {isSearching ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Searching...
                                            </span>
                                        ) : 'Search'}
                                    </button>
                                </form>
                                <p className="text-xs text-indigo-200 mt-2">
                                    Search for users by their username to see their wishlist
                                </p>
                            </div>
                        </div>
                        <div className="relative h-96 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-500 rounded-lg opacity-20 blur-xl"></div>
                            <div className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl max-w-sm w-full">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-800 dark:text-white">My Wishlist</h3>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">4 items</span>
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="p-2 border border-gray-100 dark:border-gray-700 rounded flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                <div>
                                                    <div className="w-24 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                                    <div className="w-16 h-3 bg-indigo-200 dark:bg-indigo-900 rounded mt-1"></div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="w-16 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                                <div className="w-12 h-3 bg-green-200 dark:bg-green-900 rounded mt-1"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded transition-colors text-sm dark:bg-indigo-900/50 dark:hover:bg-indigo-900 dark:text-indigo-300">
                                    View All Items
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-amber-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Choose WishAble?</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            WishAble helps you organize your shopping list across all your favorite stores. Save time, money, and never miss a sale again.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="card p-6">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Price Tracking</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Monitor price changes across multiple e-commerce sites and get notified when prices drop.
                            </p>
                        </div>
                        
                        <div className="card p-6">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Universal Support</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Add items from any online store including Amazon, Flipkart, Myntra, and many more.
                            </p>
                        </div>
                        
                        <div className="card p-6">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Shareable Lists</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Create and share your wishlists with friends and family for birthday ideas, holiday shopping, and more.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        {user ? 'Ready to Track More Items?' : 'Ready to Start Tracking?'}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                        {user 
                            ? 'Add more items to your wishlist and keep track of prices across all your favorite stores.'
                            : 'Join thousands of users who are saving money and time by using WishAble to track their favorite products.'
                        }
                    </p>
                    {user ? (
                        <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link href="/signup" className="btn-primary text-lg px-8 py-3">
                            Create Your Free Account
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}
