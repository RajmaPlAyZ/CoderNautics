"use client"

import { useAuth } from "@/components/AuthProvider"
import CodeEditor from "@/components/CodeEditor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Compass, Copy, MinusCircle, Ship, Star } from "lucide-react"
import { useState, useRef } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

interface QuestionCardProps {
  id: string
  title: string
  tags: string[]
  votes: number
  downvotes: number
  date: string
  codeVisible?: boolean
  code?: string
  user?: {
    username?: string | null
    avatar_url?: string | null
    email?: string | null
    points?: number
  }
  answer?: string
  authorId: string
  active?: boolean
  type?: 'post' | 'doubt'
  onUnsave?: () => void
  onDelete?: () => void
}

// Helper function to get rank badge based on points
export const getRankBadge = (points?: number) => {
  if (points === undefined || points === null) {
    return null;
  }

  let rankText = '';
  let bgColor = '';
  let textColor = '';
  let Icon = null;

  if (points >= 0 && points <= 50) {
    rankText = 'Novice';
    bgColor = 'bg-gray-200';
    textColor = 'text-gray-800';
    Icon = MinusCircle;
  } else if (points >= 51 && points <= 200) {
    rankText = 'Explorer';
    bgColor = 'bg-green-200';
    textColor = 'text-green-800';
    Icon = Compass;
  } else if (points >= 201 && points <= 500) {
    rankText = 'Navigator';
    bgColor = 'bg-blue-200';
    textColor = 'text-blue-800';
    Icon = Ship;
  } else if (points >= 501) {
    rankText = 'Captain';
    bgColor = 'bg-purple-200';
    textColor = 'text-purple-800';
    Icon = Star;
  }

  if (!rankText) return null;

  return (
    <Badge className={`flex items-center gap-1 rounded-md border border-black ${bgColor} ${textColor} px-2.5 py-1 text-xs font-bold`}>
      {Icon && <Icon className="h-3 w-3" />}
      {rankText}
    </Badge>
  );
};

