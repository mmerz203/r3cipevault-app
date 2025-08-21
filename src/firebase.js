import { initializeApp } from 'firebase/app';
import { getAuth, signOut as firebaseSignOut, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, doc, setDoc, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmMY8VBh9kkDdQ0PwVXCLZH5TV3E_cvg4",
  authDomain: "r3cpievault-app.firebaseapp.com",
  projectId: "r3cpievault-app",
  storageBucket: "r3cpievault-app.appspot.com",
  messagingSenderId: "525955843836",
  appId: "1:525955843836:web:1ad7a2804d792e569c3979"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, 'us-central1');

// Connect to emulators in development mode
if (import.meta.env.DEV) {
  // Point to the emulators running on localhost.
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectAuthEmulator(auth, 'http://localhost:9099');
}

export const saveRecipeForUser = async (userId, recipeData) => {
  const recipeRef = doc(db, 'users', userId, 'recipes', recipeData.id);
  await setDoc(recipeRef, recipeData);
};

/**
 * Signs out the current user.
 * @returns {Promise<void>}
 */
export const signOut = () => {
  return firebaseSignOut(auth);
};