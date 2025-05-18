import { addDoc, collection, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { firestore } from './firebaseClient';

export interface Comment {
  id: string;
  questionId: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
}

export async function addComment(questionId: string, text: string, authorId: string, authorName: string): Promise<Comment> {
  const commentsRef = collection(firestore, 'comments');
  const commentData = {
    questionId,
    text,
    authorId,
    authorName,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(commentsRef, commentData);
  return {
    id: docRef.id,
    ...commentData,
    createdAt: commentData.createdAt.toDate(),
  };
}

export async function getComments(questionId: string): Promise<Comment[]> {
  const commentsRef = collection(firestore, 'comments');
  const q = query(
    commentsRef,
    where('questionId', '==', questionId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Comment[];
} 