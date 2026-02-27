"use client";
export const dynamic = "force-dynamic";

import PostEditRow from '@/components/admin/post-edit-row';
import UserEditRow from '@/components/admin/user-edit-row';
import { useAuth } from '@/components/AuthProvider';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminPanel() {
  const { dbUser, loading } = useAuth();
  const router = useRouter();

  const users = useQuery(api.users.getAllUsers);
  const posts = useQuery(api.posts.getAll);

  const updateUserRole = useMutation(api.users.updateUserRole);
  const deleteUserMutation = useMutation(api.users.deleteUser);
  const deletePostMutation = useMutation(api.posts.deletePost);
  const updatePostMutation = useMutation(api.posts.updatePost);

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);

  useEffect(() => {
    if (!loading && (!dbUser || !dbUser.isAdmin)) {
      router.push('/');
    }
  }, [dbUser, loading, router]);


  const handleEditUser = (userToEdit: any) => {
    setEditingUser(userToEdit);
  };

  const handleDeleteUser = async (userId: Id<"users">) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUserMutation({ targetUserId: userId });
      } catch (err: any) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  const handleSaveEdit = async (updatedData: any) => {
    if (!editingUser) return;
    setIsSavingUser(true);
    try {
      if (updatedData.disabled !== undefined) {
        // We aren't fully supporting "disabled" in Convex Auth out of the box right now
        // But we could add it to schema if needed. Let's ignore disabled for now
      }
      if (updatedData.isAdmin !== undefined) {
        await updateUserRole({ targetUserId: editingUser.id, isAdmin: updatedData.isAdmin });
      }
      setEditingUser(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update user');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  // Post Actions
  const handleEditPost = (postToEdit: any) => {
    setEditingPost(postToEdit);
  };

  const handleDeletePost = async (postId: Id<"questions">) => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await deletePostMutation({ id: postId });
      } catch (err: any) {
        alert(err.message || 'Failed to delete post');
      }
    }
  };

  const handleSavePostEdit = async (updatedData: any) => {
    if (!editingPost) return;
    setIsSavingPost(true);
    try {
      await updatePostMutation({
        id: editingPost.id,
        title: updatedData.title,
        code: updatedData.code,
        tags: updatedData.tags
      });
      setEditingPost(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update post');
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleCancelPostEdit = () => setEditingPost(null);

  if (loading || !dbUser || !dbUser.isAdmin) {
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
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{users?.length || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 sm:p-6 rounded-xl border-4 border-black shadow-[0_6px_0_#222]"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 font-comic mb-2">Verified Users</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {users?.filter(u => u.emailVerified).length || 0}
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
              {users?.filter(u => u.disabled).length || 0}
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

          {users === undefined ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-black border-t-transparent mx-auto"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-600 font-comic">Loading users...</p>
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
                    editingUser?.id === u.id ? (
                      <UserEditRow
                        key={u.id}
                        user={{ ...u, uid: u.id, photoURL: u.avatar_url, displayName: u.name } as any}
                        onSave={handleSaveEdit}
                        onCancel={handleCancelEdit}
                        isSaving={isSavingUser}
                      />
                    ) : (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center">
                            {u.avatar_url ? (
                              <img
                                src={u.avatar_url}
                                alt={u.username || 'User'}
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-black"
                              />
                            ) : (
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center">
                                <span className="text-base sm:text-lg font-bold text-gray-600">
                                  {(u.username || u.name || u.email || '?')[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="ml-3 sm:ml-4">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 font-comic">
                                {u.username || u.name || 'No Name'}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 font-comic">
                                {u.id.slice(0, 8)}...
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
                            {u.isAdmin && (
                              <span className="px-2 py-1 text-xs font-bold text-purple-800 bg-purple-100 rounded-full border-2 border-purple-800">
                                Admin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex space-x-2 sm:space-x-3 text-xs sm:text-sm">
                            <button
                              onClick={() => handleEditUser(u)}
                              className="text-blue-600 hover:text-blue-900 font-bold font-comic uppercase tracking-wider hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-600 hover:text-red-900 font-bold font-comic uppercase tracking-wider hover:underline"
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
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border-4 border-black shadow-[0_6px_0_#222] overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b-4 border-black flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-comic">Post Management</h2>
            <div className="text-sm font-bold py-1 px-3 bg-blue-100 text-blue-800 rounded-full border-2 border-blue-800">
              Total: {posts?.length || 0}
            </div>
          </div>

          {posts === undefined ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-black border-t-transparent mx-auto"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-600 font-comic">Loading posts...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-4 border-black">
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-900 font-comic">Post details</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-900 font-comic">Author</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-900 font-comic">Stats</th>
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
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="text-xs sm:text-sm font-bold text-gray-900 font-comic mb-1">
                            {post.title}
                          </div>
                          <div className="text-xs text-gray-500 font-comic">
                            {post.tags?.join(', ') || 'No tags'}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center">
                            {post.user?.avatar_url ? (
                              <img
                                src={post.user.avatar_url}
                                alt={post.user?.username || 'Author'}
                                className="h-6 w-6 sm:h-8 sm:w-8 rounded-full border-2 border-black mr-2 sm:mr-3"
                              />
                            ) : (
                              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center mr-2 sm:mr-3">
                                <span className="text-xs font-bold text-gray-600">
                                  {(post.user?.username || '?')[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="text-xs sm:text-sm font-medium text-gray-900 font-comic">
                              {post.user?.username || 'Unknown'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500 font-comic">
                            <span className="flex items-center" title="Upvotes">
                              <span className="text-green-600 mr-1">↑</span> {post.votes}
                            </span>
                            <span className="flex items-center" title="Downvotes">
                              <span className="text-red-600 mr-1">↓</span> {post.downvotes}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex space-x-2 sm:space-x-3 text-xs sm:text-sm">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="text-blue-600 hover:text-blue-900 font-bold font-comic uppercase tracking-wider hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id as any)}
                              className="text-red-600 hover:text-red-900 font-bold font-comic uppercase tracking-wider hover:underline"
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