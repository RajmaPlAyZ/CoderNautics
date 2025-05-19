'use client'

import { getRankBadge } from '@/components/question-card'; // Assuming getRankBadge can be imported
import { app } from '@/lib/firebaseClient';
import { collection, getDocs, getFirestore, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url: string | null;
  score: number;
}

const firestore = getFirestore(app);

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const usersCollection = collection(firestore, 'profiles');
        // Order by score descending. If scores are equal, maybe order by username or another field.
        const q = query(usersCollection, orderBy('score', 'desc'));
        const querySnapshot = await getDocs(q);

        const fetchedUsers: LeaderboardUser[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            username: data.username || 'Anonymous', // Use a default if username is missing
            avatar_url: data.avatar_url || null,
            score: data.score || 0, // Default to 0 if score is missing
          };
        });
        setUsers(fetchedUsers);
      } catch (err: any) {
        console.error('Error fetching users for leaderboard:', err);
        setError('Failed to load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-pink-700">Leaderboard</h1>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>No users found yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user, index) => (
                <div key={user.id} className="flex items-center gap-4 p-3 rounded-md border shadow-sm bg-gray-50">
                  <div className="font-bold text-lg text-gray-800 w-8 text-center">#{index + 1}</div>
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-gray-600">
                        {user.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{user.username}</div>
                    {/* Display Rank Badge here using getRankBadge */} 
                     {getRankBadge(user.score)}
                  </div>
                  <div className="font-bold text-lg text-blue-600 flex-shrink-0">{user.score} Points</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 