"use client";
import { useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthContext } from "../contexts/AuthContext";
import Link from "next/link";
import ProfileDropdown from "./ProfileDropdown";
import OptimizedImage from "./OptimizedImage";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActivePath = (path) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-70"
          >
            <OptimizedImage
              src="/favicons/android-chrome-512x512.png"
              alt="Wishable"
              width={32}
              height={32}
            />
            <span className="text-lg font-semibold tracking-tight">
              Wishable
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActivePath("/dashboard") && !isActivePath("/dashboard/profile")
                      ? "text-neutral-950"
                      : "text-neutral-600 hover:text-neutral-950"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`text-sm font-medium transition-colors ${
                    isActivePath("/profile")
                      ? "text-neutral-950"
                      : "text-neutral-600 hover:text-neutral-950"
                  }`}
                >
                  Profile
                </Link>
                <ProfileDropdown />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-950 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {user && <ProfileDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-600 hover:text-neutral-950 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200">
          <div className="px-6 py-4 space-y-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block py-2 text-sm font-medium transition-colors ${
                    isActivePath("/dashboard") && !isActivePath("/dashboard/profile")
                      ? "text-neutral-950"
                      : "text-neutral-600 hover:text-neutral-950"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`block py-2 text-sm font-medium transition-colors ${
                    isActivePath("/profile")
                      ? "text-neutral-950"
                      : "text-neutral-600 hover:text-neutral-950"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2 text-sm font-medium text-neutral-600 hover:text-neutral-950 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="block py-2 text-sm font-medium text-neutral-950"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
