import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import * as shoppingListApi from '../services/shoppingListService';
import toast from 'react-hot-toast';

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const location = useLocation();

  // Get ingredients from meal plan if navigated from meal planning page
  const mealPlanIngredients = location.state?.mealPlanIngredients || [];

  useEffect(() => {
    // The user check is now handled by the backend via secure cookies/tokens.
    // The API service will fail if the user is not authenticated.
    const fetchItems = async () => {
      setLoading(true);
      try {
        const fetchedItems = await shoppingListApi.getShoppingList();
        setItems(fetchedItems);
      } catch (error) {
        toast.error(error.message || 'Failed to load shopping list.');
        setItems([]); // Clear items on error
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [user]);

useEffect(() => {
    // This condition checks if the function should run.
    if (user && mealPlanIngredients.length > 0) {
      const addIngredients = async () => {
        try {
          // The backend will now handle the logic of adding/updating items
          // from the meal plan ingredients list.
          const updatedItems = await shoppingListApi.addMealPlanIngredients(mealPlanIngredients);
          setItems(updatedItems); // Refresh the list with the updated data from the server
          toast.success(`Added ${mealPlanIngredients.length} ingredients from meal plan!`);
        } catch (error) {
          console.error('Error adding meal plan ingredients:', error);
          toast.error(error.message || 'Failed to add some ingredients from meal plan');
        }
      };
      
      addIngredients();
    }
  }, [user, mealPlanIngredients]);

  const toggleItem = async (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newCompleted = !item.completed;
    
    // Optimistic update
    setItems(items.map(item => 
      item.id === itemId ? { ...item, completed: newCompleted } : item
    ));

    try {
      await shoppingListApi.toggleItem(itemId, newCompleted);
    } catch (error) {
      console.error('Error toggling item:', error);
      // Revert optimistic update
      setItems(items.map(item => 
        item.id === itemId ? { ...item, completed: !newCompleted } : item
      ));
      toast.error(error.message || 'Failed to update item');
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const originalItems = items;
    setNewItem('');
    setNewQuantity('');

    try {
      // The API now handles creating the item and returns the updated list.
      // For a more responsive UI, we could add the item optimistically
      // and then replace it with the server-returned version.
      // For simplicity here, we'll just refetch.
      const newItemData = await shoppingListApi.addItem(newItem.trim(), newQuantity.trim());
      // The backend should return the newly created item, or the full list.
      // Assuming it returns the new item.
      setItems(prevItems => [newItemData, ...prevItems]);
    } catch (error) {
      console.error('Error adding item:', error);
      setItems(originalItems); // Revert on error
      toast.error(error.message || 'Failed to add item');
    }
  };

  const removeItem = async (itemId) => {
    const itemToRemove = items.find(item => item.id === itemId);
    // Optimistic update
    setItems(items.filter(item => item.id !== itemId));

    try {
      await shoppingListApi.removeItem(itemId);
      toast.success('Item removed');
    } catch (error) {
      console.error('Error removing item:', error);
      // Revert optimistic update
      setItems([...items, itemToRemove]);
      toast.error(error.message || 'Failed to remove item');
    }
  };

  const clearCompleted = async () => {
    const completedItems = items.filter(item => item.completed);
    const remainingItems = items.filter(item => !item.completed);
    
    if (completedItems.length === 0) {
      toast.error('No completed items to clear');
      return;
    }

    // Optimistic update
    setItems(remainingItems);

    try {
      await shoppingListApi.clearCompletedItems();
      toast.success(`Cleared ${completedItems.length} completed items`);
    } catch (error) {
      console.error('Error clearing completed items:', error);
      setItems(items); // Revert optimistic update
      toast.error(error.message || 'Failed to clear some items');
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'meal_plan': return '📅';
      case 'manual': return '✏️';
      default: return '📝';
    }
  };

  const getSourceTooltip = (item) => {
    if (item.sources && item.sources.length > 0) {
      const mealPlanSources = item.sources.filter(s => s.type === 'meal_plan');
      const manualSources = item.sources.filter(s => s.type === 'manual');
      
      let tooltip = '';
      if (mealPlanSources.length > 0) {
        tooltip += `From meal plan (${mealPlanSources.length} recipe${mealPlanSources.length > 1 ? 's' : ''})`;
      }
      if (manualSources.length > 0) {
        if (tooltip) tooltip += ' and ';
        tooltip += 'manually added';
      }
      return tooltip;
    }
    return item.source === 'meal_plan' ? 'From meal plan' : 'Manually added';
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading your shopping list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-list-page min-h-screen bg-gray-50 pb-20">
      <div className="shopping-header bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title text-2xl font-bold text-gray-900 mb-2">Shopping List</h1>
              <p className="progress-text text-sm text-gray-600">
                {completedCount} of {totalCount} items completed
              </p>
            </div>
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="clear-completed-btn text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors duration-200"
              >
                Clear Completed
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="shopping-content max-w-4xl mx-auto p-6">
        {/* Meal Plan Integration Info */}
        {mealPlanIngredients.length > 0 && (
          <div className="meal-plan-notice bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  <strong>{mealPlanIngredients.length} ingredients</strong> from your meal plan have been automatically added to your shopping list.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={addItem} className="add-item-form bg-white rounded-lg p-4 shadow-sm mb-6">
          <h3 className="form-title text-lg font-semibold text-gray-900 mb-3">Add New Item</h3>
          <div className="form-grid grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Item name"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="input-field px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Quantity"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              className="input-field px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button 
              type="submit" 
              className="btn-primary bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Add Item
            </button>
          </div>
        </form>

        <div className="items-list bg-white rounded-lg shadow-sm overflow-hidden">
          {items.length === 0 ? (
            <div className="empty-state text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M7 13v4a2 2 0 002 2h2m3-6v6a2 2 0 002 2h2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your shopping list is empty</h3>
              <p className="text-gray-500">Add items above or plan some meals to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="list-item flex items-center p-4 hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`checkbox w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                      item.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {item.completed && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="item-details flex-1">
                    <div className={`item-name font-medium flex items-center ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      <span>{item.item}</span>
                      <span 
                        className="ml-2 text-xs"
                        title={getSourceTooltip(item)}
                      >
                        {getSourceIcon(item.source)}
                      </span>
                    </div>
                    <div className={`item-quantity text-sm ${item.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.quantity}
                    </div>
                    {item.sources && item.sources.length > 1 && (
                      <div className="text-xs text-orange-600 mt-1">
                        Used in {item.sources.filter(s => s.type === 'meal_plan').length} recipes
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="remove-button w-8 h-8 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shopping Stats */}
        {items.length > 0 && (
          <div className="shopping-stats mt-6 bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Shopping Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="stat-item">
                <div className="stat-number text-2xl font-bold text-blue-500">{totalCount}</div>
                <div className="stat-label text-sm text-gray-600">Total Items</div>
              </div>
              <div className="stat-item">
                <div className="stat-number text-2xl font-bold text-green-500">{completedCount}</div>
                <div className="stat-label text-sm text-gray-600">Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number text-2xl font-bold text-orange-500">
                  {items.filter(item => item.source === 'meal_plan').length}
                </div>
                <div className="stat-label text-sm text-gray-600">From Meals</div>
              </div>
              <div className="stat-item">
                <div className="stat-number text-2xl font-bold text-purple-500">
                  {Math.round((completedCount / totalCount) * 100)}%
                </div>
                <div className="stat-label text-sm text-gray-600">Progress</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
