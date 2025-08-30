import api from './api';

export const getPantryItems = async () => {
  const response = await api.get('/pantry');
  return response.data;
};

export const addPantryItem = async (itemData) => {
  const response = await api.post('/pantry', itemData);
  return response.data;
};

export const removePantryItem = async (itemId) => {
  await api.delete(`/pantry/${itemId}`);
};