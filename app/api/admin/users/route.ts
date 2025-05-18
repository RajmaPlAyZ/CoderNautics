// app/api/admin/users/route.ts

// TODO: Initialize Firebase Admin SDK here if not already done globally
// import * as admin from 'firebase-admin';
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.applicationDefault(), // Or use a service account key
//   });
// }

import { adminAuth } from '@/lib/firebaseAdmin'; // Assuming you have a file like this for admin SDK initialization
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log('Attempting to list users...'); // Log start of the function
  console.log('Value of FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY:', process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY ? 'Set' : 'Not Set'); // Log the variable status

  try {
    // Implement logic to fetch users using Firebase Admin SDK
    const listUsersResult = await adminAuth.listUsers();
    const users = listUsersResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
      emailVerified: userRecord.emailVerified,
      // Add other user properties you need
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Failed to fetch users', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ message: 'User UID is required' }, { status: 400 });
    }

    await adminAuth.deleteUser(uid);

    return NextResponse.json({ message: `User ${uid} deleted successfully` });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Failed to delete user', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { uid, ...updates } = await req.json();

    if (!uid) {
      return NextResponse.json({ message: 'User UID is required' }, { status: 400 });
    }

    // Filter out any properties that should not be updated directly via this endpoint (e.g., password)
    const allowedUpdates: any = {};
    if (updates.email !== undefined) allowedUpdates.email = updates.email;
    if (updates.displayName !== undefined) allowedUpdates.displayName = updates.displayName;
    if (updates.disabled !== undefined) allowedUpdates.disabled = updates.disabled;
    if (updates.emailVerified !== undefined) allowedUpdates.emailVerified = updates.emailVerified;
    // Add other allowed fields like photoURL if needed

    if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json({ message: 'No valid fields provided for update' }, { status: 400 });
    }

    await adminAuth.updateUser(uid, allowedUpdates);

    return NextResponse.json({ message: `User ${uid} updated successfully` });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Failed to update user', error: error.message }, { status: 500 });
  }
}

// TODO: Implement POST, PUT, DELETE endpoints for user management 