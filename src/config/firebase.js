import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate required configuration
const requiredFields = ['apiKey', 'authDomain', 'projectId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  console.error('Missing required Firebase configuration:', missingFields);
  console.warn('Firebase will run in offline mode. Some features may not work.');
}

let app, auth, db;
let isFirebaseEnabled = false;

// Initialize Firebase with error handling
try {
  if (missingFields.length === 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseEnabled = true;
    
    console.log('✅ Firebase initialized successfully');
    
    // Test connection
    testFirebaseConnection();
  } else {
    console.warn('⚠️ Firebase disabled due to missing configuration');
    // Create mock services for offline use
    auth = createMockAuth();
    db = createMockFirestore();
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.warn('Running in offline mode');
  
  // Create mock services
  auth = createMockAuth();
  db = createMockFirestore();
}

// Test Firebase connection
async function testFirebaseConnection() {
  if (!isFirebaseEnabled) return;
  
  try {
    // Test Firestore connection
    await enableNetwork(db);
    console.log('✅ Firestore connection successful');
  } catch (error) {
    console.warn('⚠️ Firestore connection failed:', error.message);
    console.log('Switching to offline mode...');
    
    try {
      await disableNetwork(db);
      console.log('✅ Firestore offline mode enabled');
    } catch (offlineError) {
      console.error('❌ Failed to enable offline mode:', offlineError);
    }
  }
}

// Create mock auth service for offline use
function createMockAuth() {
  return {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      callback(null);
      return () => {}; // unsubscribe function
    },
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    signOut: () => Promise.resolve(),
    updateProfile: () => Promise.reject(new Error('Firebase not configured'))
  };
}

// Create mock Firestore service for offline use
function createMockFirestore() {
  return {
    // Mock Firestore methods
    collection: () => ({
      doc: () => ({
        set: () => Promise.resolve(),
        get: () => Promise.resolve({ exists: false, data: () => null }),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve()
      }),
      add: () => Promise.resolve({ id: 'mock-id' }),
      where: () => ({ orderBy: () => ({ get: () => Promise.resolve({ docs: [] }) }) })
    })
  };
}

// Utility function to check if Firebase is available
export const isFirebaseAvailable = () => isFirebaseEnabled && navigator.onLine;

// Utility function to handle Firebase errors gracefully
export const handleFirebaseError = (error, fallbackAction = null) => {
  console.warn('Firebase operation failed:', error.message);
  
  if (fallbackAction) {
    console.log('Using fallback action...');
    return fallbackAction();
  }
  
  // Return a resolved promise to avoid breaking the app
  return Promise.resolve();
};

// Enhanced network status detection
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
  isOnline = true;
  console.log('🌐 Back online - re-enabling Firebase');
  if (isFirebaseEnabled && db) {
    enableNetwork(db).catch(error => 
      console.warn('Failed to re-enable Firestore:', error)
    );
  }
});

window.addEventListener('offline', () => {
  isOnline = false;
  console.log('📴 Offline - Firebase will use cached data');
});

export const getNetworkStatus = () => isOnline;

export { auth, db, app };
export default app;
