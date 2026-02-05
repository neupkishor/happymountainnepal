import { initializeApp, getApps, applicationDefault, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

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
            credential: cert(serviceAccount)
        });
    }
    
    // Try default credentials (GOOGLE_APPLICATION_CREDENTIALS)
    return initializeApp({
      credential: applicationDefault()
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
