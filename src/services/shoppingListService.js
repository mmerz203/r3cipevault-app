import api from './api';

/**
 * The new service makes API calls to the backend, which now handles all database logic.
 */
export const getShoppingList = async () => {
  const response = await api.get('/shopping-list');
  return response.data;
};

export const addItem = async (item, quantity) => {
  const response = await api.post('/shopping-list', { item, quantity: quantity || '1', source: 'manual' });
  return response.data;
};

export const toggleItem = async (itemId, completed) => {
  await api.put(`/shopping-list/${itemId}`, { completed });
};

export const removeItem = async (itemId) => {
  await api.delete(`/shopping-list/${itemId}`);
};

export const clearCompletedItems = async () => {
  await api.delete('/shopping-list/completed');
};

// These functions are related to meal plan integration. The backend will need
// corresponding endpoints to handle this logic.
export const addMealPlanIngredients = async (ingredients) => {
  const response = await api.post('/shopping-list/add-from-meal-plan', { ingredients });
  return response.data;
};

export const removeMealIngredients = async (recipeId) => {
  await api.post(`/shopping-list/remove-from-meal-plan/${recipeId}`);
};
