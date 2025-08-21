const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {ImageAnnotatorClient} = require("@google-cloud/vision");

// Initialize the Admin SDK using Application Default Credentials
admin.initializeApp();

const visionClient = new ImageAnnotatorClient();

// A simple parser to extract title, ingredients, and instructions.
const parseTextToRecipe = (text) => {
  const lines = text.split("\n").filter((line) => line.trim() !== "");

  let title = "Scanned Recipe";
  const ingredients = [];
  const instructions = [];

  const ingredientsIndex = lines.findIndex(
      (line) => line.toLowerCase().includes("ingredient"),
  );
  const instructionsIndex = lines.findIndex(
      (line) =>
        line.toLowerCase().includes("instruction") ||
        line.toLowerCase().includes("direction") ||
        line.toLowerCase().includes("method"),
  );

  if (ingredientsIndex > 0) {
    title = lines.slice(0, ingredientsIndex).join(" ").trim();
  } else if (instructionsIndex > 0) {
    title = lines.slice(0, instructionsIndex).join(" ").trim();
  } else if (lines.length > 0) {
    title = lines[0];
  }

  let startIng;
  if (ingredientsIndex !== -1) {
    startIng = ingredientsIndex + 1;
  } else if (instructionsIndex > 1) {
    startIng = 1;
  } else {
    startIng = -1;
  }
  const endIng = instructionsIndex !== -1 ? instructionsIndex : lines.length;
  if (startIng !== -1) {
    ingredients.push(
        ...lines
            .slice(startIng, endIng)
            .map((l) => l.trim().replace(/^[-*â€¢\d\s.]+\s*/, ""))
            .filter(Boolean),
    );
  }
  if (instructionsIndex !== -1) {
    instructions.push(
        ...lines
            .slice(instructionsIndex + 1)
            .map((l) => l.trim().replace(/^[-*â€¢\d\s.]+\s*/, ""))
            .filter(Boolean),
    );
  }

  return {title: title || "Scanned Recipe", ingredients, instructions};
};

/**
 * A secure, callable Cloud Function to process an image with the
 * Google Cloud Vision API.
 * This function handles authentication and CORS automatically.
 */
exports.scanRecipeImage = functions.https.onCall(async (data, context) => {
  // 1. Check for authentication. `context.auth` is automatically populated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // 2. Validate the incoming data from the client.
  const base64Image = data.base64Image;
  if (!base64Image) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a \"base64Image\" argument.",
    );
  }

  // 3. Prepare the payload for Google Cloud Vision API
  const request = {
    image: {content: base64Image},
    features: [{type: "TEXT_DETECTION"}],
  };

  try {
    // 4. Call the Google Cloud Vision API
    const [result] = await visionClient.annotateImage(request);
    const fullText = (result.fullTextAnnotation || {}).text;
    if (!fullText) {
      throw new functions.https.HttpsError(
          "not-found",
          "No text found in the image.",
      );
    }

    // 5. Parse the extracted text into a structured recipe object.
    const parsedData = parseTextToRecipe(fullText);

    // 6. Create a new recipe document in Firestore.
    const userId = context.auth.uid;
    const newRecipeRef = admin
        .firestore()
        .collection(`users/${userId}/recipes`)
        .doc();

    await newRecipeRef.set({
      id: newRecipeRef.id, // Store the document ID within the document itself
      ...parsedData,
      description: "",
      cookTime: "",
      servings: "",
      difficulty: "Easy",
      image: `https://source.unsplash.com/random/800x600/?food,${encodeURIComponent(
          parsedData.title,
      )}`,
      scannedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 7. Return the new recipe data, including its ID, to the client.
    return {...parsedData, id: newRecipeRef.id};
  } catch (error) {
    console.error("Function failed in try-catch block.", error);
    throw new functions.https.HttpsError(
        "internal",
        "An error occurred during the recipe scan.",
        error.message,
    );
  }
});
