"use client"
import { useAuth } from '@/components/AuthProvider';
import QuestionCard from '@/components/question-card';
// import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { app } from '@/lib/firebaseClient';
import { SavedPost, deletePost, getPostById, getPostsByUserId, getSavedPosts, unsavePost } from "@/lib/posts";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Helper function to get rank badge based on points (copy from QuestionCard.tsx)
const getRankBadge = (points?: number) => {
  if (points === undefined || points === null) {
    return null; // Or a default badge if needed
  }

  let rankText = '';
  let bgColor = '';
  let textColor = '';
  let borderColor = 'border-black'; // Add border color
  let Icon = null;

  // Assuming you have imported lucide-react icons like MinusCircle, Compass, Ship, Star
  // If not, you'll need to import them as well

  if (points >= 0 && points <= 50) {
    rankText = 'Novice';
    bgColor = 'bg-gray-200'; // Brighter gray
    textColor = 'text-gray-800';
    // Icon = MinusCircle;
  } else if (points >= 51 && points <= 200) {
    rankText = 'Explorer';
    bgColor = 'bg-green-200'; // Brighter green
    textColor = 'text-green-800';
    // Icon = Compass;
  } else if (points >= 201 && points <= 500) {
    rankText = 'Navigator';
    bgColor = 'bg-blue-200'; // Brighter blue
    textColor = 'text-blue-800';
    // Icon = Ship;
  } else if (points >= 501) {
    rankText = 'Captain';
    bgColor = 'bg-purple-200'; // Brighter purple
    textColor = 'text-purple-800';
    // Icon = Star;
  }

  if (!rankText) return null;

  return (
    <Badge className={`flex items-center gap-1 rounded-md border border-black ${bgColor} ${textColor} px-2.5 py-1 text-xs font-bold`}>
      {/* {Icon && <Icon className="h-3 w-3" />} */}{}{/* Render Icon if imported */}
      {rankText}
    </Badge>
  );
};

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
  const [savedPostsData, setSavedPostsData] = useState<any[]>([]);
  const [refreshingSaved, setRefreshingSaved] = useState(false);
  const [refreshingPosts, setRefreshingPosts] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [userDoubts, setUserDoubts] = useState<any[]>([]) // State to hold user's doubts
  const [loadingUserDoubts, setLoadingUserDoubts] = useState(true) // Loading state for user's doubts
  const [userScore, setUserScore] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      // Fetch user profile data from Firestore
      const fetchProfile = async () => {
        try {
          setLoadingProfile(true);
          setProfileError(null);
          const profileRef = doc(firestore, "profiles", user.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const data = profileSnap.data();
            setAvatarUrl(data.avatar_url);
            setNewUsername(data.username || "");
            setUserScore(data.score || 0);
          } else {
            // Create a profile document if it doesn't exist
            await setDoc(profileRef, { avatar_url: null, username: user.displayName || user.email, score: 0 });
            setAvatarUrl(null);
            setNewUsername(user.displayName || user.email || "");
            setUserScore(0);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          setProfileError("Failed to load profile data. Please try refreshing the page.");
        } finally {
          setLoadingProfile(false);
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
      const savedPosts = await getSavedPosts(user.uid);
      setSavedPosts(savedPosts);
      
      // Load the full post data for each saved post
      const postsData = await Promise.all(
        savedPosts.map(async (savedPost) => {
          try {
            const postData = await getPostById(savedPost.questionId);
            return postData;
          } catch (error) {
            console.error(`Error loading post ${savedPost.questionId}:`, error);
            return null;
          }
        })
      );
      
      setSavedPostsData(postsData.filter(post => post !== null));
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
      setLoadingUserDoubts(true);
      const posts = await getPostsByUserId(user.uid);
      setUserPosts(posts.filter(post => post.type !== 'doubt'));
      setUserDoubts(posts.filter(post => post.type === 'doubt'));
    } catch (error) {
      console.error("Error loading user posts:", error);
      console.error("Error loading user doubts:", error);
    } finally {
      setLoadingPosts(false);
      setLoadingUserDoubts(false);
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

  const handlePostUnsave = async (postId: string) => {
    try {
      setRefreshingSaved(true);
      // Find the saved post entry
      const savedPost = savedPosts.find(post => post.questionId === postId);
      if (savedPost) {
        await unsavePost(savedPost.id);
        // Update the UI immediately
        setSavedPostsData(prev => prev.filter(post => post.id !== postId));
        setSavedPosts(prev => prev.filter(post => post.questionId !== postId));
      }
    } catch (error) {
      console.error("Error unsaving post:", error);
    } finally {
      setRefreshingSaved(false);
    }
  };

  const handlePostDelete = async (postId: string) => {
    try {
      setRefreshingPosts(true);
      await deletePost(postId);
      // Update the UI immediately
      setUserPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setRefreshingPosts(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {loadingProfile ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading profile...</p>
              </div>
            ) : profileError ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{profileError}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="text-sm"
                >
                  Refresh Page
                </Button>
              </div>
            ) : (
              <>
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
                  {/* User Score and Rank */}
                  <div className="border-t-2 border-gray-200 pt-4 mt-4">
                    <h3 className="text-xl font-extrabold mb-2 text-pink-700">Your Score & Rank</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-gray-900">{userScore} Nautics 💰</p>
                      {getRankBadge(userScore)}
                    </div>
                  </div>

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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-extrabold text-pink-700">Your Posts</h3>
                    {userPosts.length > 0 && (
                      <Button
                        onClick={loadUserPosts}
                        disabled={refreshingPosts}
                        variant="outline"
                        size="sm"
                        className="text-sm"
                      >
                        {refreshingPosts ? 'Refreshing...' : 'Refresh'}
                      </Button>
                    )}
                  </div>
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
                          codeVisible={true}
                          authorId={post.authorId}
                          active={post.active}
                          type={post.type}
                          onDelete={() => handlePostDelete(post.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm">You haven't posted anything yet.</div>
                  )}
                </div>

                {/* Your Doubts Card - only visible if user is logged in */}
                {user && (
                  <div className="rounded-lg border-2 border-black bg-white p-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-extrabold text-pink-700">Your Doubts</h3>
                      {userDoubts.length > 0 && (
                        <Button
                          onClick={loadUserPosts} // Reuse the same load function
                          disabled={loadingUserDoubts}
                          variant="outline"
                          size="sm"
                          className="text-sm"
                        >
                          {loadingUserDoubts ? 'Refreshing...' : 'Refresh'}
                        </Button>
                      )}
                    </div>
                    {loadingUserDoubts ? (
                      <div className="text-gray-600 text-sm">Loading your doubts...</div>
                    ) : userDoubts.length > 0 ? (
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {userDoubts.map((post) => (
                          <QuestionCard
                            key={post.id}
                            id={post.id}
                            title={post.title}
                            tags={post.tags}
                            votes={post.votes}
                            downvotes={post.downvotes}
                            date={post.date?.toLocaleDateString() || 'N/A'}
                            code={post.code} // Code might be undefined for doubts, QuestionCard handles this
                            user={post.user}
                            codeVisible={false} // Code is generally not visible for doubts initially
                            answer={post.answer} // Answer field can be used for doubt description/initial question
                            authorId={post.authorId}
                            active={post.active}
                            type={post.type}
                            onDelete={() => handlePostDelete(post.id)} // Allow deleting doubts
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-600 text-sm">You haven't posted any doubts yet.</div>
                    )}
                  </div>
                )}

                <div className="w-full mt-2 pt-4 border-t-2 border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-extrabold text-pink-700">Saved Posts</h3>
                    {savedPostsData.length > 0 && (
                      <Button
                        onClick={loadSavedPosts}
                        disabled={refreshingSaved}
                        variant="outline"
                        size="sm"
                        className="text-sm"
                      >
                        {refreshingSaved ? 'Refreshing...' : 'Refresh'}
                      </Button>
                    )}
                  </div>
                  {loadingSaved ? (
                    <div className="text-gray-600 text-sm">Loading saved posts...</div>
                  ) : savedPostsData.length > 0 ? (
                    <div className="space-y-4">
                      {savedPostsData.map((post) => (
                        <QuestionCard
                          key={post.id}
                          id={post.id}
                          title={post.title}
                          tags={post.tags}
                          votes={post.votes}
                          downvotes={post.downvotes}
                          date={post.date?.toLocaleDateString() || 'N/A'}
                          codeVisible={false}
                          code={post.code}
                          answer={post.answer}
                          user={post.user}
                          authorId={post.authorId}
                          active={post.active}
                          onUnsave={() => handlePostUnsave(post.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm">No saved posts yet.</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 