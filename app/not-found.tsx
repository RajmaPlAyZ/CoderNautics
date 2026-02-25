"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e9c46a] to-[#f4a261] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border-4 border-black shadow-[0_8px_0_#222] p-8 max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg border-2 border-black transition-colors"
          >
            Go Back
          </button>
          <Link
            href="/"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg border-2 border-black transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
