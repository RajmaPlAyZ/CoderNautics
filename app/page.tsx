"use client";
export const dynamic = "force-dynamic";

import { useAuth } from '@/components/AuthProvider';
import GuidelinesSidebar from "@/components/guidelines-sidebar";
import QuestionCard from "@/components/question-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function HomePage() {
  const { user, dbUser, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCode, setNewPostCode] = useState('');
  const [newPostAnswer, setNewPostAnswer] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const [newDoubtTitle, setNewDoubtTitle] = useState('');
  const [newDoubtDescription, setNewDoubtDescription] = useState('');
  const [newDoubtTags, setNewDoubtTags] = useState('');
  const [isSubmittingDoubt, setIsSubmittingDoubt] = useState(false);

  const [currentFilter, setCurrentFilter] = useState('Newest');

  const allPostsQuery = useQuery(api.posts.getAll);
  const allPosts = allPostsQuery || [];
  const loadingPosts = allPostsQuery === undefined;

  // We only enable this query if we have a user
  const userPostsQuery = useQuery(api.posts.getByUserId, user && dbUser?.id ? { userId: dbUser.id } : "skip");
  const userPosts = userPostsQuery || [];
  const loadingUserPosts = user ? userPostsQuery === undefined : false;

  const totalCommunityPostCount = allPosts.length;

  const addPostMutation = useMutation(api.posts.addPost);
  const addDoubtMutation = useMutation(api.posts.addDoubt);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmitNewPost = async () => {
    if (!user || !dbUser?.id || !newPostTitle.trim() || !newPostCode.trim() || !newPostAnswer.trim()) {
      alert("Please provide a title, code snippet, and explanation.");
      return;
    }

    setIsSubmittingPost(true);
    try {
      const tagsArray = newPostTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      await addPostMutation({
        title: newPostTitle.trim(),
        code: newPostCode.trim(),
        answer: newPostAnswer.trim(),
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });

      setNewPostTitle('');
      setNewPostCode('');
      setNewPostAnswer('');
      setNewPostTags('');
      alert("Post added successfully!");
    } catch (error: any) {
      console.error("Error adding new post:", error);
      alert(error.message || "Failed to add post.");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleSubmitNewDoubt = async () => {
    if (!user || !dbUser?.id || !newDoubtTitle.trim() || !newDoubtDescription.trim()) {
      alert("Please provide a title and description for your doubt.");
      return;
    }

    setIsSubmittingDoubt(true);
    try {
      const tagsArray = newDoubtTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      await addDoubtMutation({
        title: newDoubtTitle.trim(),
        description: newDoubtDescription.trim(),
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });

      alert("Doubt posted successfully!");
      setNewDoubtTitle('');
      setNewDoubtDescription('');
      setNewDoubtTags('');

    } catch (error: any) {
      console.error("Error posting doubt:", error);
      alert(error.message || "Failed to post doubt.");
    } finally {
      setIsSubmittingDoubt(false);
    }
  };

  const formatCount = (count: number): string => {
    return count > 99 ? '99+' : String(count);
  };

  const filteredAndSortedPosts = allPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    post.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(post => {
    if (currentFilter !== 'Bountied' && !post.active) {
      return false;
    }
    if (currentFilter === 'Doubts') {
      return post.type === 'doubt';
    } else if (currentFilter === 'Unanswered') {
      return post.type === 'post' && (!post.answer || post.answer.trim() === '');
    } else if (currentFilter === 'Newest') {
      return true;
    } else {
      return true;
    }
  });

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e9c46a] to-[#f4a261]">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <section className="mb-10 text-center px-4 sm:px-0">
          <h1 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            <span className="typewriter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">Find and Share Code Solutions</span>
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-gray-700 text-lg">
            Search for coding questions or share your knowledge by adding new code snippets with explanations.
          </p>
          <div className="mx-auto flex max-w-2xl items-center px-4 sm:px-0">
            <div className="relative w-full bg-white/80 backdrop-blur-sm rounded-lg border-2 border-black shadow-lg">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by title or tags (e.g., 'python' or 'list')"
                className="w-full pl-10 text-lg py-6"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-0">
          {/* Guidelines (Left) */}
          <div className="order-1 md:order-1">
            <GuidelinesSidebar />
          </div>

          {/* Community Posts (Center) */}
          <div className="order-3 md:order-2 flex flex-col gap-6">
            {/* Filtering Bar */}
            <div className="flex items-center border-2 border-black rounded-lg py-1 px-1 bg-white/90 backdrop-blur-sm divide-x divide-gray-300 shadow-lg">
              <button
                className={`flex-1 text-center px-2 sm:px-3 py-1 text-sm font-medium transition-all duration-200 ${currentFilter === 'Newest' ? 'bg-gray-200 font-semibold text-gray-800' : 'text-gray-600 hover:bg-gray-100'} first:rounded-l-md last:rounded-r-md focus:outline-none focus:z-10`}
                onClick={() => handleFilterChange('Newest')}
              >
                Newest
              </button>
              <button
                className={`flex-1 text-center px-2 sm:px-3 py-1 text-sm font-medium transition-all duration-200 ${currentFilter === 'Unanswered' ? 'bg-gray-200 font-semibold text-gray-800' : 'text-gray-600 hover:bg-gray-100'} xl:block hidden focus:outline-none focus:z-10`}
                onClick={() => handleFilterChange('Unanswered')}
              >
                Unanswered
              </button>
              <button
                className={`flex-1 text-center px-2 sm:px-3 py-1 text-sm font-medium transition-all duration-200 ${currentFilter === 'Active' ? 'bg-gray-200 font-semibold text-gray-800' : 'text-gray-600 hover:bg-gray-100'} first:rounded-l-md last:rounded-r-md focus:outline-none focus:z-10`}
                onClick={() => handleFilterChange('Active')}
              >
                Active
              </button>
              <button
                className={`flex-1 text-center px-2 sm:px-3 py-1 text-sm font-medium transition-all duration-200 ${currentFilter === 'Bountied' ? 'bg-gray-200 font-semibold text-gray-800' : 'text-gray-600 hover:bg-gray-100'} flex items-center justify-center first:rounded-l-md last:rounded-r-md focus:outline-none focus:z-10`}
                onClick={() => handleFilterChange('Bountied')}
              >
                All <span className="ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full bg-blue-500 text-white shadow-sm">{formatCount(totalCommunityPostCount)}</span>
              </button>
              <button
                className={`flex-1 text-center px-2 sm:px-3 py-1 text-sm font-medium transition-all duration-200 ${currentFilter === 'Doubts' ? 'bg-gray-200 font-semibold text-gray-800' : 'text-gray-600 hover:bg-gray-100'} first:rounded-l-md last:rounded-r-md focus:outline-none focus:z-10`}
                onClick={() => handleFilterChange('Doubts')}
              >
                Doubts
              </button>
            </div>

            <div className="space-y-6">
              {loadingPosts ? (
                <div className="text-center py-8 text-gray-600">Loading posts...</div>
              ) : filteredAndSortedPosts.length > 0 ? (
                filteredAndSortedPosts.map(question => (
                  <QuestionCard
                    key={question.id}
                    id={question.id}
                    title={question.title}
                    tags={question.tags}
                    votes={question.votes}
                    downvotes={question.downvotes}
                    date={question._creationTime ? new Date(question._creationTime).toLocaleDateString() : 'N/A'}
                    codeVisible={false}
                    code={question.code}
                    answer={question.answer}
                    user={question.user as any}
                    authorId={question.authorId}
                    active={question.active}
                    type={question.type as "doubt" | "post" | undefined}
                  />
                ))
              ) : (!searchQuery ? (
                <div className="text-center py-8 text-gray-600">No posts available yet.</div>
              ) : (
                <div className="text-center py-8 text-gray-600">No posts found matching your search.</div>
              ))}
            </div>
          </div>

          {/* Your Posts (Right) */}
          <div className="order-2 md:order-3 flex flex-col gap-6">
            {/* Add New Post form */}
            {user && (
              <div className="rounded-lg border-2 border-black bg-white/90 backdrop-blur-sm p-6 mb-2 shadow-lg transition-all duration-200 hover:shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Add a New Post</h2>
                <div className="mb-4">
                  <label htmlFor="your-question-title" className="mb-1 block text-sm font-medium text-gray-700">
                    Question Title
                  </label>
                  <Input
                    id="your-question-title"
                    placeholder="E.g., How to reverse a list in Python?"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="border-2 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="your-code-snippet" className="mb-1 block text-sm font-medium text-gray-700">
                    Code Snippet
                  </label>
                  <Textarea
                    id="your-code-snippet"
                    className="h-32 w-full rounded-md border-2 border-gray-300 p-3 text-sm font-mono focus:border-blue-500 transition-colors duration-200"
                    placeholder="Paste your code here..."
                    value={newPostCode}
                    onChange={(e) => setNewPostCode(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="your-explanation" className="mb-1 block text-sm font-medium text-gray-700">
                    Explanation / Answer
                  </label>
                  <Textarea
                    id="your-explanation"
                    className="h-32 w-full rounded-md border-2 border-gray-300 p-3 text-sm focus:border-blue-500 transition-colors duration-200"
                    placeholder="Explain how the code works..."
                    value={newPostAnswer}
                    onChange={(e) => setNewPostAnswer(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="your-tags" className="mb-1 block text-sm font-medium text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <Input
                    id="your-tags"
                    placeholder="E.g., python, list, slicing"
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                    className="border-2 focus:border-blue-500 transition-colors duration-200"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Add relevant tags separated by commas (e.g., "python, list, sorting")
                  </p>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
                  onClick={handleSubmitNewPost}
                  disabled={isSubmittingPost}
                >
                  {isSubmittingPost ? "Adding Post..." : "Add Post"}
                </Button>
              </div>
            )}

            {/* Add New Doubt form */}
            {user && (
              <div className="rounded-lg border-2 border-black bg-white/90 backdrop-blur-sm p-6 mb-2 shadow-lg transition-all duration-200 hover:shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Post a Doubt</h2>
                <div className="mb-4">
                  <label htmlFor="your-doubt-title" className="mb-1 block text-sm font-medium text-gray-700">
                    Doubt Title
                  </label>
                  <Input
                    id="your-doubt-title"
                    placeholder="E.g., Why is this Python code slow?"
                    value={newDoubtTitle}
                    onChange={(e) => setNewDoubtTitle(e.target.value)}
                    className="border-2 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="your-doubt-description" className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Textarea
                    id="your-doubt-description"
                    className="h-32 w-full rounded-md border-2 border-gray-300 p-3 text-sm focus:border-blue-500 transition-colors duration-200"
                    placeholder="Explain your problem or question here..."
                    value={newDoubtDescription}
                    onChange={(e) => setNewDoubtDescription(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="your-doubt-tags" className="mb-1 block text-sm font-medium text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <Input
                    id="your-doubt-tags"
                    placeholder="E.g., python, performance, loop"
                    value={newDoubtTags}
                    onChange={(e) => setNewDoubtTags(e.target.value)}
                    className="border-2 focus:border-blue-500 transition-colors duration-200"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Add relevant tags separated by commas
                  </p>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
                  onClick={handleSubmitNewDoubt}
                  disabled={isSubmittingDoubt || !newDoubtTitle.trim() || !newDoubtDescription.trim()}
                >
                  {isSubmittingDoubt ? 'Posting...' : 'Post Doubt'}
                </Button>
              </div>
            )}

            {/* Your Posts Card */}
            {user && (
              <div className="rounded-lg border-2 border-black bg-white/90 backdrop-blur-sm p-6 shadow-lg transition-all duration-200 hover:shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Your Posts</h2>
                {loadingUserPosts ? (
                  <div className="text-center py-4 text-gray-600">Loading your posts...</div>
                ) : userPosts.length > 0 ? (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {userPosts.map((post) => (
                      <QuestionCard
                        key={post.id}
                        id={post.id}
                        title={post.title}
                        tags={post.tags}
                        votes={post.votes}
                        downvotes={post.downvotes}
                        date={post._creationTime ? new Date(post._creationTime).toLocaleDateString() : 'N/A'}
                        codeVisible={true}
                        code={post.code}
                        answer={post.answer}
                        user={post.user as any}
                        authorId={post.authorId}
                        active={post.active}
                        type={post.type as "doubt" | "post" | undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-600">You haven't posted anything yet.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t-4 border-black bg-white/90 backdrop-blur-sm py-8 px-4 sm:px-6 lg:px-8 shadow-[0_-4px_0_#222]">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-700 mb-2">© 2025 CoderNautics. All rights reserved.</p>
          <p className="text-gray-600">
            Visit Developer's Portfolio:
            <a
              href="https://aryankaul.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
            >
              aryankaul.netlify.app
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
