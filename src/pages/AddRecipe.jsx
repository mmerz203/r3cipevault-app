import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import { useUser } from '@/context/UserContext';
import ScanRecipeButton from '@/components/ScanRecipeButton';
import toast from 'react-hot-toast';
import { getRecipeById, createManualRecipe, updateRecipeById, scanRecipeWithImage } from '@/services/recipeService';

const AddRecipe = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { user } = useUser();
  const [isScanning, setIsScanning] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    cookTime: '',
    servings: '',
    difficulty: 'Easy'
  });

  useEffect(() => {
    // In "add" mode (no recipe ID), always ensure the form is reset.
    if (!isEditMode) {
      setFormData({
        title: '',
        description: '',
        ingredients: [''],
        instructions: [''],
        cookTime: '',
        servings: '',
        difficulty: 'Easy'
      });
      return;
    }

    // In "edit" mode, wait for the user object before fetching the recipe.
    // This prevents the form from being cleared if user data is still loading.
    if (isEditMode) {
      const fetchRecipeData = async () => {
        try {
          const recipeData = await getRecipeById(id);
          setFormData({
            title: recipeData.title || '',
            description: recipeData.description || '',
            ingredients: recipeData.ingredients || [''],
            instructions: recipeData.instructions || [''],
            cookTime: recipeData.cookTime || '',
            servings: recipeData.servings || '',
            difficulty: recipeData.difficulty || 'Easy',
          });
        } catch (error) {
          toast.error(error.message || "Failed to load recipe data.");
          console.error("Error fetching recipe for edit:", error.message);
          navigate('/');
        }
      };
      fetchRecipeData();
    }
  }, [id, isEditMode, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDynamicListChange = (field, index, value) => {
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newList
    }));
  };

  const addDynamicListItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeDynamicListItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { // This check is important for both modes
      toast.error("You must be signed in to add a recipe.");
      return;
    }

    const finalIngredients = formData.ingredients.filter(i => i.trim() !== '');
    const finalInstructions = formData.instructions.filter(i => i.trim() !== '');

    if (!formData.title.trim() || finalIngredients.length === 0 || finalInstructions.length === 0) {
      toast.error("Please fill out the title and add at least one ingredient and instruction.");
      return;
    }

    const recipePayload = {
      ...formData,
      cookTime: Number(formData.cookTime) || null,
      servings: Number(formData.servings) || null,
      ingredients: finalIngredients,
      instructions: finalInstructions,
    };
    
    const fullRecipePayload = {
      ...recipePayload,
      image: `https://source.unsplash.com/random/800x600/?food,${encodeURIComponent(formData.title)}`,
    };

    try {
      if (isEditMode) {
        await updateRecipeById(id, fullRecipePayload);
        toast.success('Recipe updated successfully!');
        navigate(`/recipes/${id}`);
      } else {
        // The backend will generate the ID and return the full recipe object.
        const newRecipe = await createManualRecipe(fullRecipePayload);
        toast.success('Recipe added successfully!');
        navigate(`/recipes/${newRecipe.id}`); // Navigate to the new recipe's page
      }
    } catch (error) {
      const action = isEditMode ? 'update' : 'save';
      toast.error(error.message || `Failed to ${action} recipe. Please try again.`);
      console.error(`Error ${action}ing recipe:`, error);
    }
  };

  const handleImageCapture = async ({ file }) => {
    if (!file) return;
    // Add a guard to ensure the user is authenticated before proceeding.
    if (!user) {
      toast.error("You must be signed in to scan a recipe.");
      return;
    }

    setIsScanning(true);
    const loadingToast = toast.loading('Scanning recipe...');

    try {
      const newRecipe = await scanRecipeWithImage(file);

      toast.success('Recipe Scanned! Redirecting to edit...', { id: loadingToast });
      navigate(`/edit-recipe/${newRecipe.id}`);
    } catch (error) {
      toast.error(error.message || 'Failed to scan recipe.', { id: loadingToast });
      console.error('Error during scan:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="add-recipe-page min-h-screen bg-gray-50">
      <Header showSearch={false} />
      
      <main className="main-content pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {isEditMode ? 'Edit Recipe' : 'Add New Recipe'}
              </h1>
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!isEditMode && (
              <>
                <div className="text-center my-4">
                  <ScanRecipeButton
                    onImageCapture={handleImageCapture}
                    disabled={isScanning || !user}
                  />
                </div>
                <div className="flex items-center my-6">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-500">OR</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter recipe title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the recipe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cook Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="cookTime"
                    value={formData.cookTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servings
                  </label>
                  <input
                    type="number"
                    name="servings"
                    value={formData.servings}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredients *
                </label>
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleDynamicListChange('ingredients', index, e.target.value)}
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Ingredient ${index + 1}`}
                    />
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDynamicListItem('ingredients', index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addDynamicListItem('ingredients')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Ingredient
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions *
                </label>
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <textarea
                      value={instruction}
                      onChange={(e) => handleDynamicListChange('instructions', index, e.target.value)}
                      required
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Step ${index + 1}`}
                    />
                    {formData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDynamicListItem('instructions', index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addDynamicListItem('instructions')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Step
                </button>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isEditMode ? 'Update Recipe' : 'Save Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddRecipe;
