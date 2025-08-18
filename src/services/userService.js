import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Creates a user document in Firestore if it doesn't already exist
 * @param {Object} user - Firebase user object
 * @returns {Promise<void>}
 */
export const createOrCheckUserDocument = async (user) => {
  if (!user || !user.uid) {
    console.error('Invalid user object provided to createOrCheckUserDocument');
    return;
  }

  try {
    // Reference to the user document
    const userDocRef = doc(db, 'users', user.uid);
    
    // Check if the document exists
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      // Document doesn't exist, create it
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        createdAt: new Date(),
        lastSignIn: new Date(),
        // Add any other initial user data fields here
      };
      
      await setDoc(userDocRef, userData);
      console.log('New user document created for:', user.email);
    } else {
      // Document exists, just log that user exists
      console.log('User document already exists for:', user.email);
      
      // Optionally update lastSignIn timestamp
      await setDoc(userDocRef, { 
        lastSignIn: new Date() 
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error in createOrCheckUserDocument:', error);
    throw error; // Re-throw to allow calling component to handle
  }
};
