import { useState, useCallback } from 'react';

export const useDynamicList = (initialValue = ['']) => {
  const [items, setItems] = useState(initialValue);

  const handleChange = useCallback((index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  }, [items]);

  const addItem = useCallback(() => {
    setItems(prev => [...prev, '']);
  }, []);

  const removeItem = useCallback((index) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  }, [items]);

  // This is useful when loading data from an external source
  const setItemsDirectly = useCallback((newItems) => {
    // Ensure there's always at least one empty item if the list is cleared
    setItems(newItems && newItems.length > 0 ? newItems : ['']);
  }, []);

  return { items, handleChange, addItem, removeItem, setItemsDirectly };
};