import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase'; // Import the pre-configured functions instance

// This creates a reference to the 'scanRecipeImage' callable Cloud Function.
const scanRecipeImageCallable = httpsCallable(functions, 'scanRecipeImage');

/**
 * Calls the 'scanRecipeImage' Cloud Function with the provided base64 image.
 * This function runs in the browser.
 * @param {string} base64Image - The base64-encoded image string.
 * @returns {Promise<any>} The data returned from the cloud function.
 */
export const callScanFunction = async (base64Image) => {
  try {
    const result = await scanRecipeImageCallable({ base64Image });
    return result.data;
  } catch (error) {
    console.error("Error calling 'scanRecipeImage' function:", error);
    // Re-throw the error so the calling component can handle it
    throw error;
  }
};