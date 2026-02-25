import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { firestore } from './firebaseClient';

export async function getAllPostsClient() {
  const postsRef = collection(firestore, 'posts');
  const snapshot = await getDocs(postsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deletePostClient(postId: string) {
  const postRef = doc(firestore, 'posts', postId);
  await deleteDoc(postRef);
}

export async function updatePostClient(postId: string, updates: any) {
  const postRef = doc(firestore, 'posts', postId);
  await updateDoc(postRef, updates);
}
