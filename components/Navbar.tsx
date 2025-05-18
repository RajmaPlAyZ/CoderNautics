"use client"

import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function Navbar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.email === 'admin@example.com'; // Replace with your admin logic
  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <span>CoderNautics</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          {user && <Link href="/profile" className="hover:text-blue-600">Profile</Link>}
          {isAdmin && <Link href="/admin" className="hover:text-blue-600">Admin Panel</Link>}
          {!user ? (
            <>
              <Link href="/login" className="hover:text-blue-600">Login</Link>
              <Link href="/signup" className="hover:text-blue-600">Sign Up</Link>
            </>
          ) : (
            <button onClick={logout} className="hover:text-blue-600">Logout</button>
          )}
          {user && (
            <div className="ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
              {user.email?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 