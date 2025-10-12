
'use server';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

let firestore: any;

if (getApps().length) {
  firestore = getFirestore(getApp());
} else {
  const firebaseApp = initializeApp(firebaseConfig);
  firestore = getFirestore(firebaseApp);
}

export { firestore };
