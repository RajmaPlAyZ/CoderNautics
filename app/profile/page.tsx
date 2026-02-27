"use client"
import { useAuth } from '@/components/AuthProvider';
import QuestionCard, { getRankBadge } from '@/components/question-card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ProfilePage() {
  const { user, dbUser, logout } = useAuth();
  const router = useRouter();

  const [uploading, setUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.avatars.generateUploadUrl);
  const saveAvatarUrl = useMutation(api.avatars.saveAvatarUrl);
  const updateUsername = useMutation(api.users.updateUsername);
  const deletePostMutation = useMutation(api.posts.deletePost);
  const unsavePostMutation = useMutation(api.savedPosts.unsavePost);

  // We can't use dbUser directly for the queries if it might be undefined initially,
  // but Convex handles undefined arguments by pausing the query.
  // We use dbUser?.id which maps to userId in Convex 'users' table, but 
  // actually in Convex our auth user ID is what we need. dbUser?._id is the user ID.
  const userId = dbUser?._id;

  const userPostsAll = useQuery(api.posts.getByUserId, userId ? { userId } : "skip");
  const savedPostsAll = useQuery(api.savedPosts.getSavedPosts); // gets current user's saved posts

  // Filter posts and doubts
  const userPosts = userPostsAll?.filter(post => post.type !== 'doubt') || [];
  const userDoubts = userPostsAll?.filter(post => post.type === 'doubt') || [];

  // For saved posts we need the actual post data
  // savedPostsAll returns [{ id: savedPostId, questionId: string }]
  // In Convex, getByUserId gets all, but for saved posts we might need to fetch them individually 
  // if we don't have a single query. Let's create a query for saved posts with data if needed, 
  // or we can just fetch all posts and filter, but that's inefficient.
  // Actually, we can just use another query or we might need to modify `getSavedPosts` to return post data.
  // For now, let's assume we need a new query `convex/savedPosts.ts:getSavedPostsWithData` 
  // or we map it. Let's wait and see if we can use existing.

  // To avoid complex client-side fetching, we should probably add a getSavedPostsWithData query.
  // I will add it in the next step.
  const savedPostsWithData = useQuery(api.savedPosts.getSavedPostsWithData) || [];

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (dbUser && !isEditing) {
      setNewUsername(dbUser.username || "");
    }
  }, [dbUser, isEditing]);

  if (!user || !dbUser) return null;

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setUploadError(null);
    } else {
      setAvatarFile(null);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (avatarFile.size > maxSize) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    if (!allowedTypes.includes(avatarFile.type)) {
      setUploadError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // 1. Get a short-lived upload URL
      const postUrl = await generateUploadUrl();

      // 2. POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": avatarFile.type },
        body: avatarFile,
      });
      const { storageId } = await result.json();

      // 3. Save the newly allocated storage id to the database
      await saveAvatarUrl({ storageId });

      setAvatarFile(null);
    } catch (error: any) {
      console.error('Upload error details:', error);
      let errorMessage = 'An unexpected error occurred during upload. Please try again.';
      if (error.message) errorMessage = error.message;
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!user || !newUsername.trim()) return;

    try {
      setUsernameError(null);
      await updateUsername({ username: newUsername.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating username:", error);
      setUsernameError("Failed to update username. Please try again.");
    }
  };

  const handlePostUnsave = async (savedPostId: any) => {
    try {
      await unsavePostMutation({ savedPostId });
    } catch (error) {
      console.error("Error unsaving post:", error);
    }
  };

  const handlePostDelete = async (postId: any) => {
    try {
      await deletePostMutation({ id: postId });
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative group">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {dbUser.avatar_url ? (
                    <img src={dbUser.avatar_url} alt="User Avatar" className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {dbUser.username?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                  <span className="text-white text-sm font-medium">Change</span>
                </label>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full rounded-md border-2 border-black p-2" placeholder="Enter new username" />
                    {usernameError && <p className="text-red-500 text-sm">{usernameError}</p>}
                    <div className="flex gap-2">
                      <Button onClick={handleUsernameUpdate} className="bg-blue-300 text-blue-800 font-extrabold py-2 px-4 rounded-md border-2 border-black shadow-[0_2px_0_#222] hover:bg-blue-400 transition-all duration-150">Save</Button>
                      <Button onClick={() => { setIsEditing(false); setNewUsername(dbUser.username || ""); setUsernameError(null); }} className="bg-gray-200 text-gray-700 font-extrabold py-2 px-4 rounded-md border-2 border-black shadow-[0_2px_0_#222] hover:bg-gray-300 transition-all duration-150">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold">{dbUser.username || user.name}</h1>
                    <p className="text-gray-500">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setIsEditing(true)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Edit Username</button>
                      <span className="text-gray-300">|</span>
                      <label htmlFor="avatar-upload" className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer">Upload Avatar</label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-t-2 border-gray-200 pt-4 mt-4">
                <h3 className="text-xl font-extrabold mb-2 text-pink-700">Your Score & Rank</h3>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">{dbUser.score} Nautics 💰</p>
                  {getRankBadge(dbUser.score)}
                </div>
              </div>

              <button onClick={logout} className="w-full bg-red-300 text-red-800 font-extrabold py-3 rounded-md border-4 border-black shadow-[0_4px_0_#222] hover:bg-red-400 transition-all duration-150">Logout</button>

              {avatarFile && (
                <div className="border-t-2 border-gray-200 pt-4 mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-pink-700">Upload New Avatar</h3>
                    <button onClick={() => setAvatarFile(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">Selected: {avatarFile.name}</p>
                      <Button onClick={handleAvatarUpload} disabled={uploading} className="w-full bg-blue-300 text-blue-800 font-extrabold py-2 px-4 rounded-md border-2 border-black shadow-[0_2px_0_#222] hover:bg-blue-400 transition-all duration-150">{uploading ? 'Uploading...' : 'Upload Avatar'}</Button>
                      {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full mt-6 pt-6 border-t-2 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-extrabold text-pink-700">Your Posts</h3>
              </div>
              {userPostsAll === undefined ? (
                <div className="text-gray-600 text-sm">Loading your posts...</div>
              ) : userPosts.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {userPosts.map((post) => (
                    <QuestionCard key={post.id} id={post.id} title={post.title} tags={post.tags} votes={post.votes} downvotes={post.downvotes} date={post.date?.split('T')[0] || 'N/A'} code={post.code} user={post.user} codeVisible={true} authorId={post.authorId} active={post.active} type={post.type as 'post' | 'doubt'} onDelete={() => handlePostDelete(post.id)} />
                  ))}
                </div>
              ) : (
                <div className="text-gray-600 text-sm">You haven't posted anything yet.</div>
              )}
            </div>

            <div className="rounded-lg border-2 border-black bg-white p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-extrabold text-pink-700">Your Doubts</h3>
              </div>
              {userPostsAll === undefined ? (
                <div className="text-gray-600 text-sm">Loading your doubts...</div>
              ) : userDoubts.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {userDoubts.map((post) => (
                    <QuestionCard key={post.id} id={post.id} title={post.title} tags={post.tags} votes={post.votes} downvotes={post.downvotes} date={post.date?.split('T')[0] || 'N/A'} code={post.code} user={post.user} codeVisible={false} answer={post.answer} authorId={post.authorId} active={post.active} type={post.type as 'post' | 'doubt'} onDelete={() => handlePostDelete(post.id)} />
                  ))}
                </div>
              ) : (
                <div className="text-gray-600 text-sm">You haven't posted any doubts yet.</div>
              )}
            </div>

            <div className="w-full mt-2 pt-4 border-t-2 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-extrabold text-pink-700">Saved Posts</h3>
              </div>
              {savedPostsWithData === undefined ? (
                <div className="text-gray-600 text-sm">Loading saved posts...</div>
              ) : savedPostsWithData.length > 0 ? (
                <div className="space-y-4">
                  {savedPostsWithData.map((post: any) => (
                    <QuestionCard key={post.id} id={post.id} title={post.title} tags={post.tags} votes={post.votes} downvotes={post.downvotes} date={post.date?.split('T')[0] || 'N/A'} codeVisible={false} code={post.code} answer={post.answer} user={post.user} authorId={post.authorId} active={post.active} onUnsave={() => handlePostUnsave(post.savedPostId)} />
                  ))}
                </div>
              ) : (
                <div className="text-gray-600 text-sm">No saved posts yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}