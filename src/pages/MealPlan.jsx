import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockPantryItems } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { getRecipes } from '@/services/recipeService';
import * as shoppingListApi from '@/services/shoppingListService';
import { generateWeekMealPlan, addWeeks, getWeekStart, formatDateRange, isToday } from '../utils/dateUtils';
import WeekView from '../components/meal-plan/WeekView';
import AddMealModal from '../components/meal-plan/AddMealModal';
import SmartSuggestions from '../components/meal-plan/SmartSuggestions';
import ShoppingListToast, { useShoppingListToast } from '../components/meal-plan/ShoppingListToast';
import PrepDayView from '../components/meal-plan/PrepDayView';
import MealPlanErrorBoundary from '../components/meal-plan/MealPlanErrorBoundary';
import toast from 'react-hot-toast';

const MealPlanComponent = () => {
  const navigate = useNavigate();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const [mealPlan, setMealPlan] = useState(() => generateWeekMealPlan(getWeekStart(new Date()))); // This could also be fetched from a backend
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMealSlot, setSelectedMealSlot] = useState(null);
  const [showPrepView, setShowPrepView] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { user } = useUser();
  const { toastState, showToast, hideToast } = useShoppingListToast();

  // Update meal plan when week changes
  useEffect(() => {
    const newMealPlan = generateWeekMealPlan(currentWeekStart);
    setMealPlan(newMealPlan);
  }, [currentWeekStart]);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDatePicker && !event.target.closest('.date-picker-container')) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  useEffect(() => {
    const fetchUserRecipes = async () => {
      setLoading(true);
      try {
        // The backend now provides the consolidated list of user recipes and any defaults.
        const fetchedRecipes = await getRecipes();
        setUserRecipes(fetchedRecipes);
      } catch (error) {
        console.error("Error fetching user recipes:", error);
        toast.error(error.message || 'Failed to load your recipes.');
        setUserRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserRecipes();
    } else if (user === null) { // User is loaded, but not logged in
      setLoading(false);
    }
  }, [user]);

  const handleRecipeClick = (recipeId) => {
    if (recipeId) {
      navigate(`/recipes/${recipeId}`);
    }
  };

  const handleAddMeal = (dayIndex, mealType, day) => {
    setSelectedMealSlot({ dayIndex, mealType, day });
    setShowAddMealModal(true);
  };

  const handleSelectRecipe = async (recipe) => {
    if (selectedMealSlot) {
      const { dayIndex, mealType } = selectedMealSlot;
      const updatedMealPlan = { ...mealPlan };
      updatedMealPlan.meals[dayIndex][mealType] = {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image
      };
      setMealPlan(updatedMealPlan);

      // Automatically add recipe ingredients to shopping list
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        try {
          // The backend will handle adding all ingredients and aggregating quantities.
          await shoppingListApi.addMealPlanIngredients(recipe.ingredients);
          toast.success(`Added ${recipe.ingredients.length} ingredients to shopping list`);
        } catch (error) {
          console.error('Error adding ingredients to shopping list:', error);
          toast.error(error.message || 'Failed to update shopping list');
        }
      }

      // Show toast notification for shopping list update
      const ingredientCount = recipe.ingredients?.length || 0;
      showToast(recipe.title, ingredientCount);
    }
    setShowAddMealModal(false);
    setSelectedMealSlot(null);
  };

  const handleRemoveMeal = async (dayIndex, mealType) => {
    const removedMeal = mealPlan.meals[dayIndex][mealType];
    const updatedMealPlan = { ...mealPlan };
    updatedMealPlan.meals[dayIndex][mealType] = null;
    setMealPlan(updatedMealPlan);

    // Remove meal ingredients from shopping list
    if (removedMeal) {
      try {
        await shoppingListApi.removeMealIngredients(removedMeal.id);
        toast.success('Removed meal ingredients from shopping list');
      } catch (error) {
        console.error('Error removing meal ingredients:', error);
        toast.error(error.message || 'Failed to update shopping list');
      }
    }
  };

  const handleMoveMeal = (meal, sourceDayIndex, sourceMealType, targetDayIndex, targetMealType) => {
    const updatedMealPlan = { ...mealPlan };
    
    // Get the meal at the target position
    const targetMeal = updatedMealPlan.meals[targetDayIndex][targetMealType];
    
    // Move the meal to the new position
    updatedMealPlan.meals[targetDayIndex][targetMealType] = meal;
    
    // If there was a meal at the target, move it to the source position (swap)
    // Otherwise, just clear the source position
    updatedMealPlan.meals[sourceDayIndex][sourceMealType] = targetMeal || null;
    
    setMealPlan(updatedMealPlan);
  };

  const handleSuggestionSelect = (recipe) => {
    // Find the first empty slot and suggest adding there
    for (let dayIndex = 0; dayIndex < mealPlan.meals.length; dayIndex++) {
      const day = mealPlan.meals[dayIndex];
      for (const mealType of ['breakfast', 'lunch', 'dinner']) {
        if (!day[mealType]) {
          setSelectedMealSlot({ dayIndex, mealType, day });
          handleSelectRecipe(recipe);
          return;
        }
      }
    }
    // If no empty slots, just show the modal
    setSelectedMealSlot({ dayIndex: 0, mealType: 'breakfast', day: mealPlan.meals[0] });
    handleSelectRecipe(recipe);
  };

  const generateShoppingList = () => {
    const ingredients = new Set();
    mealPlan.meals.forEach(day => {
      [day.breakfast, day.lunch, day.dinner].forEach(meal => {
        if (meal) {
          const recipe = userRecipes.find(r => r.id === meal.id);
          if (recipe) {
            recipe.ingredients?.forEach(ingredient => ingredients.add(ingredient));
          }
        }
      });
    });
    navigate('/shopping-list', { state: { mealPlanIngredients: Array.from(ingredients) } });
  };

  const clearAllMeals = async () => {
    // Get all current meal IDs for removal from shopping list
    const currentMealIds = new Set();
    mealPlan.meals.forEach(day => {
      if (day.breakfast) currentMealIds.add(day.breakfast.id);
      if (day.lunch) currentMealIds.add(day.lunch.id);
      if (day.dinner) currentMealIds.add(day.dinner.id);
    });

    const clearedMealPlan = {
      ...mealPlan,
      meals: mealPlan.meals.map(day => ({
        ...day,
        breakfast: null,
        lunch: null,
        dinner: null
      }))
    };
    setMealPlan(clearedMealPlan);

    // Remove all meal ingredients from shopping list
    if (currentMealIds.size > 0) {
      try {
        for (const mealId of currentMealIds) {
          await shoppingListApi.removeMealIngredients(mealId);
        }
        toast.success('Cleared all meals and updated shopping list');
      } catch (error) {
        console.error('Error clearing meal ingredients:', error);
        toast.error(error.message || 'Meals cleared but failed to update shopping list');
      }
    }
  };

  // Calendar navigation functions
  const navigateWeek = (direction) => {
    const newWeekStart = addWeeks(currentWeekStart, direction);
    setCurrentWeekStart(newWeekStart);
  };

  const goToToday = () => {
    const todayWeekStart = getWeekStart(new Date());
    setCurrentWeekStart(todayWeekStart);
  };

  const handleDateSelect = (event) => {
    const selectedDate = new Date(event.target.value);
    const weekStart = getWeekStart(selectedDate);
    setCurrentWeekStart(weekStart);
    setShowDatePicker(false);
  };

  const getCurrentWeekDisplay = () => {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6);
    return formatDateRange(currentWeekStart, weekEnd);
  };

  const isCurrentWeek = () => {
    const thisWeekStart = getWeekStart(new Date());
    return currentWeekStart.getTime() === thisWeekStart.getTime();
  };

  const randomizeWeek = () => {
    if (userRecipes.length === 0) return;
    
    const randomizedMealPlan = {
      ...mealPlan,
      meals: mealPlan.meals.map(day => ({
        ...day,
        breakfast: getRandomRecipe(),
        lunch: getRandomRecipe(),
        dinner: getRandomRecipe()
      }))
    };
    setMealPlan(randomizedMealPlan);
  };

  const getRandomRecipe = () => {
    if (userRecipes.length === 0) return null;
    const randomRecipe = userRecipes[Math.floor(Math.random() * userRecipes.length)];
    return {
      id: randomRecipe.id,
      title: randomRecipe.title,
      image: randomRecipe.image
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading your meal plan...</p>
        </div>
      </div>
    );
  }

  if (showPrepView) {
    return (
      <PrepDayView 
        mealPlan={mealPlan}
        recipes={userRecipes}
        onBack={() => setShowPrepView(false)}
        onRecipeClick={handleRecipeClick}
      />
    );
  }

  return (
    <div className="meal-plan-page min-h-screen bg-gray-50 pb-20">
      {/* Header with Calendar Navigation */}
      <div className="meal-plan-header bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="page-title text-2xl font-bold text-gray-900 mb-1">Meal Plan</h1>
              <div className="flex items-center space-x-2">
                <p className="week-info text-lg font-medium text-gray-700">{getCurrentWeekDisplay()}</p>
                {isCurrentWeek() && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    Current Week
                  </span>
                )}
              </div>
            </div>
            <button
              id="meal-prep-view-button"
              onClick={() => setShowPrepView(true)}
              className="prep-view-btn flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="hidden sm:inline">Meal Prep</span>
            </button>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => navigateWeek(1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {!isCurrentWeek() && (
                <button
                  onClick={goToToday}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium px-3 py-1 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  Go to Today
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative date-picker-container">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Jump to Date</span>
                </button>

                {showDatePicker && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                    <input
                      type="date"
                      onChange={handleDateSelect}
                      className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="meal-plan-content max-w-4xl mx-auto p-6">
        {/* Smart Suggestions */}
        <SmartSuggestions 
          recipes={userRecipes}
          pantryItems={mockPantryItems}
          mealHistory={[]} // This would come from user's meal history in a real app
          onSelectRecipe={handleSuggestionSelect}
        />

        {/* Week View */}
        <WeekView 
          mealPlan={mealPlan}
          onAddMeal={handleAddMeal}
          onRemoveMeal={handleRemoveMeal}
          onMoveMeal={handleMoveMeal}
          onRecipeClick={handleRecipeClick}
          userRecipes={userRecipes}
        />

        {/* Action Buttons */}
        <div className="actions-section mt-8 space-y-4">
          <button 
            onClick={generateShoppingList}
            className="generate-list-btn w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5" />
            </svg>
            <span>Generate Shopping List from Meal Plan</span>
          </button>
          
          <div className="action-buttons grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={clearAllMeals}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear All Meals</span>
            </button>
            <button 
              onClick={randomizeWeek}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Randomize Week</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Meal Modal */}
      <AddMealModal 
        isOpen={showAddMealModal}
        onClose={() => {
          setShowAddMealModal(false);
          setSelectedMealSlot(null);
        }}
        onSelectRecipe={handleSelectRecipe}
        recipes={userRecipes}
        selectedDay={selectedMealSlot?.day}
        mealType={selectedMealSlot?.mealType}
      />

      {/* Shopping List Toast */}
      <ShoppingListToast 
        isVisible={toastState.isVisible}
        onHide={hideToast}
        recipeName={toastState.recipeName}
        ingredientCount={toastState.ingredientCount}
      />
    </div>
  );
};

const MealPlan = () => (
  <MealPlanErrorBoundary>
    <MealPlanComponent />
  </MealPlanErrorBoundary>
);

export default MealPlan;
