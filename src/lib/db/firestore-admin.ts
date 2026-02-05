import { initializeApp, getApps, applicationDefault, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { firebaseConfig } from '@/firebase/config';

const getFirebaseAdminApp = () => {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  try {
    // Try with service account from env
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        return initializeApp({
            credential: cert(serviceAccount),
            projectId: firebaseConfig.projectId
        });
    }
    
    // Try default credentials (GOOGLE_APPLICATION_CREDENTIALS)
    // Or fallback to just projectId if we are in a loose environment (though admin usually needs creds)
    return initializeApp({
      credential: applicationDefault(),
      projectId: firebaseConfig.projectId
    });
  } catch (error) {
    console.warn("Firebase Admin Initialization Failed:", error);
    return null;
  }
};

export const getAdminFirestore = () => {
  const app = getFirebaseAdminApp();
  if (!app) {
    throw new Error("Firebase Admin not initialized. Check credentials.");
  }
  return getFirestore(app);
};

export const getAdminAuth = () => {
  const app = getFirebaseAdminApp();
  if (!app) {
    throw new Error("Firebase Admin not initialized. Check credentials.");
  }
  return getAuth(app);
};
