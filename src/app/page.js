"use client";
import Link from "next/link";
import Image from "next/image";
import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setSearchError("Please enter a username");
      return;
    }

    setIsSearching(true);
    setSearchError("");

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
        const contentType = res.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          // Handle non-JSON response
          const text = await res.text();
          console.error("Non-JSON response:", text);
          throw new Error("Received non-JSON response from server");
        }

        if (!res.ok) {
          if (res.status === 404) {
            setSearchError(`User "${username.trim()}" not found.`);
          } else {
            setSearchError(data.error || "An error occurred while searching");
          }
          setIsSearching(false);
          return;
        }

        // Success - navigate to the user's profile page
        success = true;
        router.push(`/profile/${data.user.slug}`);
      } catch (error) {
        console.error("Search error:", error);
        retries--;

        // If we have retries left, wait a bit and try again
        if (retries >= 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log(`Retrying search... (${retries} attempts left)`);
        } else {
          // We're out of retries
          if (error.name === "AbortError") {
            setSearchError("Search request timed out. Please try again.");
          } else if (error.message.includes("JSON")) {
            setSearchError(
              "Error processing server response. Please try again later."
            );
          } else {
            setSearchError("Failed to search for user. Please try again.");
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
      {/* Section 1: Hero Section */}
      <section className="hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 text-white py-16 sm:py-20 relative">
        <div className="hero-pattern w-full h-full absolute inset-0 opacity-10 dark:opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              {/* Brand Header */}
              <div className="space-y-10">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-white/20 dark:from-gray-300/20 to-transparent"></div>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 dark:from-gray-100 dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
                  Wishable
                </h1>

                <div className="text-gapes-4">
                  <div className="text-lg sm:text-xl text-indigo-100 dark:text-gray-300 leading-relaxed">
                    Create one comprehensive wishlist from any store across the
                    internet and share it effortlessly with friends and family.
                    <div className="text-white dark:text-gray-100 font-semibold my-2">
                      No more guessing games or unwanted surprises - just the
                      perfect gifts that truly matter
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="space-y-10">
                <div className="flex flex-col my-2 sm:flex-row flex-wrap gap-5 sm:gap-4">
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="group bg-white dark:bg-gray-100 text-indigo-700 dark:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-gray-200 px-6 py-4 rounded-xl font-medium transition-all duration-300 text-center transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                      >
                        <span className="text-lg">📝</span>
                        <span>Go to Your Wishlist</span>
                        <svg
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                      <Link
                        href="/profile"
                        className="group bg-white/20 dark:bg-gray-800/50 hover:bg-white/30 dark:hover:bg-gray-700/50 backdrop-blur-sm text-white dark:text-gray-200 px-6 py-4 rounded-xl font-medium transition-all duration-300 text-center transform hover:scale-105 border border-white/20 dark:border-gray-600/30 flex items-center justify-center gap-2"
                      >
                        <span className="text-lg">👤</span>
                        <span>View Your Profile</span>
                        <svg
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/signup"
                        className="group bg-white dark:bg-gray-100 text-indigo-700 dark:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-gray-200 px-6 py-4 rounded-xl font-medium transition-all duration-300 text-center transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                      >
                        <span className="text-lg">✨</span>
                        <span>Create Your Wishlist</span>
                        <svg
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                      <Link
                        href="/login"
                        className="group bg-white/20 dark:bg-gray-800/50 hover:bg-white/30 dark:hover:bg-gray-700/50 backdrop-blur-sm text-white dark:text-gray-200 px-6 py-4 rounded-xl font-medium transition-all duration-300 text-center transform hover:scale-105 border border-white/20 dark:border-gray-600/30 flex items-center justify-center gap-2"
                      >
                        <span className="text-lg">🔑</span>
                        <span>Log In</span>
                        <svg
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Keep Jane's Birthday Card As Is */}
            <div className="relative h-75 sm:h-80 lg:h-100 flex items-center justify-center mt-10 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-400/10 rounded-lg blur-xl"></div>
              <div className="relative bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-4 sm:p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 hover:bg-white/15 dark:hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white dark:text-gray-200 text-sm sm:text-base">
                    Jane{"'"}s Birthday Wishlist
                  </h3>
                  <span className="bg-green-400/20 dark:bg-green-500/20 text-green-200 dark:text-green-300 text-xs px-2 py-1 rounded backdrop-blur-sm border border-green-400/30 dark:border-green-500/30">
                    Shareable
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: "🎁", name: "A Cool Gadget", store: "Amazon" },
                    { icon: "🎮", name: "New Video Game", store: "Steam" },
                    {
                      icon: "📚",
                      name: "Bestselling Book",
                      store: "Bookstore",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="p-2 border border-white/10 dark:border-gray-600/20 rounded flex items-center justify-between bg-white/5 dark:bg-gray-700/30 backdrop-blur-sm hover:bg-white/10 dark:hover:bg-gray-600/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 dark:bg-gray-600/50 backdrop-blur-sm rounded flex items-center justify-center text-sm sm:text-xl border border-white/20 dark:border-gray-500/30">
                          {item.icon}
                        </div>
                        <div>
                          <div className="w-20 sm:w-24 h-2 sm:h-3 bg-white/30 dark:bg-gray-400/50 rounded animate-pulse"></div>
                          <div className="w-12 sm:w-16 h-2 sm:h-3 bg-indigo-300/50 dark:bg-indigo-400/50 rounded mt-1 animate-pulse delay-75"></div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="w-12 sm:w-16 h-2 sm:h-3 bg-white/30 dark:bg-gray-400/50 rounded animate-pulse delay-150"></div>
                        <div className="w-8 sm:w-12 h-2 sm:h-3 bg-green-300/50 dark:bg-green-400/50 rounded mt-1 animate-pulse delay-300"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 bg-white/10 dark:bg-gray-600/30 hover:bg-white/20 dark:hover:bg-gray-500/40 backdrop-blur-sm text-white dark:text-gray-200 rounded transition-all duration-300 text-xs sm:text-sm border border-white/20 dark:border-gray-500/30 transform hover:scale-105">
                  View Full Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Find Friend's Wishlist */}
      <section className="hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 text-white py-12 sm:py-16 relative">
        <div className="hero-pattern w-full h-full absolute inset-0 opacity-5 dark:opacity-3"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative text-center">
          <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-6 sm:p-8 rounded-xl shadow-xl">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white dark:text-gray-100">
              Find a Friend{"'"}s Wishlist
            </h3>
            <p className="text-indigo-100 dark:text-gray-300 mb-6 text-sm sm:text-base">
              Know someone with a Wishable account? Search for their wishlist
              and discover what they{"'"}re hoping for!
            </p>
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg mx-auto"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSearchError("");
                  }}
                  placeholder="Enter username to find a wishlist"
                  className="w-full px-4 py-3 rounded-lg text-gray-800 dark:text-gray-200 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-transparent focus:border-white dark:focus:border-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-700 text-sm sm:text-base transition-all duration-300"
                  aria-label="Search for a user's wishlist by username"
                  disabled={isSearching}
                />
                {searchError && (
                  <p className="text-red-200 dark:text-red-400 text-sm mt-2 text-left">
                    {searchError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="bg-white dark:bg-gray-100 text-indigo-700 dark:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-gray-200 px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:bg-white/70 dark:disabled:bg-gray-400/70 disabled:text-indigo-500 dark:disabled:text-gray-600 text-sm sm:text-base transform hover:scale-105 shadow-lg"
                disabled={isSearching}
              >
                {isSearching ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-700 dark:text-indigo-800"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Section 3: Simple Steps */}
      <section className="hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 text-white py-12 sm:py-16 relative">
        <div className="hero-pattern w-full h-full absolute inset-0 opacity-5 dark:opacity-3"></div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-white dark:text-gray-100">
              How It Works
            </h2>
            <p className="text-indigo-100 dark:text-gray-300 text-sm sm:text-base">
              Get started in just three simple steps
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-center gap-4 sm:gap-6 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-4 sm:p-6 rounded-xl hover:bg-white/15 dark:hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-500/80 to-purple-600/80 dark:from-indigo-400/60 dark:to-purple-500/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 dark:border-gray-500/30">
                  <span className="text-lg sm:text-xl font-bold text-white dark:text-gray-200">
                    1
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-white dark:text-gray-200">
                  Create Account
                </h3>
                <p className="text-indigo-100 dark:text-gray-300 text-sm sm:text-base">
                  Sign up for free and set up your personalized wishlist profile
                </p>
              </div>
              <div className="text-2xl sm:text-3xl">👤</div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-4 sm:gap-6 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-4 sm:p-6 rounded-xl hover:bg-white/15 dark:hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500/80 to-pink-600/80 dark:from-purple-400/60 dark:to-pink-500/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 dark:border-gray-500/30">
                  <span className="text-lg sm:text-xl font-bold text-white dark:text-gray-200">
                    2
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-white dark:text-gray-200">
                  Add Products
                </h3>
                <p className="text-indigo-100 dark:text-gray-300 text-sm sm:text-base">
                  Paste product URLs from any online store to build your
                  wishlist
                </p>
              </div>
              <div className="text-2xl sm:text-3xl">🔗</div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-4 sm:gap-6 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-4 sm:p-6 rounded-xl hover:bg-white/15 dark:hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500/80 to-red-600/80 dark:from-pink-400/60 dark:to-red-500/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 dark:border-gray-500/30">
                  <span className="text-lg sm:text-xl font-bold text-white dark:text-gray-200">
                    3
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-white dark:text-gray-200">
                  Share & Receive
                </h3>
                <p className="text-indigo-100 dark:text-gray-300 text-sm sm:text-base">
                  Share your profile with friends and get the perfect gifts
                </p>
              </div>
              <div className="text-2xl sm:text-3xl">🎁</div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-8 sm:mt-12">
            {!user && (
              <Link
                href="/signup"
                className="inline-flex items-center bg-white dark:bg-gray-100 text-indigo-700 dark:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-gray-200 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base transform hover:scale-105"
              >
                Start Your Wishlist Today
                <svg
                  className="ml-2 w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
