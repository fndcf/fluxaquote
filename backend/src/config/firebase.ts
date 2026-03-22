import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

// Em ambiente de teste, não carregar .env.local (usa variáveis do setup de teste)
if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
}

if (!admin.apps.length) {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    // Ambiente de teste: conectar ao emulator
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'demo-fluxaquote',
    });
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Desenvolvimento local: usar credenciais do .env.local
    const firebaseConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
    });
  } else {
    // Produção (Cloud Functions): credenciais injetadas automaticamente
    admin.initializeApp();
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const FieldValue = admin.firestore.FieldValue;
export default admin;
