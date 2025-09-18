# Admin Features Setup

## Firebase Admin SDK Configuration

The admin features require Firebase Admin SDK to be configured. Currently, the admin features are disabled because the `FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY` environment variable is not set.

### To Enable Admin Features:

#### Option 1: Environment Variable (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`codernautics`)
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Copy the entire JSON content
7. Create a `.env.local` file in your project root
8. Add: `FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'`
9. Restart your development server

#### Option 2: File-based (Alternative)
1. Download the service account key JSON file from Firebase Console
2. Rename it to `serviceAccountKey.json`
3. Place it in the `lib/` directory
4. Uncomment the file-based code in `lib/firebaseAdmin.ts`
5. Comment out the environment variable code

### What Admin Features Are Available:
- **User Management**: View, edit, and delete users
- **Post Management**: View, edit, and delete posts
- **Admin Panel**: Access via `/admin` route (requires admin email: `admin@example.com`)

### Current Status:
- ✅ **Posts Management**: Working (uses client-side Firebase)
- ⚠️ **User Management**: Disabled (requires Firebase Admin SDK)
- ✅ **Admin Panel UI**: Working (shows appropriate messages when admin features are disabled)

### Error Handling:
The application now gracefully handles the missing Firebase Admin SDK configuration:
- Admin routes return HTTP 503 with helpful error messages
- Admin panel shows appropriate warnings
- Other features continue to work normally
