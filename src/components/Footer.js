"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white/5 dark:bg-gray-800/20 backdrop-blur-sm border-t border-white/10 dark:border-gray-600/20 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-indigo-100 dark:text-gray-300">
            &copy; {new Date().getFullYear()} WishAble. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/privacy" 
              className="text-indigo-200 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-indigo-200 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
