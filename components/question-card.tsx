"use client"

import { useAuth } from "@/components/AuthProvider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Comment, addComment, getComments } from "@/lib/comments"
import { deletePost, getSavedPosts, getVoteForPost, isPostSaved, recordVote, removeVote, savePost, unsavePost, updatePost, updatePostStatus, updateVote } from "@/lib/posts"
import MonacoEditor from '@monaco-editor/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Compass, Copy, MinusCircle, Ship, Star } from "lucide-react"
import { useEffect, useRef, useState } from "react"

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
    username: string
    avatar_url: string | null
    email?: string
    points?: number
  }
  answer?: string
  authorId: string
  active?: boolean
  type?: 'post' | 'doubt'
  onDelete?: () => Promise<void>
  onUnsave?: () => Promise<void>
}

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
  onDelete,
  onUnsave,
}: QuestionCardProps) {
  const [showCode, setShowCode] = useState(true)
  const [showAnswer, setShowAnswer] = useState(true)
  const [comment, setComment] = useState("")
  const [localVotes, setLocalVotes] = useState(votes)
  const [voteAnimation, setVoteAnimation] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCry, setShowCry] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user: currentUser } = useAuth()
  const [isSaved, setIsSaved] = useState(false)
  const [savedPostId, setSavedPostId] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [userVoteId, setUserVoteId] = useState<string | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedCode, setEditedCode] = useState(code);
  const [editedAnswer, setEditedAnswer] = useState(answer);
  const [editedTags, setEditedTags] = useState(tags.join(', ')); // Convert tags array to string for editing

  // For confetti size/position
  const [confettiDims] = useState<{width: number, height: number}>({width: 350, height: 200});
  const upvoteRef = useRef<HTMLButtonElement>(null)

  const isAuthor = currentUser && currentUser.uid === authorId;

  const [isPostActive, setIsPostActive] = useState(active);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const editorRef = useRef(null)

  // Helper function to get rank badge based on points
  const getRankBadge = (points?: number) => {
    if (points === undefined || points === null) {
      return null; // Or a default badge if needed
    }

    let rankText = '';
    let bgColor = '';
    let textColor = '';
    let borderColor = 'border-black'; // Add border color
    let Icon = null;

    if (points >= 0 && points <= 50) {
      rankText = 'Novice';
      bgColor = 'bg-gray-200'; // Brighter gray
      textColor = 'text-gray-800';
      Icon = MinusCircle;
    } else if (points >= 51 && points <= 200) {
      rankText = 'Explorer';
      bgColor = 'bg-green-200'; // Brighter green
      textColor = 'text-green-800';
      Icon = Compass;
    } else if (points >= 201 && points <= 500) {
      rankText = 'Navigator';
      bgColor = 'bg-blue-200'; // Brighter blue
      textColor = 'text-blue-800';
      Icon = Ship;
    } else if (points >= 501) {
      rankText = 'Captain';
      bgColor = 'bg-purple-200'; // Brighter purple
      textColor = 'text-purple-800';
      Icon = Star;
    }

    if (!rankText) return null;

    return (
      <Badge className={`flex items-center gap-1 rounded-md border border-black ${bgColor} ${textColor} px-2.5 py-1 text-xs font-bold`}>
        {Icon && <Icon className="h-3 w-3" />} {}{/* Render Icon */}
        {rankText}
      </Badge>
    );
  };

  useEffect(() => {
    loadComments()
    if (currentUser) {
      checkIfSaved()
      checkUserVote();
    }
  }, [id, currentUser])

  const loadComments = async () => {
    try {
      const fetchedComments = await getComments(id)
      setComments(fetchedComments)
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }

  const checkUserVote = async () => {
    if (!currentUser) return;
    try {
      const vote = await getVoteForPost(currentUser.uid, id);
      if (vote) {
        setUserVote(vote.type);
        setUserVoteId(vote.id || null);
      } else {
        setUserVote(null);
        setUserVoteId(null);
      }
    } catch (error) {
      console.error("Error checking user vote:", error);
    }
  };

  const getAuthorName = () => {
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.username) return currentUser.username;
    if (currentUser?.uid) return currentUser.uid.slice(0, 8);
    return 'Anonymous';
  }

  const handleSubmitComment = async () => {
    if (!currentUser || !comment.trim()) return

    setIsSubmitting(true)
    try {
      const newComment = await addComment(
        id,
        comment.trim(),
        currentUser.uid,
        getAuthorName()
      )
      setComments([newComment, ...comments])
      setComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpvote = async () => {
    if (!currentUser) return; // Prevent voting if not logged in

    try {
      const existingVote = userVote;
      const existingVoteId = userVoteId;

      if (existingVote === "upvote") {
        // User is trying to upvote again, remove the upvote
        setLocalVotes((v) => v - 1);
        setUserVote(null);
        setUserVoteId(null);
        await removeVote(existingVoteId!, id, "upvote");
      } else if (existingVote === "downvote") {
        // User is changing downvote to upvote
        setLocalVotes((v) => v + 2); // Remove downvote (-1) + add upvote (+1) = +2
        setUserVote("upvote");
        await updateVote(existingVoteId!, id, "upvote", "downvote");
      } else {
        // User has not voted, record upvote
        setLocalVotes((v) => v + 1);
        setUserVote("upvote");
        // We don't set userVoteId here, will be fetched on next load or could be returned by recordVote
        await recordVote(currentUser.uid, id, "upvote");
      }

      // Trigger animation regardless of the vote change type for visual feedback
      setVoteAnimation(true);
      setShowConfetti(true);
      setTimeout(() => setVoteAnimation(false), 300);
      setTimeout(() => setShowConfetti(false), 1000);

      // Re-fetch vote status to get the correct userVoteId if a new vote was recorded
      checkUserVote();

    } catch (error) {
      console.error("Error handling upvote:", error);
      // Basic error handling: could revert local state here if needed
    }
  };

  const handleDownvote = async () => {
    if (!currentUser) return; // Prevent voting if not logged in

    try {
      const existingVote = userVote;
      const existingVoteId = userVoteId;

      if (existingVote === "downvote") {
        // User is trying to downvote again, remove the downvote
        setLocalVotes((v) => v + 1);
        setUserVote(null);
        setUserVoteId(null);
        await removeVote(existingVoteId!, id, "downvote");
      } else if (existingVote === "upvote") {
        // User is changing upvote to downvote
        setLocalVotes((v) => v - 2); // Remove upvote (+1) + add downvote (-1) = -2
        setUserVote("downvote");
        await updateVote(existingVoteId!, id, "downvote", "upvote");
      } else {
        // User has not voted, record downvote
        setLocalVotes((v) => v - 1);
        setUserVote("downvote");
        // We don't set userVoteId here, will be fetched on next load or could be returned by recordVote
        await recordVote(currentUser.uid, id, "downvote");
      }

      // Trigger animation regardless of the vote change type for visual feedback
      setVoteAnimation(true);
      setShowCry(true);
      setTimeout(() => setVoteAnimation(false), 300);
      setTimeout(() => setShowCry(false), 1200);

      // Re-fetch vote status to get the correct userVoteId if a new vote was recorded
      checkUserVote();

    } catch (error) {
      console.error("Error handling downvote:", error);
      // Basic error handling: could revert local state here if needed
    }
  };

  const checkIfSaved = async () => {
    if (!currentUser) return
    try {
      const saved = await isPostSaved(currentUser.uid, id)
      setIsSaved(saved)
    } catch (error) {
      console.error("Error checking if post is saved:", error)
    }
  }

  const handleSavePost = async () => {
    if (!currentUser) return

    try {
      if (isSaved) {
        if (savedPostId) {
          await unsavePost(savedPostId)
          setIsSaved(false)
          setSavedPostId(null)
        } else {
          // If isSaved is true but savedPostId is null, try to find the savedPostId
          const savedPosts = await getSavedPosts(currentUser.uid);
          const currentSavedPost = savedPosts.find(post => post.questionId === id);
          if(currentSavedPost) {
            await unsavePost(currentSavedPost.id);
            setIsSaved(false);
            setSavedPostId(null);
          }
        }
      } else {
        const savedPost = await savePost(currentUser.uid, id)
        setIsSaved(true)
        setSavedPostId(savedPost.id)
      }
    } catch (error) {
      console.error("Error saving/unsaving post:", error)
    }
  }

  const handleCopyCode = () => {
    if (!code) return; // Prevent copying if no code exists
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

  // Edit handlers
  const handleEditClick = () => {
    // Allow edit for author of any post type, or any logged-in user for doubts
    if (type === 'post' && !isAuthor) return;
    if (type === 'doubt' && !currentUser) return; // Only logged-in users can edit doubts

    setIsEditing(true);
    setEditedTitle(title);
    setEditedCode(code);
    setEditedAnswer(answer);
    setEditedTags(tags.join(', '));
  };

  const handleSaveEdit = async () => {
    // Allow save for author of any post type, or any logged-in user for doubts
    if (type === 'post' && !isAuthor) return; // Only author can save edits for posts
    if (type === 'doubt' && !currentUser) return; // Only logged-in users can save edits for doubts

    setIsSubmitting(true); // Reuse submitting state for edit saving
    try {
      const tagsArray = editedTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      const updatedData = {
        title: editedTitle,
        code: editedCode || undefined, // Use undefined for empty optional fields
        answer: editedAnswer || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      };

      await updatePost(id, updatedData);

      // Optionally, update local state or refetch post data
      // For simplicity, we can just set isEditing to false and rely on a page refresh or parent component state update
      setIsEditing(false);
      // Hit refresh after save changes
      window.location.reload();
      // Consider adding feedback to the user that the save was successful

    } catch (error: any) {
      console.error("Error saving edit:", error);
      let errorMessage = "Failed to save changes.";
      if (error.code === 'not-found') {
        errorMessage = "This post may have been deleted. Please refresh the page.";
      }
      alert(errorMessage); // Provide user feedback on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Optionally, revert edited states to original post values if needed
  };

  const handleToggleActive = async () => {
    if (!currentUser || !isAuthor) return;
    
    setIsUpdatingStatus(true);
    try {
      const newStatus = !isPostActive;
      await updatePostStatus(id, newStatus);
      setIsPostActive(newStatus);
    } catch (error) {
      console.error("Error updating post status:", error);
      // Optionally show an error message to the user
    } finally {
      setIsUpdatingStatus(false);
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
          <div className="flex flex-row sm:flex-col items-center justify-center sm:justify-start gap-4 sm:gap-2">
            <motion.button
              whileTap={{ scale: 1.2, rotate: -10 }}
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-yellow-700 bg-yellow-300 border-4 border-black shadow-[0_4px_0_#222] hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              title="Upvote"
              onClick={handleUpvote}
              ref={upvoteRef}
              disabled={userVote === "upvote"}
            >
              <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.button>
            <motion.span
              className="py-0 sm:py-1 text-sm sm:text-base font-extrabold text-pink-700"
              animate={voteAnimation ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {localVotes}
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
                {/* Edit Button */}
                <button
                  onClick={handleEditClick}
                  className="flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100"
                  title="Edit Post"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 0 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                </button>
                {/* Delete Button (only for author) */}
                {isAuthor && (
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this post?')) {
                        try {
                          await deletePost(id);
                          window.location.reload();
                        } catch (error) {
                          console.error("Error deleting post:", error);
                          alert("Failed to delete post.");
                        }
                      }
                    }}
                    className="flex items-center justify-center h-8 w-8 rounded-md text-red-500 hover:bg-red-100"
                    title="Delete Post"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/><line x1="18" x2="12" y1="9" y2="15"/><line x1="12" x2="18" y1="9" y2="15"/></svg>
                  </button>
                )}
              </div>
            )}
            {isAuthor && (
              <button
                onClick={handleToggleActive}
                disabled={isUpdatingStatus}
                className={`flex items-center justify-center h-8 w-auto px-2 rounded-md text-sm ${isPostActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'} hover:${isPostActive ? 'bg-green-300' : 'bg-red-300'}`}
                title={isPostActive ? "Mark as Inactive" : "Mark as Active"}
              >
                {isPostActive ? "Active" : "Inactive"}
              </button>
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
          {code !== undefined && ( // Only show code editor if code exists
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
          {answer !== undefined && ( // Only show answer editor if answer exists
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
          {tags !== undefined && ( // Only show tags input if tags exist
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
                    <MonacoEditor
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
                        <div>on {comment.createdAt.toLocaleDateString()}</div>
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
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-2 min-h-[60px] w-full resize-none"
              />
              <Button
                size="sm"
                className="ml-auto"
                onClick={handleSubmitComment}
                disabled={!currentUser || !comment.trim() || isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* User and date information moved to bottom */}
      <div className="pb-6 px-3 sm:px-4 md:px-5">
        {/* Container for Avatar and stacked Username/Date */}
        <div className="mt-4 pt-4 border-t-2 border-gray-200 flex items-start gap-2">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="h-8 w-8 rounded-full border-2 border-black flex-shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-gray-600">
                {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          {/* Username, Rank Badge, and Date stacked vertically */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-gray-900 font-comic break-words">
                {user?.username || 'Anonymous'}
              </span>
              {/* Insert Rank Badge here */}
              {getRankBadge(user?.points)}
              <span className="text-sm text-gray-500 hidden sm:inline">•</span>
            </div>
            <div className="text-sm text-blue-500 font-semibold">Posted on {date}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
