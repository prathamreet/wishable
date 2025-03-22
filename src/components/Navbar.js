'use client';
import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../contexts/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">WishAble</Link>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded bg-gray-700 hover:bg-gray-600"
        >
          {darkMode ? 'Light' : 'Dark'}
        </button>
        {user ? (
          <>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <button onClick={logout} className="hover:underline">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline">Login</Link>
            <Link href="/signup" className="hover:underline">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}