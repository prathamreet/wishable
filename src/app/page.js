"use client";
import Link from "next/link";
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

    let retries = 2;
    let success = false;

    while (retries >= 0 && !success) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(
          `/api/users/search?username=${encodeURIComponent(username.trim())}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        const contentType = res.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
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

        success = true;
        router.push(`/profile/${data.user.slug}`);
      } catch (error) {
        console.error("Search error:", error);
        retries--;

        if (retries >= 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log(`Retrying search... (${retries} attempts left)`);
        } else {
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6">
              Wishable
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 mb-12 leading-relaxed">
              A universal wishlist for any product from any store. 
              Share what you want, get what you need.
            </p>
            <div className="flex flex-wrap gap-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="btn-primary inline-block"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="btn-secondary inline-block"
                  >
                    View Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="btn-primary inline-block"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/login"
                    className="btn-secondary inline-block"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Find a Wishlist
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              Search for someone{"'"}s wishlist by their username.
            </p>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSearchError("");
                  }}
                  placeholder="Enter username"
                  className="form-input"
                  disabled={isSearching}
                />
                {searchError && (
                  <p className="text-red-600 text-sm mt-2">
                    {searchError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSearching}
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-16">
            How it works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="text-4xl font-semibold mb-4">01</div>
              <h3 className="text-xl font-semibold mb-3">Create account</h3>
              <p className="text-neutral-600">
                Sign up for free and set up your profile.
              </p>
            </div>

            <div>
              <div className="text-4xl font-semibold mb-4">02</div>
              <h3 className="text-xl font-semibold mb-3">Add products</h3>
              <p className="text-neutral-600">
                Paste URLs from any online store to build your list.
              </p>
            </div>

            <div>
              <div className="text-4xl font-semibold mb-4">03</div>
              <h3 className="text-xl font-semibold mb-3">Share</h3>
              <p className="text-neutral-600">
                Share your profile and receive the perfect gifts.
              </p>
            </div>
          </div>

          {!user && (
            <div className="mt-16">
              <Link
                href="/signup"
                className="btn-primary inline-block"
              >
                Start Your Wishlist
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
