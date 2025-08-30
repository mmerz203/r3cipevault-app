import React, { useMemo } from 'react';
import * as shoppingListApi from '../../services/shoppingListService';
import toast from 'react-hot-toast';

const PrepDayView = ({ mealPlan, recipes, onBack, onRecipeClick }) => {
  const prepItems = useMemo(() => {
    const items = [];
    mealPlan.meals.forEach(day => {
      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const meal = day[mealType];
        if (meal) {
          const recipe = recipes.find(r => r.id === meal.id);
          if (recipe) {
            items.push({ ...recipe, day: day.date, mealType });
          }
        }
      });
    });
    return items;
  }, [mealPlan, recipes]);

  const allIngredients = useMemo(() => {
    const ingredients = new Set();
    prepItems.forEach(item => {
      item.ingredients?.forEach(ing => ingredients.add(ing));
    });
    return Array.from(ingredients);
  }, [prepItems]);

  const handleAddAllToShoppingList = async () => {
    if (allIngredients.length === 0) {
      toast.error('No ingredients to add to the shopping list.');
      return;
    }
    try {
      await shoppingListApi.addMealPlanIngredients(allIngredients);
      toast.success('All prep ingredients added to shopping list!');
    } catch (error) {
      toast.error(error.message || 'Failed to add ingredients to shopping list.');
      console.error('Error adding all prep ingredients:', error);
    }
  };

  return (
    <div className="prep-day-view-page min-h-screen bg-gray-50 pb-20">
      <div className="prep-day-header bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              &larr; Back to Meal Plan
            </button>
            <h1 className="text-xl font-bold text-gray-900">Meal Prep View</h1>
            <button onClick={handleAddAllToShoppingList} className="btn-primary">
              Add All to Shopping List
            </button>
          </div>
        </div>
      </div>
      <div className="prep-day-content max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Recipes for the week</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prepItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow" onClick={() => onRecipeClick(item.id)}>
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-sm text-gray-500">{new Date(item.day).toLocaleDateString(undefined, { weekday: 'long' })} - {item.mealType}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrepDayView;