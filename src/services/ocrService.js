import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '/src/firebase.js';

/**
 * Converts a File object to a base64 encoded string.
 * @param {File} file The file to convert.
 * @returns {Promise<string>} A promise that resolves with the base64 string.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Result is a data URL (e.g., "data:image/jpeg;base64,..."). We only need the base64 part.
      const base64String = reader.result.toString().split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * 2.1: Sends the image data to the secure Firebase Function for OCR processing.
 * @param {string} base64Image The base64 encoded image data.
 * @returns {Promise<string>} A promise that resolves with the extracted text.
 */
async function sendImageToOCR(base64Image) {
  const functions = getFunctions(app);
  const scanRecipeImage = httpsCallable(functions, 'scanRecipeImage');

  // 2.3: Implement a try...catch block for robust error handling.
  try {
    const result = await scanRecipeImage({ base64Image });
    const { text } = result.data;
    return text;
  } catch (error) {
    // 2.3: Handle function call failures.
    console.error("Firebase function call failed:", error);
    throw new Error(error.message || "Failed to scan recipe. Please try again.");
  }
}

/**
 * Parses the raw text from the OCR response to a structured recipe object.
 * This is a simplified example and would need more sophisticated logic for real-world use.
 * @param {string} rawText The full text from the OCR.
 * @returns {{title: string, ingredients: string[], instructions: string[]}}
 */
function parseTextToRecipe(rawText) {
  if (!rawText) return { title: 'Scanned Recipe', ingredients: [''], instructions: [''] };
  const lines = rawText.split('\n');
  const title = lines[0] || 'Scanned Recipe';
  const ingredients = lines.filter(line => /^\s*[-*•\d]/.test(line));
  const instructions = lines.filter(line => !ingredients.includes(line) && line.trim() !== title);

  return {
    title,
    ingredients: ingredients.length > 0 ? ingredients : [''],
    instructions: instructions.length > 0 ? instructions : [''],
  };
}

export { fileToBase64, sendImageToOCR, parseTextToRecipe };