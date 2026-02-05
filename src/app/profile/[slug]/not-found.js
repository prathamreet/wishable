'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProfileNotFound() {
  const pathname = usePathname();
  const searchedUsername = pathname.split('/').pop();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-6 pt-32 text-center">
        <div className="border border-neutral-200 p-12">
          
          <div className="text-6xl font-bold text-neutral-950 mb-6">
            404
          </div>
          
          <h1 className="text-3xl font-semibold tracking-tight mb-4">
            Username Doesn{"'"}t Exist
          </h1>
          
          <div className="border border-red-600 bg-red-50 p-4 mb-6">
            <p className="text-red-900">
              The username 
              {searchedUsername && (
                <span className="mx-2 bg-red-100 px-2 py-1 font-mono text-sm">
                  {"\""}{searchedUsername}{"\""}
                </span>
              )} 
              doesn{"'"}t exist.
            </p>
          </div>

          <p className="text-neutral-600 mb-6">
            Search for users on the <Link href="/" className="underline hover:text-neutral-950">homepage</Link> or create your own wishlist.
          </p>

          <div className="space-y-4">
            <Link href="/signup" className="btn-primary block">
              Create Your Wishlist
            </Link>
            <Link href="/" className="btn-secondary block">
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
