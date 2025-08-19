import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signOut } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore';
import { doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Saves a recipe document to a user's "recipes" collection in Firestore.
 *
 * @param {string} uid The ID of the currently authenticated user.
 * @param {object} recipeData The recipe data to save. It must have an 'id' property.
 * @returns {Promise<void>} A promise that resolves when the data is successfully written.
 */
export const saveRecipeForUser = async (uid, recipeData) => {
  if (!uid) {
    throw new Error("A user ID must be provided to save a recipe.");
  }
  if (!recipeData || !recipeData.id) {
    throw new Error("Recipe data must be provided with a valid 'id'.");
  }

  try {
    // Firestore does not support `undefined` values. A common way to remove them
    // is to serialize and deserialize the object. This also creates a deep copy.
    const recipeToSave = JSON.parse(JSON.stringify(recipeData));

    // Construct the document reference. The path will be 'users/{uid}/recipes/{recipeId}'.
    const recipeRef = doc(db, "users", uid, "recipes", recipeData.id.toString());

    // Set the document in the specified location.
    // If the document does not exist, it will be created. If it does exist,
    // its contents will be overwritten with the provided data.
    await setDoc(recipeRef, recipeToSave);

    console.log(`Recipe ${recipeData.id} saved for user ${uid}`);
  } catch (error) {
    console.error("Error saving recipe to Firestore:", error);
    // Re-throw the error so the calling function can handle it, e.g., show a toast message.
    throw error;
  }
};

export { auth, db, signInAnonymously, signOut };