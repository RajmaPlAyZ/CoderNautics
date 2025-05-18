import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { firestore } from './firebaseClient';

// Assuming a basic Post structure exists elsewhere or defining it here for clarity
export interface Post {
  id: string;
  title: string;
  // Add other post properties as needed (e.g., authorId, content, etc.)
  authorId: string; // Assuming authorId is stored in the post document
  date: Date; // Assuming a date field exists
  code?: string; // Add code field
  answer?: string; // Add answer field
  tags?: string[]; // Add tags field
  votes: number; // Ensure votes is included
  downvotes: number; // Ensure downvotes is included
  user?: { username: string; avatar_url: string | null }; // Add user info if stored directly or fetched separately
  active: boolean; // Add active status field
  type?: 'post' | 'doubt'; // Add type field
}

export interface SavedPost {
  id: string;
  userId: string;
  questionId: string;
  savedAt: Date;
}

export async function savePost(userId: string, questionId: string): Promise<SavedPost> {
  const savedPostsRef = collection(firestore, 'savedPosts');
  const savedPostData = {
    userId,
    questionId,
    savedAt: new Date(),
  };

  const docRef = await addDoc(savedPostsRef, savedPostData);
  return {
    id: docRef.id,
    ...savedPostData,
  };
}

export async function unsavePost(savedPostId: string): Promise<void> {
  const savedPostRef = doc(firestore, 'savedPosts', savedPostId);
  await deleteDoc(savedPostRef);
}

export async function getSavedPosts(userId: string): Promise<SavedPost[]> {
  const savedPostsRef = collection(firestore, 'savedPosts');
  const q = query(savedPostsRef, where('userId', '==', userId));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    savedAt: doc.data().savedAt.toDate(),
  })) as SavedPost[];
}

export async function isPostSaved(userId: string, questionId: string): Promise<boolean> {
  const savedPostsRef = collection(firestore, 'savedPosts');
  const q = query(
    savedPostsRef,
    where('userId', '==', userId),
    where('questionId', '==', questionId)
  );

  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export async function getPostsByUserId(userId: string): Promise<Post[]> {
  const postsRef = collection(firestore, 'questions');
  const q = query(postsRef, where('authorId', '==', userId));

  const querySnapshot = await getDocs(q);
  
  const postsWithAuthors = await Promise.all(querySnapshot.docs.map(async docSnapshot => {
    const postData = docSnapshot.data();
    const authorId = postData.authorId;
    let author = undefined;

    if (authorId) {
      const profileRef = doc(firestore, "profiles", authorId);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        author = {
          username: profileData.username || profileData.email,
          avatar_url: profileData.avatar_url || null,
        };
      }
    }

    return {
      id: docSnapshot.id,
      ...postData,
      date: postData.date?.toDate() || new Date(postData.date),
      user: author,
      votes: postData.votes || 0,
      downvotes: postData.downvotes || 0,
      code: postData.code || '',
      answer: postData.answer || '',
      tags: postData.tags || [],
      type: postData.type || 'post',
    } as Post;
  }));

  return postsWithAuthors;
}

export async function addPost(postData: { title: string; code?: string; answer?: string; tags?: string[] }, authorId: string): Promise<Post> {
  const postsRef = collection(firestore, 'questions');
  const newPostData = {
    ...postData,
    authorId,
    date: new Date(),
    votes: 0,
    downvotes: 0,
    active: true,
    type: 'post',
  };

  const docRef = await addDoc(postsRef, newPostData);
  await updateUserScore(authorId, 10);
  return {
    id: docRef.id,
    ...newPostData,
    date: newPostData.date,
    type: 'post',
  } as Post;
}

export async function addDoubt(doubtData: { title: string; description: string; tags?: string[] }, authorId: string): Promise<Post> {
  const doubtsRef = collection(firestore, 'questions'); // Store doubts in the same collection for simplicity
  const newDoubtData = {
    title: doubtData.title,
    answer: doubtData.description, // Use 'answer' field for description/initial question
    tags: doubtData.tags,
    authorId,
    date: new Date(),
    votes: 0,
    downvotes: 0,
    active: true, // Doubts are active by default
    type: 'doubt', // Explicitly set type for doubts
  };

  const docRef = await addDoc(doubtsRef, newDoubtData);
  await updateUserScore(authorId, 10);
  return {
    id: docRef.id,
    ...newDoubtData,
    date: newDoubtData.date,
    type: 'doubt',
  } as Post;
}

export async function getAllPosts(): Promise<Post[]> {
  const postsRef = collection(firestore, 'questions');
  const q = query(postsRef);

  const querySnapshot = await getDocs(q);
  
  const postsWithAuthors = await Promise.all(querySnapshot.docs.map(async docSnapshot => {
    const postData = docSnapshot.data();
    const authorId = postData.authorId;
    let author = undefined;

    if (authorId) {
      const profileRef = doc(firestore, "profiles", authorId);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        author = {
          username: profileData.username || profileData.email,
          avatar_url: profileData.avatar_url || null,
        };
      }
    }

    return {
      id: docSnapshot.id,
      ...postData,
      date: postData.date?.toDate() || new Date(postData.date),
      user: author,
      active: postData.active ?? true,
      type: postData.type || 'post',
    } as Post;
  }));

  return postsWithAuthors;
}

