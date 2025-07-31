"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-t border-white/20 dark:border-gray-600/20 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p 
            className="text-gray-700 dark:text-gray-300 font-medium"
            style={{ textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}
          >
            &copy; {new Date().getFullYear()} WishAble. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/privacy" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium"
              style={{ textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium"
              style={{ textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
