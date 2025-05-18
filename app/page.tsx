"use client";

import { useAuth } from '@/components/AuthProvider';
import GuidelinesSidebar from "@/components/guidelines-sidebar";
import QuestionCard from "@/components/question-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addPost, getAllPosts, getPostsByUserId, getSavedPosts } from "@/lib/posts";
import { Search } from "lucide-react";
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCode, setNewPostCode] = useState('');
  const [newPostAnswer, setNewPostAnswer] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [allPosts, setAllPosts] = useState<any[]>([]); // State to hold all fetched posts
  const [loadingPosts, setLoadingPosts] = useState(true); // Loading state for fetching all posts
  const [userPosts, setUserPosts] = useState<any[]>([]); // State to hold user's posts
  const [loadingUserPosts, setLoadingUserPosts] = useState(true); // Loading state for user's posts

  useEffect(() => {
    setMounted(true);
    if (!loading) { // Load all posts only after auth loading is complete
      loadAllPosts();
    }
  }, [loading]); // Depend on loading state

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (user) {
        setLoadingUserPosts(true);
        try {
          const posts = await getPostsByUserId(user.uid);
          setUserPosts(posts);
          console.log('Fetched user posts:', posts);
        } catch (error) {
          console.error('Error fetching user posts:', error);
        } finally {
          setLoadingUserPosts(false);
        }
      }
    };

    fetchUserPosts();
  }, [user]);

  const loadAllPosts = async () => {
    try {
      setLoadingPosts(true);
      // Fetch saved posts first if user is logged in
      let savedPostIds: string[] = [];
      if (user) {
        const savedPosts = await getSavedPosts(user.uid);
        savedPostIds = savedPosts.map(savedPost => savedPost.questionId);
      }

      const fetchedPosts = await getAllPosts();

      // Filter out saved posts
      const communityPosts = fetchedPosts.filter(post => !savedPostIds.includes(post.id));

      setAllPosts(communityPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Render nothing while authentication status is loading or if not mounted yet
  // We still show the page if no user is logged in, but auth features might be limited.
  if (loading || !mounted) {
    return null;
  }

  const handleSubmitNewPost = async () => {
    if (!user || !newPostTitle.trim()) {
      alert("Please provide a title for your post.");
      return;
    }

    setIsSubmittingPost(true);
    try {
      const tagsArray = newPostTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      const postData = {
        title: newPostTitle.trim(),
        code: newPostCode.trim() || undefined, // Use undefined for empty optional fields
        answer: newPostAnswer.trim() || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      };

      await addPost(postData, user.uid);

      // Clear form and provide feedback (you might want a better UI feedback)
      setNewPostTitle('');
      setNewPostCode('');
      setNewPostAnswer('');
      setNewPostTags('');
      alert("Post added successfully!"); // Simple feedback

      // Refresh both all posts and user posts
      await Promise.all([
        loadAllPosts(),
        getPostsByUserId(user.uid).then(posts => setUserPosts(posts))
      ]);

    } catch (error) {
      console.error("Error adding new post:", error);
      alert("Failed to add post."); // Simple error feedback
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Filter the fetched posts based on the search query
  const filteredPosts = allPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    post.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#e9c46a' }}>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <section className="mb-10 text-center px-4 sm:px-0">
          <h1 className="mb-4 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            <span className="typewriter">Find and Share Code Solutions</span>
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-gray-600">
            Search for coding questions or share your knowledge by adding new code snippets with explanations.
          </p>
          <div className="mx-auto flex max-w-2xl items-center px-4 sm:px-0">
            <div className="relative w-full bg-gray-50 rounded-lg border-2 border-black">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 " />
              <Input
                type="search"
                placeholder="Search by title or tags (e.g., 'python' or 'list')"
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-0">
          {/* Guidelines (Left) */}
          <div className="order-1 md:order-1">
            <GuidelinesSidebar />
          </div>

          {/* Community Posts (Center) */}
          <div className="order-3 md:order-2 flex flex-col gap-6">
            <div className="space-y-6">
              {loadingPosts ? (
                <div>Loading posts...</div> // Show loading indicator
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map(question => (
                  <QuestionCard
                    key={question.id}
                    id={question.id}
                    title={question.title}
                    tags={question.tags}
                    votes={question.votes}
                    downvotes={question.downvotes}
                    date={question.date?.toLocaleDateString() || 'N/A'} // Handle potential date format issues
                    codeVisible={false} // Code initially hidden on home page
                    code={question.code}
                    answer={question.answer} // Pass the answer prop
                    user={question.user} // Pass user data if available in post document
                    authorId={question.authorId} // Pass authorId for conditional rendering
                  />
                ))
              ) : ( !searchQuery ? (
                 <div>No posts available yet.</div> // Message when no posts and no search
              ) : (
                 <div>No posts found matching your search.</div> // Message when no posts match search
              ))
             }
            </div>
          </div>

          {/* Your Posts (Right) */}
          <div className="order-2 md:order-3 flex flex-col gap-6">
            {/* Only show Add New Post form if user is logged in */}
            {user && (
              <div className="rounded-lg border-2 border-black bg-white p-6 mb-2">
                <h2 className="mb-4 text-xl font-bold">Add a New Post</h2>
                <div className="mb-4">
                  <label htmlFor="your-question-title" className="mb-1 block text-sm font-medium">
                    Question Title
                  </label>
                  <Input id="your-question-title" placeholder="E.g., How to reverse a list in Python?" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label htmlFor="your-code-snippet" className="mb-1 block text-sm font-medium">
                    Code Snippet
                  </label>
                  <Textarea
                    id="your-code-snippet"
                    className="h-32 w-full rounded-md border border-gray-300 p-3 text-sm font-mono"
                    placeholder="Paste your code here..."
                    value={newPostCode}
                    onChange={(e) => setNewPostCode(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="your-explanation" className="mb-1 block text-sm font-medium">
                    Explanation / Answer
                  </label>
                  <Textarea
                    id="your-explanation"
                    className="h-32 w-full rounded-md border border-gray-300 p-3 text-sm"
                    placeholder="Explain how the code works..."
                    value={newPostAnswer}
                    onChange={(e) => setNewPostAnswer(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="your-tags" className="mb-1 block text-sm font-medium">
                    Tags (comma-separated)
                  </label>
                  <Input id="your-tags" placeholder="E.g., python, list, slicing" value={newPostTags} onChange={(e) => setNewPostTags(e.target.value)} />
                  <p className="mt-1 text-xs text-gray-500">
                    Add relevant tags separated by commas (e.g., "python, list, sorting")
                  </p>
                </div>
                <Button className="w-full" onClick={handleSubmitNewPost} disabled={isSubmittingPost}>
                  {isSubmittingPost ? "Adding Post..." : "Add Post"}
                </Button>
              </div>
            )}

            {/* Your Posts Card - only visible if user is logged in */}
            {user && (
              <div className="rounded-lg border-2 border-black bg-white p-6">
                <h2 className="mb-4 text-xl font-bold">Your Posts</h2>
                {loadingUserPosts ? (
                  <div className="text-gray-600 text-sm">Loading your posts...</div>
                ) : userPosts.length > 0 ? (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {userPosts.map((post) => {
                      console.log('Rendering user post with ID:', post.id);
                      console.log('Post data for rendering:', post);
                      return (
                        <QuestionCard
                          key={post.id}
                          id={post.id}
                          title={post.title}
                          tags={post.tags}
                          votes={post.votes}
                          downvotes={post.downvotes}
                          date={post.date?.toLocaleDateString() || 'N/A'} // Handle potential date format issues
                          codeVisible={true} // Code initially shown on home page Your Posts
                          code={post.code}
                          answer={post.answer} // Pass the answer prop
                          user={post.user} // Pass user data if available in post document
                          authorId={post.authorId} // Pass authorId
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-600 text-sm">You haven't posted anything yet.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2025 CodeQ&A. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