export async function getPostById(postId: string): Promise<Post | null> {
  const postRef = doc(firestore, 'questions', postId);
  const postSnap = await getDoc(postRef);

  if (postSnap.exists()) {
    const postData = postSnap.data();
    let author = undefined;

    if (postData.authorId) {
      const profileRef = doc(firestore, "profiles", postData.authorId);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        author = {
          username: profileData.username || profileData.email,
          avatar_url: profileData.avatar_url || null,
        };
      }
    }

    return {
      id: postSnap.id,
      ...postData,
      date: postData.date?.toDate() || new Date(postData.date),
      user: author,
      type: postData.type || 'post',
    } as Post;
  } else {
    return null;
  }
}

export async function upvotePost(postId: string): Promise<void> {
  const postRef = doc(firestore, 'questions', postId);
  await updateDoc(postRef, {
    votes: increment(1)
  });
}

export async function downvotePost(postId: string): Promise<void> {
  const postRef = doc(firestore, 'questions', postId);
  await updateDoc(postRef, {
    votes: increment(-1)
  });
}

interface Vote {
  id?: string;
  userId: string;
  postId: string;
  type: 'upvote' | 'downvote';
}

export async function getVoteForPost(userId: string, postId: string): Promise<Vote | null> {
  const votesRef = collection(firestore, 'votes');
  const q = query(
    votesRef,
    where('userId', '==', userId),
    where('postId', '==', postId)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docSnapshot = querySnapshot.docs[0];
    return { id: docSnapshot.id, ...docSnapshot.data() as Omit<Vote, 'id'> };
  }
  return null;
}

export async function recordVote(userId: string, postId: string, type: 'upvote' | 'downvote'): Promise<void> {
  const batch = writeBatch(firestore);
  const voteRef = doc(collection(firestore, 'votes')); // Create a new document reference
  const postRef = doc(firestore, 'questions', postId);

  batch.set(voteRef, { userId, postId, type });

  if (type === 'upvote') {
    batch.update(postRef, { votes: increment(1) });
    const postSnapshot = await getDoc(postRef);
    if (postSnapshot.exists()) {
      const postAuthorId = postSnapshot.data().authorId;
      if (postAuthorId) {
        batch.update(doc(firestore, "profiles", postAuthorId), { score: increment(1) });
      }
    }
  } else if (type === 'downvote') {
    batch.update(postRef, { votes: increment(-1) });
  }

  await batch.commit();
}

export async function updateVote(voteId: string, postId: string, newType: 'upvote' | 'downvote', oldType: 'upvote' | 'downvote'): Promise<void> {
  const batch = writeBatch(firestore);
  const voteRef = doc(firestore, 'votes', voteId);
  const postRef = doc(firestore, 'questions', postId);

  batch.update(voteRef, { type: newType });

  if (oldType === 'upvote' && newType === 'downvote') {
    batch.update(postRef, { votes: increment(-2) });
    const postSnapshot = await getDoc(postRef);
    if (postSnapshot.exists()) {
      const postAuthorId = postSnapshot.data().authorId;
      if (postAuthorId) {
        batch.update(doc(firestore, "profiles", postAuthorId), { score: increment(-2) });
      }
    }
  } else if (oldType === 'downvote' && newType === 'upvote') {
    batch.update(postRef, { votes: increment(2) });
    const postSnapshot = await getDoc(postRef);
    if (postSnapshot.exists()) {
      const postAuthorId = postSnapshot.data().authorId;
      if (postAuthorId) {
        batch.update(doc(firestore, "profiles", postAuthorId), { score: increment(2) });
      }
    }
  }

  await batch.commit();
}

export async function removeVote(voteId: string, postId: string, type: 'upvote' | 'downvote'): Promise<void> {
    const batch = writeBatch(firestore);
    const voteRef = doc(firestore, 'votes', voteId);
    const postRef = doc(firestore, 'questions', postId);

    batch.delete(voteRef);

    if (type === 'upvote') {
        batch.update(postRef, { votes: increment(-1) });
        const postSnapshot = await getDoc(postRef);
        if (postSnapshot.exists()) {
          const postAuthorId = postSnapshot.data().authorId;
          if (postAuthorId) {
            batch.update(doc(firestore, "profiles", postAuthorId), { score: increment(-1) });
          }
        }
    } else if (type === 'downvote') {
        batch.update(postRef, { votes: increment(1) });
        const postSnapshot = await getDoc(postRef);
        if (postSnapshot.exists()) {
          const postAuthorId = postSnapshot.data().authorId;
          if (postAuthorId) {
            batch.update(doc(firestore, "profiles", postAuthorId), { score: increment(1) });
          }
        }
    }

    await batch.commit();
}

export async function deletePost(postId: string): Promise<void> {
  const postRef = doc(firestore, 'questions', postId);
  await deleteDoc(postRef);
}

// Function to update a post
export async function updatePost(postId: string, updatedData: { title?: string; code?: string; answer?: string; tags?: string[] }): Promise<void> {
  const postRef = doc(firestore, 'questions', postId);
  await updateDoc(postRef, updatedData);
}

export async function updatePostStatus(postId: string, active: boolean): Promise<void> {
  const postRef = doc(firestore, 'questions', postId);
  await updateDoc(postRef, {
    active: active
  });
}

export async function addAnswerToDoubt(doubtId: string, answer: string, userId: string): Promise<void> {
  const doubtRef = doc(firestore, 'questions', doubtId);
  await updateDoc(doubtRef, {
    answer: answer,
  });
  await updateUserScore(userId, 15);
}

export async function updateUserScore(userId: string, points: number): Promise<void> {
  const profileRef = doc(firestore, "profiles", userId);
  await updateDoc(profileRef, {
    score: increment(points)
  });
} 