import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    let app;
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Parse the service account key from environment variable
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: 'touristlogbook',
      });
      
      console.log('✅ Firebase initialized with service account credentials');
    } else {
      // Try to read from file as fallback
      try {
        const fs = require('fs');
        const serviceAccount = JSON.parse(fs.readFileSync('./firebase-key.json', 'utf8'));
        
        app = initializeApp({
          credential: cert(serviceAccount),
          projectId: 'touristlogbook',
        });
        
        console.log('✅ Firebase initialized with file credentials');
      } catch (fileError) {
        // Last resort: initialize without credentials (for development)
        app = initializeApp({
          projectId: 'touristlogbook',
        });
        
        console.log('⚠️ Firebase initialized without credentials (development mode)');
      }
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    
    // Last resort: initialize with minimal config
    initializeApp({
      projectId: 'touristlogbook',
    });
  }
}

export const db = getFirestore();