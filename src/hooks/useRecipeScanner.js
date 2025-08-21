import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom hook for managing recipe scanning workflow
 * This simulates OCR/AI processing for now - in production would connect to actual API
 */
export const useRecipeScanner = () => {
  const [scanState, setScanState] = useState({
    isScanning: false,
    capturedImage: null,
    scannedRecipe: null,
    error: null
  });

  // Simulate recipe extraction from image (replace with actual API call)
  const extractRecipeFromImage = useCallback(async (imageFile) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // For demo purposes, return a mock recipe based on common patterns
    // In production, this would be an actual API call to OCR/AI service
    const mockRecipes = [
      {
        title: "Classic Chocolate Chip Cookies",
        description: "Delicious homemade chocolate chip cookies that are crispy on the outside and chewy on the inside.",
        ingredients: [
          "2 1/4 cups all-purpose flour",
          "1 tsp baking soda",
          "1 tsp salt",
          "1 cup butter, softened",
          "3/4 cup granulated sugar",
          "3/4 cup brown sugar",
          "2 large eggs",
          "2 tsp vanilla extract",
          "2 cups chocolate chips"
        ],
        instructions: [
          "Preheat oven to 375°F (190°C).",
          "In a bowl, whisk together flour, baking soda, and salt.",
          "In another bowl, cream butter and both sugars until light and fluffy.",
          "Beat in eggs one at a time, then vanilla.",
          "Gradually blend in flour mixture.",
          "Stir in chocolate chips.",
          "Drop rounded tablespoons of dough onto ungreased baking sheets.",
          "Bake 9-11 minutes or until golden brown.",
          "Cool on baking sheet for 2 minutes before removing."
        ],
        cookTime: "25",
        servings: "48",
        difficulty: "Easy"
      },
      {
        title: "Homemade Pasta Sauce",
        description: "A rich and flavorful tomato-based pasta sauce made from scratch.",
        ingredients: [
          "2 cans crushed tomatoes",
          "1 onion, diced",
          "4 cloves garlic, minced",
          "2 tbsp olive oil",
          "1 tsp dried basil",
          "1 tsp dried oregano",
          "1/2 tsp salt",
          "1/4 tsp black pepper",
          "1 tbsp sugar"
        ],
        instructions: [
          "Heat olive oil in a large saucepan over medium heat.",
          "Add onion and cook until softened, about 5 minutes.",
          "Add garlic and cook for 1 minute more.",
          "Add crushed tomatoes, basil, oregano, salt, pepper, and sugar.",
          "Bring to a simmer and reduce heat to low.",
          "Simmer for 20-30 minutes, stirring occasionally.",
          "Taste and adjust seasonings as needed.",
          "Serve over pasta or store for later use."
        ],
        cookTime: "35",
        servings: "6",
        difficulty: "Easy"
      }
    ];

    // Randomly select a mock recipe for demo
    const randomRecipe = mockRecipes[Math.floor(Math.random() * mockRecipes.length)];
    
    // Sometimes simulate errors for testing
    if (Math.random() < 0.1) { // 10% chance of error
      throw new Error("Could not detect recipe text in the image. Please try with a clearer photo.");
    }

    return randomRecipe;
  }, []);

  const handleImageCapture = useCallback((capturedImage) => {
    setScanState(prev => ({
      ...prev,
      capturedImage,
      error: null
    }));
  }, []);

  const startScanning = useCallback(async () => {
    if (!scanState.capturedImage) return;

    setScanState(prev => ({
      ...prev,
      isScanning: true,
      error: null
    }));

    try {
      const extractedRecipe = await extractRecipeFromImage(scanState.capturedImage.file);
      
      setScanState(prev => ({
        ...prev,
        isScanning: false,
        scannedRecipe: extractedRecipe
      }));

      toast.success('Recipe successfully scanned!');
      return extractedRecipe;
    } catch (error) {
      setScanState(prev => ({
        ...prev,
        isScanning: false,
        error: error.message
      }));
      
      toast.error('Failed to scan recipe: ' + error.message);
      throw error;
    }
  }, [scanState.capturedImage, extractRecipeFromImage]);

  const retakePhoto = useCallback(() => {
    if (scanState.capturedImage?.previewUrl) {
      URL.revokeObjectURL(scanState.capturedImage.previewUrl);
    }
    
    setScanState({
      isScanning: false,
      capturedImage: null,
      scannedRecipe: null,
      error: null
    });
  }, [scanState.capturedImage]);

  const clearScan = useCallback(() => {
    if (scanState.capturedImage?.previewUrl) {
      URL.revokeObjectURL(scanState.capturedImage.previewUrl);
    }
    
    setScanState({
      isScanning: false,
      capturedImage: null,
      scannedRecipe: null,
      error: null
    });
  }, [scanState.capturedImage]);

  return {
    // State
    isScanning: scanState.isScanning,
    capturedImage: scanState.capturedImage,
    scannedRecipe: scanState.scannedRecipe,
    error: scanState.error,
    
    // Actions
    handleImageCapture,
    startScanning,
    retakePhoto,
    clearScan
  };
};

export default useRecipeScanner;
