"use client"
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn("password", { email, password, flow: "signIn" });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signIn("google", { redirectTo: "/" });
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signIn("github", { redirectTo: "/" });
    } catch (err: any) {
      setError(err.message || "Failed to sign in with GitHub");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-lg border-4 border-black shadow-[0_6px_0_#222] w-full max-w-sm space-y-6 font-comic">
        <h2 className="text-3xl font-extrabold mb-4 text-center text-pink-700">Login</h2>

        <p className="text-center text-sm mb-4">
          Welcome to CoderNautics! Please sign in to continue.
        </p>

        {error && <div className="text-red-500 text-sm text-center font-sans">{error}</div>}

        <form onSubmit={handlePasswordSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-black rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-black rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-300 text-white font-extrabold py-3 rounded-md border-4 border-black shadow-[0_4px_0_#222] hover:bg-yellow-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t-2 border-dashed border-gray-400"></div>
          <span className="px-3 text-gray-500 font-bold text-sm">OR</span>
          <div className="flex-grow border-t-2 border-dashed border-gray-400"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="w-full bg-red-400 text-white font-extrabold py-3 rounded-md border-4 border-black shadow-[0_4px_0_#222] hover:bg-red-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={loading}
        >
          Sign in with Google
        </button>

        <button
          onClick={handleGitHubSignIn}
          type="button"
          className="w-full bg-gray-800 text-white font-extrabold py-3 rounded-md border-4 border-black shadow-[0_4px_0_#222] hover:bg-gray-900 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={loading}
        >
          Sign in with GitHub
        </button>

        <p className="text-center text-sm font-bold mt-4">
          Don't have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}