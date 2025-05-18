"use client"
import { useAuth } from '@/components/AuthProvider';
import QuestionCard from '@/components/question-card';
// import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { app } from '@/lib/firebaseClient';
import { SavedPost, getPostsByUserId, getSavedPosts } from "@/lib/posts";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const firestore = getFirestore(app);
const storage = getStorage(app);

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
  const [loadingSaved, setLoadingSaved] = useState(true)
  const [userPosts, setUserPosts] = useState<any[]>([]) // Adjust type if you have a Post interface
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      // Fetch user profile data from Firestore
      const fetchProfile = async () => {
        const profileRef = doc(firestore, "profiles", user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setAvatarUrl(data.avatar_url);
          setNewUsername(data.username || "");
        } else {
          // Create a profile document if it doesn't exist
          await setDoc(profileRef, { avatar_url: null, username: user.displayName || user.email });
          setAvatarUrl(null);
          setNewUsername(user.displayName || user.email || "");
        }
      };
      fetchProfile();
      loadSavedPosts();
      loadUserPosts();
    }
  }, [user, router]);

  const loadSavedPosts = async () => {
    if (!user) return
    try {
      setLoadingSaved(true);
      const posts = await getSavedPosts(user.uid)
      setSavedPosts(posts)
    } catch (error) {
      console.error("Error loading saved posts:", error)
    } finally {
      setLoadingSaved(false)
    }
  }

   const loadUserPosts = async () => {
    if (!user) return
    try {
      setLoadingPosts(true);
      const posts = await getPostsByUserId(user.uid);
      setUserPosts(posts);
    } catch (error) {
      console.error("Error loading user posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  }

  if (!user) return null;

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAvatarFile(event.target.files[0]);
      setUploadError(null);
    } else {
      setAvatarFile(null);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;

    setUploading(true);
    setUploadError(null);

    const fileExt = avatarFile.name.split('.').pop();
    const filePath = `${user.uid}/avatar.${fileExt}`;
    const storageRef = ref(storage, filePath);

    try {
      console.log('Starting upload for user:', user.uid);
      console.log('File path:', filePath);
      console.log('File type:', avatarFile.type);
      console.log('File size:', avatarFile.size);

      // Upload the file to Firebase Storage
      const uploadResult = await uploadBytes(storageRef, avatarFile);
      console.log('Upload successful, result:', uploadResult);

      // Get the public URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Download URL:', downloadURL);

      if (!downloadURL) {
        throw new Error('Failed to get download URL for uploaded file');
      }

      // Update user's profile with the avatar URL in Firestore
      const profileRef = doc(firestore, "profiles", user.uid);
      await setDoc(profileRef, { avatar_url: downloadURL }, { merge: true });

      console.log('Avatar uploaded and profile updated successfully!');
      setAvatarUrl(downloadURL); // Update the state with the new avatar URL
      // window.location.reload(); // No need to hard reload

    } catch (error: any) {
      console.error('Upload error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      
      setUploadError(
        error.message || 
        'An unexpected error occurred during upload. Please try again.'
      );
    } finally {
      setUploading(false);
      setAvatarFile(null);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!user || !newUsername.trim()) return;
    
    try {
      setUsernameError(null);
      const profileRef = doc(firestore, "profiles", user.uid);
      await setDoc(profileRef, { username: newUsername.trim() }, { merge: true });
      setIsEditing(false);
      // Force a refresh of the auth context to update the username
      window.location.reload();
    } catch (error) {
      console.error("Error updating username:", error);
      setUsernameError("Failed to update username. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative group">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="User Avatar" className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200"
                >
                  <span className="text-white text-sm font-medium">Change</span>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full rounded-md border-2 border-black p-2"
                      placeholder="Enter new username"
                    />
                    {usernameError && <p className="text-red-500 text-sm">{usernameError}</p>}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleUsernameUpdate}
                        className="bg-blue-300 text-blue-800 font-extrabold py-2 px-4 rounded-md border-2 border-black shadow-[0_2px_0_#222] hover:bg-blue-400 transition-all duration-150"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setNewUsername(user.username || user.displayName || user.email || "");
                          setUsernameError(null);
                        }}
                        className="bg-gray-200 text-gray-700 font-extrabold py-2 px-4 rounded-md border-2 border-black shadow-[0_2px_0_#222] hover:bg-gray-300 transition-all duration-150"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold">{user.username || user.displayName || user.email}</h1>
                    <p className="text-gray-500">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit Username
                      </button>
                      <span className="text-gray-300">|</span>
                      <label
                        htmlFor="avatar-upload"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        Upload Avatar
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={logout} className="w-full bg-red-300 text-red-800 font-extrabold py-3 rounded-md border-4 border-black shadow-[0_4px_0_#222] hover:bg-red-400 transition-all duration-150">
                Logout
              </button>

              {/* Avatar Upload Section */}
              {avatarFile && (
                <div className="border-t-2 border-gray-200 pt-4 mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-pink-700">Upload New Avatar</h3>
                    <button
                      onClick={() => setAvatarFile(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img
                        src={URL.createObjectURL(avatarFile)}
                        alt="Preview"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">
                        Selected: {avatarFile.name}
                      </p>
                      <Button
                        onClick={handleAvatarUpload}
                        disabled={uploading}
                        className="w-full bg-blue-300 text-blue-800 font-extrabold py-2 px-4 rounded-md border-2 border-black shadow-[0_2px_0_#222] hover:bg-blue-400 transition-all duration-150"
                      >
                        {uploading ? 'Uploading...' : 'Upload Avatar'}
                      </Button>
                      {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full mt-6 pt-6 border-t-2 border-gray-200">
              <h3 className="text-xl font-extrabold mb-4 text-pink-700">Your Posts</h3>
              {loadingPosts ? (
                <div className="text-gray-600 text-sm">Loading your posts...</div>
              ) : userPosts.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {userPosts.map((post) => (
                    <QuestionCard
                      key={post.id}
                      id={post.id}
                      title={post.title}
                      tags={post.tags}
                      votes={post.votes}
                      downvotes={post.downvotes}
                      date={post.date?.toLocaleDateString() || 'N/A'}
                      code={post.code}
                      user={post.user}
                      codeVisible={true} // Show code by default in profile
                      authorId={post.authorId}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-600 text-sm">You haven't posted anything yet.</div>
              )}
            </div>

            <div className="w-full mt-2 pt-4 border-t-2 border-gray-200">
              <h3 className="text-xl font-extrabold mb-4 text-pink-700">Saved Posts</h3>
              {loadingSaved ? (
                <div className="text-gray-600 text-sm">Loading saved posts...</div>
              ) : savedPosts.length > 0 ? (
                <div className="space-y-4">
                  {savedPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/question/${post.questionId}`}
                      className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900">Question #{post.questionId}</span>
                        <span className="text-sm text-gray-500">
                          Saved on {post.savedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
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