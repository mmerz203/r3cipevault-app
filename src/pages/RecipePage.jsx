import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import AccountMenu from '../components/AccountMenu';

import { useParams, useNavigate } from 'react-router-dom';
import { mockRecipes } from '../data/mockData';

const RecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserRecipe, setIsUserRecipe] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setIsUserRecipe(false); // Reset on each fetch
      console.log(`Attempting to find recipe with ID: ${id}`);

      // Prioritize checking Firestore first to see if the user has a saved version.
      if (user) {
        const recipeRef = doc(db, 'users', user.uid, 'recipes', id);
        console.log('Checking Firestore path:', recipeRef.path);
        try {
          const docSnap = await getDoc(recipeRef);
          if (docSnap.exists()) {
            console.log('Recipe found in Firestore:', docSnap.data());
            setRecipe(docSnap.data());
            setIsUserRecipe(true); // This is a user-created recipe
            setLoading(false);
            return; // Found user's version, no need to check mock data.
          }
        } catch (error) {
          console.error("Error fetching recipe from Firestore:", error);
          // Don't return, allow fallback to mock data.
        }
      }

      // If not in Firestore, check the local mock data as a fallback.
      const mockRecipe = mockRecipes.find(r => r.id.toString() === id);
      if (mockRecipe) {
        console.log('Recipe found in local mock data.');
        setRecipe(mockRecipe);
        // isUserRecipe remains false for pure mock recipes
      }

      setLoading(false);
    };

    fetchRecipe();
  }, [id, user]);

  const handleSaveRecipe = async () => {
    console.log('Attempting to save recipe...');

    if (!user) {
      console.error('Save failed: No user object available.');
      toast.error('You must be signed in to save recipes.');
      return;
    }
    console.log('User object available. UID:', user.uid);

    if (!recipe) {
      console.error('Save failed: No recipe data available.');
      return;
    }

    try {
      // Firestore does not support `undefined` values. A common way to remove them
      // is to serialize and deserialize the object. This also creates a deep copy.
      const recipeToSave = JSON.parse(JSON.stringify(recipe));
      console.log('Recipe data to be saved:', recipeToSave);

      // Use the recipe's numeric ID as the document ID in Firestore
      const recipeRef = doc(db, 'users', user.uid, 'recipes', recipe.id.toString());
      console.log('Saving to Firestore path:', recipeRef.path);

      await setDoc(recipeRef, recipeToSave);
      console.log('Successfully saved recipe to Firestore!');
      toast.success('Recipe saved to your vault!');
      setIsUserRecipe(true); // Show edit/delete buttons immediately after saving.
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error('Error saving recipe. Please try again later.');
    }
  };

  const handleDeleteRecipe = async () => {
    if (!user || !recipe || !isUserRecipe) {
      toast.error("This recipe cannot be deleted.");
      return;
    }

    // 1. Trigger a confirmation dialog.
    if (window.confirm(`Are you sure you want to delete "${recipe.title}"? This cannot be undone.`)) {
      try {
        // 2. Make a "DELETE" request to the database.
        const recipeRef = doc(db, 'users', user.uid, 'recipes', recipe.id.toString());
        await deleteDoc(recipeRef);
        toast.success('Recipe deleted successfully!');
        // 4. Navigate the user back to the recipe list.
        navigate('/');
      } catch (error) {
        // 3. Handle any potential errors.
        console.error("Error deleting recipe:", error);
        toast.error('Failed to delete recipe. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-not-found min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h2>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-page min-h-screen bg-gray-50 pb-20">
      <div className="recipe-header relative">
        <img 
          src={recipe.image} 
          alt={recipe.title}
          className="w-full h-64 object-cover"
        />
        
        <button 
          onClick={() => navigate(-1)}
          className="back-button absolute top-4 left-4 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="absolute top-4 right-4 flex items-center space-x-2">
          {isUserRecipe && (
            <button
              onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
              className="edit-button w-10 h-10 bg-blue-600 bg-opacity-80 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all"
              title="Edit Recipe"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
              </svg>
            </button>
          )}
          {isUserRecipe && (
            <button
              onClick={handleDeleteRecipe}
              className="delete-button w-10 h-10 bg-red-600 bg-opacity-80 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-all"
              title="Delete Recipe"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button
            onClick={handleSaveRecipe}
            className={`save-button w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center transition-all ${
              isUserRecipe
                ? 'cursor-not-allowed'
                : 'hover:bg-opacity-70'
            }`}
            title={isUserRecipe ? 'Recipe is in your vault' : 'Save Recipe'}
            disabled={isUserRecipe}
          >
            <svg
              className="w-6 h-6"
              fill={isUserRecipe ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <div className="bg-black bg-opacity-50 rounded-lg p-1">
            <AccountMenu />
          </div>
        </div>

        <div className="recipe-overlay absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <h1 className="recipe-title text-2xl font-bold text-white mb-2">{recipe.title}</h1>
          <div className="recipe-meta flex items-center space-x-4 text-white text-sm">
            <span className="cook-time flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {recipe.cookTime}
            </span>
            <span className="servings flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {recipe.servings} servings
            </span>
            <span className={`difficulty px-2 py-1 rounded-full text-xs font-medium ${
              recipe.difficulty === 'Easy' ? 'bg-green-500 text-white' :
              recipe.difficulty === 'Medium' ? 'bg-yellow-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {recipe.difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className="recipe-content max-w-4xl mx-auto p-6">
        <div className="ingredients-section mb-8">
          <h2 className="section-title text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
          <div className="ingredients-list bg-white rounded-lg p-4 shadow-sm">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-item flex items-start py-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">{ingredient}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="instructions-section">
          <h2 className="section-title text-xl font-bold text-gray-900 mb-4">Instructions</h2>
          <div className="instructions-list bg-white rounded-lg p-4 shadow-sm">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="instruction-item flex items-start py-3 border-b border-gray-100 last:border-b-0">
                <div className="step-number w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 flex-shrink-0 mt-1">
                  {index + 1}
                </div>
                <p className="instruction-text text-gray-700 leading-relaxed">{instruction}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipePage;
