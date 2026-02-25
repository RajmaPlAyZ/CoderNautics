import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    updateDoc,
} from 'firebase/firestore';
import { firestore } from './firebaseClient';

export interface AdminUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    disabled: boolean;
    emailVerified: boolean;
}

/**
 * Fetch all users from the Firestore `profiles` collection.
 * This replaces the Firebase Admin SDK's listUsers() call.
 */
export async function getAllUsers(): Promise<AdminUser[]> {
    const profilesRef = collection(firestore, 'profiles');
    const snapshot = await getDocs(profilesRef);
    return snapshot.docs.map(d => {
        const data = d.data();
        return {
            uid: d.id,
            email: data.email ?? null,
            displayName: data.username ?? data.displayName ?? null,
            photoURL: data.avatar_url ?? data.photoURL ?? null,
            disabled: data.disabled ?? false,
            emailVerified: data.emailVerified ?? false,
        } as AdminUser;
    });
}

/**
 * Update allowed user fields in the `profiles` collection.
 */
export async function updateUser(updatedUser: AdminUser): Promise<void> {
    const profileRef = doc(firestore, 'profiles', updatedUser.uid);
    const updates: Record<string, any> = {};
    if (updatedUser.displayName !== undefined) updates.username = updatedUser.displayName;
    if (updatedUser.email !== undefined) updates.email = updatedUser.email;
    if (updatedUser.disabled !== undefined) updates.disabled = updatedUser.disabled;
    if (updatedUser.emailVerified !== undefined) updates.emailVerified = updatedUser.emailVerified;
    if (Object.keys(updates).length > 0) {
        await updateDoc(profileRef, updates);
    }
}

/**
 * Delete a user's profile document from the `profiles` collection.
 * Note: This removes the profile data. The Firebase Auth account itself
 * can only be deleted by the user or via Admin SDK. For a desktop app
 * this Firestore-level delete is sufficient for admin management.
 */
export async function deleteUser(uid: string): Promise<void> {
    const profileRef = doc(firestore, 'profiles', uid);
    await deleteDoc(profileRef);
}
