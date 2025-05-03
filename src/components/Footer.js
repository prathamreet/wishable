'use client';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();
  
  return (
    <footer className="bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border mt-10">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center text-xl font-bold text-light-text dark:text-dark-text">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6 mr-2 text-primary-500"
              >
                <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM20.25 5.507v11.561L5.853 2.671c.15-.043.306-.075.467-.094a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93zM3.75 21V9.406c0-1.524 1.162-2.807 2.67-2.934a48.774 48.774 0 013.36-.187c1.437.025 2.883.084 4.328.175l-9.508 9.508a.75.75 0 00-.22.53V21c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-5.25a.75.75 0 00-.75-.75h-2.625l-1.59 1.59c-.2.2-.47.312-.75.312h-2.25a.75.75 0 01-.53-.22l-1.06-1.06a.75.75 0 01.53-1.28h1.5v-1.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V18a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V18a.75.75 0 01-.75.75H3.75z" />
              </svg>
              WishAble
            </Link>
            <p className="mt-3 text-light-text/70 dark:text-dark-text/70 text-sm">
              Track prices across all your favorite online stores in one place.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-light-text dark:text-dark-text mb-3">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="text-light-text/70 dark:text-dark-text/70 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Price Tracking
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-light-text/70 dark:text-dark-text/70 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Wishlists
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-light-text/70 dark:text-dark-text/70 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Notifications
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-light-text/70 dark:text-dark-text/70 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Sharing
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-light-text dark:text-dark-text mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-light-text/70 dark:text-dark-text/70 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-light-text/70 dark:text-dark-text/70 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-light-text/70 dark:text-dark-text/70 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-light-text/70 dark:text-dark-text/70 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-light-text dark:text-dark-text mb-3">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-light-text/70 dark:text-dark-text/70 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-light-text/70 dark:text-dark-text/70 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-light-border dark:border-dark-border text-center text-sm text-light-text/60 dark:text-dark-text/60">
          <p>&copy; {new Date().getFullYear()} WishAble. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}