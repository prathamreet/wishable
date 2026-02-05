"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-neutral-600">
            &copy; {new Date().getFullYear()} Wishable. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/privacy" 
              className="text-neutral-600 hover:text-neutral-950 transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-neutral-600 hover:text-neutral-950 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
