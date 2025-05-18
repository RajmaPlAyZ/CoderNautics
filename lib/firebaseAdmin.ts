import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
// import * as fs from 'fs';
// import * as path from 'path';

// Replace with your service account key file path relative to the lib directory
// const serviceAccountKeyPath = './serviceAccountKey.json';

let serviceAccount;

// try {
//   console.log(`Attempting to load service account key from ${serviceAccountKeyPath}...`);
//   // Resolve the path relative to the current file (__dirname is the directory of the current module)
//   const absoluteServiceAccountKeyPath = path.resolve(__dirname, serviceAccountKeyPath);
//   const serviceAccountContent = fs.readFileSync(absoluteServiceAccountKeyPath, 'utf8');
//   serviceAccount = JSON.parse(serviceAccountContent);
//   console.log('Service account key loaded and parsed successfully.');
// } catch (error: any) {
//   console.error(`Error loading or parsing service account key from ${serviceAccountKeyPath}:`, error);
//   // Depending on your setup, you might want to throw the error or handle it differently
//   // For now, we'll just log it. The subsequent initialization will likely fail.
// }

// Get the service account key from environment variable
const serviceAccountKey = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

// Parse the service account key
try {
  serviceAccount = JSON.parse(serviceAccountKey);
  console.log('Service account key loaded from environment variable and parsed successfully.');
} catch (error) {
  console.error('Error parsing service account key:', error);
  throw new Error('Failed to parse FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY');
}

// Initialize Firebase Admin SDK if it hasn't been initialized
if (!getApps().length) {
  console.log('Initializing Firebase Admin SDK...');
  try {
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized.');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
}

// Export the auth instance
export const adminAuth = getAuth();

// Only export other services if the app was initialized
let adminFirestore: ReturnType<typeof getFirestore> | undefined;
let adminStorage: ReturnType<typeof getStorage> | undefined;

if (getApps().length) {
  adminFirestore = getFirestore();
  adminStorage = getStorage();
}

export { adminFirestore, adminStorage };
