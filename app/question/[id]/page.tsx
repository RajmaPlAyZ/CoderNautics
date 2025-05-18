"use client"

import { useAuth } from "@/components/AuthProvider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addComment, Comment, getComments } from "@/lib/comments"
import { getPostById, isPostSaved, Post, savePost, unsavePost } from "@/lib/posts"
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Copy } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function QuestionPage({ params }: { params: { id: string } }) {
  const questionId = params.id
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [savedPostId, setSavedPostId] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [post, setPost] = useState<Post | null>(null)
  const [loadingPost, setLoadingPost] = useState(true)

  useEffect(() => {
    loadComments()
    if (user) {
      checkIfSaved()
    }
    loadPost()
  }, [questionId, user])

  const loadComments = async () => {
    try {
      const fetchedComments = await getComments(questionId)
      setComments(fetchedComments)
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }

  const checkIfSaved = async () => {
    if (!user) return
    try {
      const saved = await isPostSaved(user.uid, questionId)
      setIsSaved(saved)
    } catch (error) {
      console.error("Error checking if post is saved:", error)
    }
  }

  const handleSavePost = async () => {
    if (!user) return

    try {
      if (isSaved) {
        if (savedPostId) {
          await unsavePost(savedPostId)
          setIsSaved(false)
          setSavedPostId(null)
        }
      } else {
        const savedPost = await savePost(user.uid, questionId)
        setIsSaved(true)
        setSavedPostId(savedPost.id)
      }
    } catch (error) {
      console.error("Error saving/unsaving post:", error)
    }
  }

  const getAuthorName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.username) return user.username;
    if (user?.uid) return user.uid.slice(0, 8);
    return 'Anonymous';
  }

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return

    setIsSubmitting(true)
    try {
      const comment = await addComment(
        questionId,
        newComment.trim(),
        user.uid,
        getAuthorName()
      )
      setComments([comment, ...comments])
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadPost = async () => {
    try {
      setLoadingPost(true);
      const fetchedPost = await getPostById(questionId);
      setPost(fetchedPost);
    } catch (error) {
      console.error("Error loading post:", error);
      setPost(null); // Set post to null on error
    } finally {
      setLoadingPost(false);
    }
  }

  const handleCopyCode = () => {
    if (post?.code) {
      navigator.clipboard.writeText(post.code)
        .then(() => {
          setCopyFeedback("Copied!");
          setTimeout(() => setCopyFeedback(null), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy code: ", err);
          setCopyFeedback("Failed to copy");
          setTimeout(() => setCopyFeedback(null), 2000);
        });
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">


        <div className="rounded-lg border bg-white shadow-sm">
        <div className="mb-2 p-4">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Back to questions
          </Link>
        </div>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <button className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100" title="Upvote">
                  <ChevronUp className="h-5 w-5" />
                </button>
                <span className="py-1 text-sm font-medium">{post?.votes || 0}</span>
                <button className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100" title="Downvote">
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h1 className="mb-2 text-2xl font-semibold text-gray-900">{post?.title || 'Loading...'}</h1>
                  {user && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSavePost}
                      className="flex items-center gap-2 border-2 hover:bg-gray-100"
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">Saved</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-5 w-5" />
                          <span className="font-medium">Save</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {post?.tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-gray-500">Added on {post?.date ? new Date(post.date).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="border-t px-6 py-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium">Code</h2>
              <div className="relative">
                <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy code</span>
                </Button>
                {copyFeedback && (
                  <div className="absolute top-full right-0 mt-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md shadow-sm">
                    {copyFeedback}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-md bg-gray-900 p-4">
              <pre className="overflow-x-auto text-sm text-gray-100">
                <code>{post?.code}</code>
              </pre>
            </div>
          </div>

          <div className="border-t px-6 py-4">
            <h2 className="mb-4 font-medium">Answer</h2>
            <div className="prose max-w-none text-gray-700">
              <p>{post?.answer}</p>
            </div>
          </div>

          <div className="border-t px-6 py-4">
            <h2 className="mb-2 font-medium">Comments</h2>
            <div className="max-h-[200px] overflow-y-auto pr-2">
              {comments.length > 0 ? (
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="rounded-md border p-2">
                      <p className="text-sm text-gray-700">{comment.text}</p>
                      <div className="mt-1 text-xs text-gray-500">
                        Posted by {comment.authorName} on {comment.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500">No comments yet. Be the first to comment!</p>
              )}
            </div>
            <div className="mt-3">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2 min-h-[60px] w-full resize-none"
              />
              <Button
                size="sm"
                className="ml-auto"
                onClick={handleSubmitComment}
                disabled={!user || !newComment.trim() || isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2025 CodeQ&A. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
