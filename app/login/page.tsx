"use client"
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const { login, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border-4 border-black shadow-[0_6px_0_#222] w-full max-w-sm space-y-6 font-comic">
        <h2 className="text-3xl font-extrabold mb-4 text-center text-pink-700">Login</h2>
        {error && <div className="text-red-500 text-sm text-center font-sans">{error}</div>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-md border-2 border-black px-4 py-2 shadow-[0_2px_0_#222] focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-md border-2 border-black px-4 py-2 shadow-[0_2px_0_#222] focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <button type="submit" className="w-full bg-yellow-300 text-yellow-800 font-extrabold py-3 rounded-md border-4 border-black shadow-[0_4px_0_#222] hover:bg-yellow-400 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full bg-red-400 text-white font-extrabold py-3 rounded-md border-4 border-black shadow-[0_4px_0_#222] hover:bg-red-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Sign in with Google
        </button>
        <p className="text-center text-sm text-gray-600 font-sans">
          Don't have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
        </p>
      </form>
    </div>
  );
} 