export default function QuestionCard({
  id,
  title,
  tags,
  votes,
  downvotes,
  date,
  codeVisible = false,
  code = "",
  user,
  answer,
  authorId,
  active = true,
  type,
}: QuestionCardProps) {
  const [showCode, setShowCode] = useState(true)
  const [showAnswer, setShowAnswer] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [voteAnimation, setVoteAnimation] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCry, setShowCry] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user: currentUser } = useAuth()
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedCode, setEditedCode] = useState(code);
  const [editedAnswer, setEditedAnswer] = useState(answer);
  const [editedTags, setEditedTags] = useState(tags.join(', '));

  const postId = id as Id<"questions">;

  // Convex Queries
  const comments = useQuery(api.comments.getByQuestionId, { questionId: postId }) || [];
  const userVoteObj = useQuery(api.votes.getVoteForPost, currentUser ? { postId } : "skip");
  const isSaved = useQuery(api.savedPosts.isPostSaved, currentUser ? { questionId: postId } : "skip");
  const savedPosts = useQuery(api.savedPosts.getSavedPosts, currentUser ? {} : "skip");

  // Convex Mutations
  const addComment = useMutation(api.comments.addComment);
  const recordVote = useMutation(api.votes.recordVote);
  const updateVote = useMutation(api.votes.updateVote);
  const removeVote = useMutation(api.votes.removeVote);
  const savePost = useMutation(api.savedPosts.savePost);
  const unsavePost = useMutation(api.savedPosts.unsavePost);
  const updatePost = useMutation(api.posts.updatePost);
  const updatePostStatus = useMutation(api.posts.updatePostStatus);
  const deletePost = useMutation(api.posts.deletePost);

  const isAuthor = currentUser && currentUser.uid === authorId;
  const userVote = userVoteObj?.type || null;
  const userVoteId = userVoteObj?.id || null;

  const getAuthorName = () => {
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.username) return currentUser.username;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'Anonymous';
  }

  const handleSubmitComment = async () => {
    if (!currentUser || !commentText.trim()) return

    setIsSubmitting(true)
    try {
      await addComment({
        questionId: postId,
        text: commentText.trim(),
        authorName: getAuthorName()
      })
      setCommentText("")
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const triggerVoteAnimation = (type: 'up' | 'down') => {
    setVoteAnimation(true);
    if (type === 'up') setShowConfetti(true);
    else setShowCry(true);

    setTimeout(() => setVoteAnimation(false), 300);
    setTimeout(() => {
      if (type === 'up') setShowConfetti(false);
      else setShowCry(false);
    }, type === 'up' ? 1000 : 1200);
  }

  const handleUpvote = async () => {
    if (!currentUser) return;

    try {
      if (userVote === "upvote" && userVoteId) {
        await removeVote({ voteId: userVoteId as Id<"votes">, postId, type: "upvote" });
      } else if (userVote === "downvote" && userVoteId) {
        await updateVote({ voteId: userVoteId as Id<"votes">, postId, newType: "upvote", oldType: "downvote" });
      } else {
        await recordVote({ postId, type: "upvote" });
      }
      triggerVoteAnimation('up');
    } catch (error) {
      console.error("Error handling upvote:", error);
    }
  };

  const handleDownvote = async () => {
    if (!currentUser) return;

    try {
      if (userVote === "downvote" && userVoteId) {
        await removeVote({ voteId: userVoteId as Id<"votes">, postId, type: "downvote" });
      } else if (userVote === "upvote" && userVoteId) {
        await updateVote({ voteId: userVoteId as Id<"votes">, postId, newType: "downvote", oldType: "upvote" });
      } else {
        await recordVote({ postId, type: "downvote" });
      }
      triggerVoteAnimation('down');
    } catch (error) {
      console.error("Error handling downvote:", error);
    }
  };

  const handleSavePost = async () => {
    if (!currentUser) return

    try {
      if (isSaved) {
        const savedPostEntry = savedPosts?.find(p => p.questionId === postId)
        if (savedPostEntry) {
          await unsavePost({ savedPostId: savedPostEntry.id as Id<"savedPosts"> })
        }
      } else {
        await savePost({ questionId: postId })
      }
    } catch (error) {
      console.error("Error saving/unsaving post:", error)
    }
  }

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopyFeedback("Copied!");
        setTimeout(() => setCopyFeedback(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy code: ", err);
        setCopyFeedback("Failed to copy");
        setTimeout(() => setCopyFeedback(null), 2000);
      });
  };

  const handleEditClick = () => {
    if (type === 'post' && !isAuthor) return;
    if (type === 'doubt' && !currentUser) return;

    setIsEditing(true);
    setEditedTitle(title);
    setEditedCode(code);
    setEditedAnswer(answer);
    setEditedTags(tags.join(', '));
  };

  const handleSaveEdit = async () => {
    if (type === 'post' && !isAuthor) return;
    if (type === 'doubt' && !currentUser) return;

    setIsSubmitting(true);
    try {
      const tagsArray = editedTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      await updatePost({
        id: postId,
        title: editedTitle,
        code: editedCode || undefined,
        answer: editedAnswer || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });

      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving edit:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleToggleActive = async () => {
    if (!currentUser || !isAuthor) return;

    try {
      await updatePostStatus({ id: postId, active: !active });
    } catch (error) {
      console.error("Error updating post status:", error);
    }
  };

  return (
    <motion.div
      className={`rounded-3xl border-4 border-black ${type === 'doubt' ? 'bg-blue-50' : 'bg-[#fffbe7]'} shadow-[0_6px_0_#222] transition-transform duration-200 hover:scale-105 hover:-rotate-1 mb-6 font-comic will-change-transform pb-4`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <div className="p-3 sm:p-4 md:p-5">
        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 md:gap-4">
          <div className="flex flex-row sm:flex-col items-center justify-center sm:justify-start gap-4 sm:gap-2 relative">
            <motion.button
              whileTap={{ scale: 1.2, rotate: -10 }}
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-yellow-700 bg-yellow-300 border-4 border-black shadow-[0_4px_0_#222] hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              title="Upvote"
              onClick={handleUpvote}
              disabled={userVote === "upvote"}
            >
              <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.button>
            <motion.span
              className="py-0 sm:py-1 text-sm sm:text-base font-extrabold text-pink-700"
              animate={voteAnimation ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {votes}
            </motion.span>
            <motion.button
              whileTap={{ scale: 1.2, rotate: 10 }}
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-blue-700 bg-blue-200 border-4 border-black shadow-[0_4px_0_#222] hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              title="Downvote"
              onClick={handleDownvote}
              disabled={userVote === "downvote"}
            >
              <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.button>
            {showCry && (
              <motion.span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none text-2xl sm:text-4xl select-none"
                initial={{ opacity: 0, y: 10, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.7 }}
                transition={{ duration: 0.5 }}
              >
                😢
              </motion.span>
            )}
            {showConfetti && (
              <motion.span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none text-2xl sm:text-4xl select-none"
                initial={{ opacity: 0, y: -10, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.7 }}
                transition={{ duration: 0.5 }}
              >
                🎉
              </motion.span>
            )}
          </div>
          <div className="flex-1 w-full">
            <h3 className="mb-1 sm:mb-2 text-base sm:text-lg font-extrabold text-pink-700 flex items-center gap-1 sm:gap-2 font-comic">
              <span role="img" aria-label="sparkles">✨</span> {title}
            </h3>
            <div className="mb-2 sm:mb-3 flex flex-wrap gap-1 sm:gap-2 mt-1">
              {tags.map((tag) => (
                <Badge key={tag} className="rounded-full px-2 py-0.5 text-xs font-bold shadow-[0_2px_0_#222] bg-yellow-200 text-yellow-800 border-2 border-black font-comic" >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentUser && (
              <button
                onClick={handleSavePost}
                className="flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100"
                title={isSaved ? "Unsave Post" : "Save Post"}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-5 w-5 text-blue-500" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </button>
            )}
            {(isAuthor || (type === 'doubt' && currentUser)) && !isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEditClick}
                  className="flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100"
                  title="Edit Post"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 0 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                </button>
                {isAuthor && (
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this post?')) {
                        try {
                          await deletePost({ id: postId });
                        } catch (error) {
                          console.error("Error deleting post:", error);
                          alert("Failed to delete post.");
                        }
                      }
                    }}
                    className="flex items-center justify-center h-8 w-8 rounded-md text-red-500 hover:bg-red-100"
                    title="Delete Post"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" /><line x1="18" x2="12" y1="9" y2="15" /><line x1="12" x2="18" y1="9" y2="15" /></svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="p-3 sm:p-4 md:p-5 border-t">
          <h2 className="mb-4 text-xl font-bold">Edit Post</h2>
          <div className="mb-4">
            <label htmlFor="edit-question-title" className="mb-1 block text-sm font-medium">
              Question Title
            </label>
            <input
              id="edit-question-title"
              type="text"
              className="w-full rounded-md border-2 border-black p-2"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
          </div>
          {code !== undefined && (
            <div className="mb-4">
              <label htmlFor="edit-code-snippet" className="mb-1 block text-sm font-medium">
                Code Snippet
              </label>
              <Textarea
                id="edit-code-snippet"
                className="h-32 w-full rounded-md border-2 border-black p-3 text-sm font-mono"
                placeholder="Paste your code here..."
                value={editedCode}
                onChange={(e) => setEditedCode(e.target.value)}
              />
            </div>
          )}
          {answer !== undefined && (
            <div className="mb-4">
              <label htmlFor="edit-explanation" className="mb-1 block text-sm font-medium">
                Explanation / Answer
              </label>
              <Textarea
                id="edit-explanation"
                className="h-32 w-full rounded-md border-2 border-black p-3 text-sm"
                placeholder="Explain how the code works..."
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
              />
            </div>
          )}
          {tags !== undefined && (
            <div className="mb-4">
              <label htmlFor="edit-tags" className="mb-1 block text-sm font-medium">
                Tags (comma-separated)
              </label>
              <input
                id="edit-tags"
                type="text"
                className="w-full rounded-md border-2 border-black p-2"
                placeholder="E.g., python, list, slicing"
                value={editedTags}
                onChange={(e) => setEditedTags(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Add relevant tags separated by commas
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {code && (
            <div className="border-t px-3 sm:px-4 md:px-5 py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-4 mb-2">
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                >
                  {showCode ? (
                    <>
                      <ChevronUp className="h-4 w-4" /> Hide Code
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" /> Show Code
                    </>
                  )}
                </button>
                <div className="relative w-full sm:w-auto">
                  <button
                    className="flex items-center gap-1 h-auto p-0 text-sm font-medium text-blue-600 hover:underline"
                    onClick={handleCopyCode}
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Code</span>
                  </button>
                  {copyFeedback && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md shadow-sm z-10 whitespace-nowrap">
                      {copyFeedback}
                    </div>
                  )}
                </div>
              </div>
              <AnimatePresence>
                {showCode && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="relative rounded-md bg-gray-900 p-4 will-change-transform translate-z-0"
                  >
                    <CodeEditor
                      height="200px"
                      defaultLanguage="python"
                      value={code}
                      theme="vs-dark"
                      options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="border-t px-3 sm:px-4 md:px-5 py-4">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600"
            >
              <AnimatePresence>
                {showAnswer ? (
                  <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <ChevronUp className="h-4 w-4" /> Hide Answer
                  </motion.span>
                ) : (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <ChevronDown className="h-4 w-4" /> Show Answer
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {answer && (
            <div className="border-t px-3 sm:px-4 md:px-5 py-4">
              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 text-sm text-gray-800 will-change-transform translate-z-0"
                  >
                    {answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="mt-4">
            <h4 className="mb-2 font-medium px-3 sm:px-4 md:px-5">Comments</h4>
            <div className="max-h-[150px] overflow-y-auto pr-2 px-3 sm:px-4 md:px-5">
              {comments.length > 0 ? (
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="rounded-md border p-2">
                      <p className="text-sm text-gray-700">{comment.text}</p>
                      <div className="mt-1 text-xs text-gray-500">
                        <div>Posted by {comment.authorName}</div>
                        <div>on {new Date(comment.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500">No comments yet. Be the first to comment!</p>
              )}
            </div>
            <div className="mt-3 px-3 sm:px-4 md:px-5">
              <Textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="mb-2 min-h-[60px] w-full resize-none"
              />
              <Button
                size="sm"
                className="ml-auto"
                onClick={handleSubmitComment}
                disabled={!currentUser || !commentText.trim() || isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </>
      )}

      <div className="pb-6 px-3 sm:px-4 md:px-5">
        <div className="mt-4 pt-4 border-t-2 border-gray-200 flex items-center justify-between gap-2">
          <div className="flex items-start gap-2">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username || "avatar"}
                className="h-8 w-8 rounded-full border-2 border-black flex-shrink-0 object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-gray-600">
                  {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-gray-900 font-comic break-words">
                  {user?.username || 'Anonymous'}
                </span>
                {getRankBadge(user?.points)}
                <span className="text-sm text-gray-500 hidden sm:inline">•</span>
              </div>
              <div className="text-sm text-blue-500 font-semibold">Posted on {date}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!isAuthor && active && (
              <Badge className="flex items-center justify-center h-8 w-auto px-2 rounded-md text-sm bg-green-200 text-green-800">
                Active
              </Badge>
            )}
            {!isAuthor && !active && (
              <Badge className="flex items-center justify-circle h-8 w-auto px-2 rounded-md text-sm bg-red-200 text-red-800">
                Inactive
              </Badge>
            )}
            {isAuthor && (
              <button
                onClick={handleToggleActive}
                className={`flex items-center justify-center h-8 w-auto px-2 rounded-md text-sm ${active ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'} hover:${active ? 'bg-green-300' : 'bg-red-300'}`}
                title={active ? "Mark as Inactive" : "Mark as Active"}
              >
                {active ? "Active" : "Inactive"}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
