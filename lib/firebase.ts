import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app
if (getApps().length === 0) {
  // Solo inicializa si todas las configuraciones esenciales están presentes
  if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId) {
    app = initializeApp(firebaseConfig)
  } else {
    console.error(
      "Firebase configuration is incomplete. Please ensure all NEXT_PUBLIC_ environment variables are set correctly.",
    )
    // Puedes lanzar un error aquí si quieres que la app falle explícitamente
    // throw new Error("Firebase configuration missing.");
  }
} else {
  app = getApp()
}

// Asegúrate de que 'app' esté inicializado antes de exportar auth y db
if (!app) {
  throw new Error("Firebase app could not be initialized. Check environment variables and Firebase setup.")
}

export const auth = getAuth(app)
export const db = getFirestore(app)
