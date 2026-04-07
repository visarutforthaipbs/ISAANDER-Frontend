import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App;
let db: Firestore;

function getAdminApp(): App {
  if (!app) {
    if (getApps().length > 0) {
      app = getApps()[0];
    } else {
      // Use GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY if available,
      // otherwise fall back to Application Default Credentials (works on GCP / Vercel).
      const email =
        process.env.FIREBASE_ADMIN_CLIENT_EMAIL ??
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const key = (
        process.env.FIREBASE_ADMIN_PRIVATE_KEY ??
        process.env.GOOGLE_PRIVATE_KEY
      )?.replace(/\\n/g, "\n");

      if (email && key) {
        app = initializeApp({
          credential: cert({
            projectId: "the-isaander-reader-db",
            clientEmail: email,
            privateKey: key,
          }),
        });
      } else {
        // ADC fallback — works when GOOGLE_APPLICATION_CREDENTIALS env is set
        app = initializeApp({ projectId: "the-isaander-reader-db" });
      }
    }
  }
  return app;
}

export function getAdminFirestore(): Firestore {
  if (!db) {
    db = getFirestore(getAdminApp());
  }
  return db;
}
