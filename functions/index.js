import express from "express";
import cors from "cors";
import multer from "multer";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { Firestore } from "@google-cloud/firestore";

// --- INITIALIZATION ---
const db = new Firestore();
const visionClient = new ImageAnnotatorClient();
const app = express();

// --- MIDDLEWARE ---
app.use(cors({ origin: true }));
app.use(express.json());

// --- OCR PARSER ---
const parseTextToRecipe = (text) => {
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  let title = "Scanned Recipe";
  const ingredients = [];
  const instructions = [];

  const ingredientsIndex = lines.findIndex((line) => line.toLowerCase().includes("ingredient"));
  const instructionsIndex = lines.findIndex((line) => line.toLowerCase().includes("instruction") || line.toLowerCase().includes("direction") || line.toLowerCase().includes("method"));

  if (ingredientsIndex > 0) { title = lines.slice(0, ingredientsIndex).join(" ").trim(); }
  else if (instructionsIndex > 0) { title = lines.slice(0, instructionsIndex).join(" ").trim(); }
  else if (lines.length > 0) { title = lines[0]; }

  const startIng = ingredientsIndex !== -1 ? ingredientsIndex + 1 : (instructionsIndex > 1 ? 1 : -1);
  const endIng = instructionsIndex !== -1 ? instructionsIndex : lines.length;

  if (startIng !== -1) { ingredients.push(...lines.slice(startIng, endIng).map((l) => l.trim()).filter(Boolean)); }
  if (instructionsIndex !== -1) { instructions.push(...lines.slice(instructionsIndex + 1).map((l) => l.trim().replace(/^\d+\.\s*/, "")).filter(Boolean)); }

  return {title: title || "Scanned Recipe", ingredients, instructions};
};

// --- API ENDPOINTS ---

// GET /recipes - Fetch all recipes
app.get('/recipes', async (req, res) => {
  try {
    const snapshot = await db.collection(`recipes`).orderBy('scannedAt', 'desc').get();
    const recipes = snapshot.docs.map(doc => doc.data());
    return res.status(200).json(recipes);
  } catch (error) {
    console.error('Error getting recipes:', error);
    return res.status(500).json({ error: 'Failed to retrieve recipes.' });
  }
});

// POST /recipes - Create a recipe manually
app.post('/recipes', async (req, res) => {
  try {
    const newRecipeRef = db.collection(`recipes`).doc();
    const newRecipe = {
      id: newRecipeRef.id,
      ...req.body,
      scannedAt: new Date(),
    };
    await newRecipeRef.set(newRecipe);
    return res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    return res.status(500).json({ error: 'Failed to create recipe.' });
  }
});

// DELETE /recipes/:id - Delete a recipe
app.delete('/recipes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const docRef = db.doc(`recipes/${id}`);
        await docRef.delete();
        return res.status(204).send();
    } catch (error) {
        console.error(`Error deleting recipe ${id}:`, error);
        return res.status(500).json({ error: 'Failed to delete recipe.' });
    }
});

// POST /recipes/import/ocr - Scan an image
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.post('/recipes/import/ocr', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided.' });
    }
    try {
        const [result] = await visionClient.textDetection({ image: { content: req.file.buffer } });
        const fullText = result.fullTextAnnotation?.text;

        if (!fullText) {
            return res.status(400).json({ error: 'Could not detect any text in the image.' });
        }

        const parsedData = parseTextToRecipe(fullText);
        const newRecipeRef = db.collection(`recipes`).doc();
        const recipePayload = {
          id: newRecipeRef.id,
          ...parsedData,
          description: "", cookTime: null, servings: "", difficulty: "Easy",
          image: `https://source.unsplash.com/random/800x600/?food,${encodeURIComponent(parsedData.title)}`,
          scannedAt: new Date(),
        };
        await newRecipeRef.set(recipePayload);
        return res.status(201).json(recipePayload);
    } catch (error) {
        console.error('OCR Error:', error);
        return res.status(500).json({ error: 'Failed to process image.' });
    }
});

// Expose the Express app
export default app;