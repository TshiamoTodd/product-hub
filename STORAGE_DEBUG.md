// Alternative storage bucket configurations to try
// Replace the NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET value in your .env file with one of these:

export const STORAGE_BUCKET_OPTIONS = [
  // Option 1: Standard format (most common)
  "product-hub-pc6vs.appspot.com",
  
  // Option 2: New Firebase Storage format
  "product-hub-pc6vs.firebasestorage.app",
  
  // Option 3: Just the project ID (Firebase will auto-append)
  "product-hub-pc6vs",
  
  // Option 4: With default bucket suffix
  "product-hub-pc6vs.appspot.com",
];

// Instructions:
// 1. Try Option 1 first (already applied)
// 2. If that doesn't work, replace .env with Option 3
// 3. Then try Option 2 if needed
// 4. Check Firebase Console > Storage to see the actual bucket name
