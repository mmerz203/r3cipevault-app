import axios from 'axios';

// For local development, this is proxied by vite.config.js.
// For production, this will be the relative path to your backend.
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// To enable authentication with the new backend, you would add an interceptor like this.
// This requires a way to get the current user's token, likely from your UserContext
// and the Firebase Auth SDK.
/*
import { auth } from '@/firebase/config'; // Assuming you have a firebase config

apiClient.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));
*/

/**
 * Fetches all recipes for the authenticated user.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of recipes.
 */
export const getRecipes = async () => {
  try {
    const response = await apiClient.get('/recipes');
    return response.data;
  } catch (error) {
    console.error('Error fetching recipes:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to load recipes.');
  }
};

/**
 * Fetches a single recipe by its ID.
 * @param {string} id The ID of the recipe to fetch.
 * @returns {Promise<object>} A promise that resolves to the recipe object.
 */
export const getRecipeById = async (id) => {
  try {
    const response = await apiClient.get(`/recipes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recipe by ID:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to load recipe data.');
  }
};

/**
 * Creates a new recipe from manual form data.
 * @param {object} recipeData The recipe data from the form.
 * @returns {Promise<object>} A promise that resolves to the newly created recipe.
 */
export const createManualRecipe = async (recipeData) => {
  try {
    const response = await apiClient.post('/recipes', recipeData);
    return response.data;
  } catch (error) {
    console.error('Error creating manual recipe:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to save recipe.');
  }
};

/**
 * Updates an existing recipe by its ID.
 * @param {string} id The ID of the recipe to update.
 * @param {object} recipeData The updated recipe data.
 * @returns {Promise<object>} A promise that resolves to the updated recipe.
 */
export const updateRecipeById = async (id, recipeData) => {
  try {
    const response = await apiClient.put(`/recipes/${id}`, recipeData);
    return response.data;
  } catch (error) {
    console.error('Error updating recipe:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to update recipe.');
  }
};

/**
 * Creates a recipe by uploading an image to the backend OCR endpoint.
 * @param {File} imageFile The image file to be processed.
 * @returns {Promise<object>} A promise that resolves with the parsed recipe data.
 */
export const scanRecipeWithImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  try {
    const response = await apiClient.post('/recipes/import/ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error scanning recipe image:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to process image.');
  }
};

/**
 * Deletes a recipe by its ID.
 * @param {string} id The ID of the recipe to delete.
 * @returns {Promise<void>} A promise that resolves when the recipe is deleted.
 */
export const deleteRecipeById = async (id) => {
  try {
    // A DELETE request does not typically return a body on success (204 No Content)
    await apiClient.delete(`/recipes/${id}`);
  } catch (error) {
    console.error('Error deleting recipe:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to delete recipe.');
  }
};