"use client";

import PostEditRow from '@/components/admin/post-edit-row';
import UserEditRow from '@/components/admin/user-edit-row';
import { useAuth } from '@/components/AuthProvider';
import { Post } from '@/lib/posts';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  disabled: boolean;
  emailVerified: boolean;
}

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/admin/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data.posts);
      } catch (err) {
        setPostError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoadingPosts(false);
      }
    };

    if (user?.isAdmin) {
      fetchUsers();
      fetchPosts();
    }
  }, [user]);

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      // Remove the deleted user from the local state
      setUsers(users.filter(user => user.uid !== uid));
      console.log(`User ${uid} deleted successfully.`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
  };

  const handleSaveEdit = async (updatedUser: User) => {
    try {
      setIsSavingUser(true);
      const response = await fetch(`/api/admin/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
         const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      // Update the user in the local state
      setUsers(users.map(user => user.uid === updatedUser.uid ? updatedUser : user));
      setEditingUser(null);
      console.log(`User ${updatedUser.uid} updated successfully.`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
       console.error('Error updating user:', err);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/posts`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: postId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }

      // Remove the deleted post from the local state
      setPosts(posts.filter(post => post.id !== postId));
      console.log(`Post ${postId} deleted successfully.`);

    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Failed to delete post');
      console.error('Error deleting post:', err);
    }
  };

  const handleEditPostClick = (post: Post) => {
    setEditingPost(post);
  };

  const handleSavePostEdit = async (updatedPostData: { id: string; title?: string; code?: string; answer?: string; tags?: string[] }) => {
    try {
      setIsSavingPost(true);
      // Extract id and updates from the received data
      const { id: postId, ...updates } = updatedPostData;

      const response = await fetch(`/api/admin/posts`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, ...updates }), // Send postId and updates separately
      });

      if (!response.ok) {
         const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update post');
      }

      // Update the post in the local state using the original posts array and the updated data
      setPosts(posts.map(post => post.id === postId ? { ...post, ...updates as any } : post)); // Merge updates with existing post data
      setEditingPost(null); // Close the edit form
      console.log(`Post ${postId} updated successfully.`);

    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Failed to update post');
       console.error('Error updating post:', err);
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleCancelPostEdit = () => {
    setEditingPost(null);
  };

  if (loading || !user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 font-comic bg-white p-4 sm:p-6 rounded-xl border-4 border-black shadow-[0_6px_0_#222]">
            Admin Panel
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-comic bg-white p-4 sm:p-6 rounded-xl border-4 border-black shadow-[0_6px_0_#222]">
            Manage your users and monitor system activity
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-4 sm:p-6 rounded-xl border-4 border-black shadow-[0_6px_0_#222]"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 font-comic mb-2">Total Users</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{users.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 sm:p-6 rounded-xl border-4 border-black shadow-[0_6px_0_#222]"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 font-comic mb-2">Verified Users</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {users.filter(u => u.emailVerified).length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 sm:p-6 rounded-xl border-4 border-black shadow-[0_6px_0_#222]"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 font-comic mb-2">Disabled Users</h3>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {users.filter(u => u.disabled).length}
            </p>
          </motion.div>
        </div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border-4 border-black shadow-[0_6px_0_#222] overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b-4 border-black">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-comic">User Management</h2>
          </div>

          {loadingUsers ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-black border-t-transparent mx-auto"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-600 font-comic">Loading users...</p>
            </div>
          ) : error ? (
            <div className="p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-red-600 font-comic">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-4 border-black">
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-900 font-comic">User</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-900 font-comic">Email</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-900 font-comic">Status</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-900 font-comic">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-4 divide-black">
                  {users.map((user) => (
                    editingUser?.uid === user.uid ? (
                      <UserEditRow
                        key={user.uid}
                        user={editingUser}
                        onSave={handleSaveEdit}
                        onCancel={handleCancelEdit}
                        isSaving={isSavingUser}
                      />
                    ) : (
                      <tr key={user.uid} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.displayName || 'User'}
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-black"
                              />
                            ) : (
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center">
                                <span className="text-base sm:text-lg font-bold text-gray-600">
                                  {(user.displayName || user.email || '?')[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="ml-3 sm:ml-4">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 font-comic">
                                {user.displayName || 'No Name'}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 font-comic">
                                {user.uid.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="text-xs sm:text-sm text-gray-900 font-comic">{user.email || 'No Email'}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center space-x-2">
                            {user.emailVerified && (
                              <span className="px-2 py-1 text-xs font-bold text-green-800 bg-green-100 rounded-full border-2 border-green-800">
                                Verified
                              </span>
                            )}
                            {user.disabled && (
                              <span className="px-2 py-1 text-xs font-bold text-red-800 bg-red-100 rounded-full border-2 border-red-800">
                                Disabled
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex space-x-2">
                            <button
                              className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold text-white bg-blue-600 rounded-lg border-2 border-black hover:bg-blue-700 transition-colors"
                              onClick={() => handleEditClick(user)}
                            >
                              Edit
                            </button>
                            <button
                              className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold text-white bg-red-600 rounded-lg border-2 border-black hover:bg-red-700 transition-colors"
                              onClick={() => handleDeleteUser(user.uid)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Posts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border-4 border-black shadow-[0_6px_0_#222] overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b-4 border-black">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-comic">Post Management</h2>
          </div>

          {loadingPosts ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-black border-t-transparent mx-auto"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-600 font-comic">Loading posts...</p>
            </div>
          ) : postError ? (
            <div className="p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-red-600 font-comic">{postError}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-4 border-black">
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-900 font-comic">Title</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-900 font-comic">Author</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-900 font-comic">Date</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-900 font-comic">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-4 divide-black">
                  {posts.map((post) => (
                    editingPost?.id === post.id ? (
                      <PostEditRow
                        key={post.id}
                        post={editingPost}
                        onSave={handleSavePostEdit}
                        onCancel={handleCancelPostEdit}
                        isSaving={isSavingPost}
                      />
                    ) : (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900 font-comic">
                          {post.title}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-comic">
                          {post.user?.username || 'Anonymous'}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 font-comic">
                          {new Date(post.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex space-x-2">
                            <button
                              className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold text-white bg-blue-600 rounded-lg border-2 border-black hover:bg-blue-700 transition-colors"
                              onClick={() => handleEditPostClick(post)}
                            >
                              Edit
                            </button>
                            <button
                              className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold text-white bg-red-600 rounded-lg border-2 border-black hover:bg-red-700 transition-colors"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 