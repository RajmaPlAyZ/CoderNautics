"use client"
import { useAuthActions } from '@convex-dev/auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn("password", { email, password, flow: "signUp" });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign up with email");
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
        <h2 className="text-3xl font-extrabold mb-4 text-center text-pink-700">Sign Up</h2>
        <p className="text-center text-gray-700 mb-3">
          Welcome to CoderNautics! Please sign up to continue.
        </p>

        {error && <div className="text-red-500 text-sm text-center font-sans">{error}</div>}

        <form onSubmit={handlePasswordSignUp} className="space-y-4">
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
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-300 text-white font-extrabold py-3 rounded-md border-4 border-black shadow-[0_4px_0_#222] hover:bg-yellow-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t-2 border-dashed border-gray-400"></div>
          <span className="px-3 text-gray-500 font-bold text-sm">OR</span>
          <div className="flex-grow border-t-2 border-dashed border-gray-400"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full bg-red-400 text-white font-extrabold py-3 rounded-md border-4 border-black shadow-[0_4px_0_#222] hover:bg-red-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Sign up with Google
        </button>

        <button
          type="button"
          onClick={handleGitHubSignIn}
          className="w-full bg-gray-800 text-white font-extrabold py-3 rounded-md border-4 border-black shadow-[0_4px_0_#222] hover:bg-gray-900 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Sign up with GitHub
        </button>

        <p className="text-center text-sm font-bold mt-4">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}