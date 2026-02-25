"use client";

import PostEditRow from '@/components/admin/post-edit-row';
import UserEditRow from '@/components/admin/user-edit-row';
import { useAuth } from '@/components/AuthProvider';
import { getAllPosts, deletePost, updatePost, Post } from '@/lib/posts';
import { getAllUsers, deleteUser, updateUser, AdminUser } from '@/lib/adminUsers';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
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
    if (!user?.isAdmin) return;

    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getAllPosts();
        setPosts(fetchedPosts);
      } catch (err) {
        setPostError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchUsers();
    fetchPosts();
  }, [user]);

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(uid);
      setUsers(users.filter(u => u.uid !== uid));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleEditClick = (u: AdminUser) => setEditingUser(u);

  const handleSaveEdit = async (updatedUser: AdminUser) => {
    try {
      setIsSavingUser(true);
      await updateUser(updatedUser);
      setUsers(users.map(u => u.uid === updatedUser.uid ? updatedUser : u));
      setEditingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleCancelEdit = () => setEditingUser(null);

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const handleEditPostClick = (post: Post) => setEditingPost(post);

  const handleSavePostEdit = async (updatedPostData: { id: string; title?: string; code?: string; answer?: string; tags?: string[] }) => {
    try {
      setIsSavingPost(true);
      const { id: postId, ...updates } = updatedPostData;
      await updatePost(postId, updates);
      setPosts(posts.map(p => p.id === postId ? { ...p, ...updates as any } : p));
      setEditingPost(null);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleCancelPostEdit = () => setEditingPost(null);

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
                  {users.map((u) => (
                    editingUser?.uid === u.uid ? (
                      <UserEditRow
                        key={u.uid}
                        user={editingUser}
                        onSave={handleSaveEdit}
                        onCancel={handleCancelEdit}
                        isSaving={isSavingUser}
                      />
                    ) : (
                      <tr key={u.uid} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center">
                            {u.photoURL ? (
                              <img
                                src={u.photoURL}
                                alt={u.displayName || 'User'}
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-black"
                              />
                            ) : (
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center">
                                <span className="text-base sm:text-lg font-bold text-gray-600">
                                  {(u.displayName || u.email || '?')[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="ml-3 sm:ml-4">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 font-comic">
                                {u.displayName || 'No Name'}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 font-comic">
                                {u.uid.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="text-xs sm:text-sm text-gray-900 font-comic">{u.email || 'No Email'}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center space-x-2">
                            {u.emailVerified && (
                              <span className="px-2 py-1 text-xs font-bold text-green-800 bg-green-100 rounded-full border-2 border-green-800">
                                Verified
                              </span>
                            )}
                            {u.disabled && (
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
                              onClick={() => handleEditClick(u)}
                            >
                              Edit
                            </button>
                            <button
                              className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold text-white bg-red-600 rounded-lg border-2 border-black hover:bg-red-700 transition-colors"
                              onClick={() => handleDeleteUser(u.uid)}
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