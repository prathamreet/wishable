"use client";
import { useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthContext } from "../contexts/AuthContext";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import ProfileDropdown from "./ProfileDropdown";
import OptimizedImage from "./OptimizedImage";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if the current path matches the given pattern
  const isActivePath = (path) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  if (!mounted) return null;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/15 dark:bg-gray-800/50 backdrop-blur-md border-b border-white/30 dark:border-gray-600/30 shadow-xl"
          : "bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-b border-white/20 dark:border-gray-600/20"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link
              href="/"
              className="group flex gap-3 items-center transition-all duration-300 transform hover:scale-105"
            >
              <OptimizedImage
                src="/favicons/android-chrome-512x512.png"
                alt="WishAble App Icon"
                width={40}
                height={40}
              />

              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 via-indigo-700 to-purple-700 dark:from-gray-100 dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent drop-shadow-sm">
                <span className="hidden xs:inline">wishAble</span>
                <span className="xs:hidden">wishAble</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6">
            {user ? (
              <div className="flex items-center gap-2 lg:gap-4">
                <Link
                  href="/dashboard"
                  className={`transition-all duration-300 px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transform hover:scale-105 ${
                    isActivePath("/dashboard") &&
                    !isActivePath("/dashboard/profile")
                      ? "bg-white/25 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/15 dark:hover:bg-gray-700/30 backdrop-blur-sm"
                  }`}
                  style={{ textShadow: "0 1px 2px rgba(255,255,255,0.5)" }}
                >
                  <span className="hidden lg:inline">Dashboard</span>
                  <span className="lg:hidden">Dash</span>
                </Link>
                <Link
                  href="/profile"
                  className={`transition-all duration-300 px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transform hover:scale-105 ${
                    isActivePath("/profile")
                      ? "bg-white/25 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/15 dark:hover:bg-gray-700/30 backdrop-blur-sm"
                  }`}
                  style={{ textShadow: "0 1px 2px rgba(255,255,255,0.5)" }}
                >
                  Profile
                </Link>
                <ProfileDropdown />
              </div>
            ) : (
              <div className="flex items-center gap-2 lg:gap-4">
                <ThemeToggle />
                <Link
                  href="/login"
                  className={`transition-all duration-300 px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transform hover:scale-105 ${
                    isActivePath("/login")
                      ? "bg-white/25 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/15 dark:hover:bg-gray-700/30 backdrop-blur-sm"
                  }`}
                  style={{ textShadow: "0 1px 2px rgba(255,255,255,0.5)" }}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-white/90 dark:bg-gray-100 text-indigo-700 dark:text-indigo-800 hover:bg-white dark:hover:bg-gray-200 px-4 lg:px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm lg:text-base border border-white/40"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                <ProfileDropdown />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/15 dark:hover:bg-gray-700/30 backdrop-blur-sm focus:outline-none transition-all duration-300 transform hover:scale-105"
                  aria-expanded={mobileMenuOpen}
                  aria-label="Toggle navigation menu"
                  style={{ textShadow: "0 1px 2px rgba(255,255,255,0.5)" }}
                >
                  <span className="sr-only">Open main menu</span>
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    {mobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="ml-1 sm:ml-2 inline-flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/15 dark:hover:bg-gray-700/30 backdrop-blur-sm focus:outline-none transition-all duration-300 transform hover:scale-105"
                  aria-expanded={mobileMenuOpen}
                  aria-label="Toggle navigation menu"
                  style={{ textShadow: "0 1px 2px rgba(255,255,255,0.5)" }}
                >
                  <span className="sr-only">Open main menu</span>
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    {mobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/15 dark:bg-gray-800/50 backdrop-blur-md border-t border-white/30 dark:border-gray-600/30 animate-fade-in shadow-xl">
          <div className="px-3 sm:px-4 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActivePath("/dashboard") &&
                    !isActivePath("/dashboard/profile")
                      ? "bg-white/25 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/15 dark:hover:bg-gray-700/30 backdrop-blur-sm"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ textShadow: "0 1px 2px rgba(255,255,255,0.5)" }}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`block px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActivePath("/profile")
                      ? "bg-white/25 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/15 dark:hover:bg-gray-700/30 backdrop-blur-sm"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ textShadow: "0 1px 2px rgba(255,255,255,0.5)" }}
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`block px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActivePath("/login")
                      ? "bg-white/25 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/15 dark:hover:bg-gray-700/30 backdrop-blur-sm"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ textShadow: "0 1px 2px rgba(255,255,255,0.5)" }}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-3 rounded-lg text-sm sm:text-base font-medium bg-white/90 dark:bg-gray-100 text-indigo-700 dark:text-indigo-800 hover:bg-white dark:hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/40"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
