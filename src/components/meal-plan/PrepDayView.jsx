import React, { useMemo, useState } from 'react';
import { ShoppingListService } from '../../services/shoppingListService';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';

const PrepDayView = ({ mealPlan, recipes = [], onBack, onRecipeClick }) => {
  const [selectedIngredients, setSelectedIngredients] = useState(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useUser();
  // Helper functions
  const getTaskCategory = (instruction) => {
    const lower = instruction.toLowerCase();
    if (lower.includes('chop') || lower.includes('dice') || lower.includes('slice') || lower.includes('cut')) {
      return 'cutting';
    }
    if (lower.includes('marinate') || lower.includes('season')) {
      return 'marinating';
    }
    if (lower.includes('wash') || lower.includes('clean') || lower.includes('rinse')) {
      return 'cleaning';
    }
    return 'prep';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cutting': return '🔪';
      case 'marinating': return '🥄';
      case 'cleaning': return '🧽';
      default: return '👨‍🍳';
    }
  };

  const getMealTypeIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  // Aggregate all ingredients and prep tasks for the week
  const weeklyPrep = useMemo(() => {
    // Defensive programming - ensure data is valid
    if (!mealPlan || !mealPlan.meals || !Array.isArray(mealPlan.meals)) {
      return {
        ingredients: [],
        prepTasks: [],
        recipePreps: [],
        totalRecipes: 0,
        totalIngredients: 0
      };
    }

    if (!Array.isArray(recipes)) {
      return {
        ingredients: [],
        prepTasks: [],
        recipePreps: [],
        totalRecipes: 0,
        totalIngredients: 0
      };
    }
    const ingredientMap = new Map();
    const prepTasks = [];
    const recipePreps = [];

    mealPlan.meals.forEach((day, dayIndex) => {
      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const meal = day[mealType];
        if (meal) {
          const recipe = recipes.find(r => r.id === meal.id);
          if (recipe && recipe.ingredients && Array.isArray(recipe.ingredients)) {
            // Aggregate ingredients
            recipe.ingredients.forEach(ingredient => {
              const cleanIngredient = ingredient.toLowerCase().trim();
              const existing = ingredientMap.get(cleanIngredient);
              if (existing) {
                existing.count += 1;
                existing.meals.push({ day: day.day, mealType, recipe: recipe.title });
              } else {
                ingredientMap.set(cleanIngredient, {
                  ingredient: ingredient,
                  count: 1,
                  meals: [{ day: day.day, mealType, recipe: recipe.title }]
                });
              }
            });

            // Add recipe prep info
            recipePreps.push({
              day: day.day,
              dayIndex,
              mealType,
              recipe: recipe,
              prepTime: recipe.prepTime || recipe.cookTime || '20 min'
            });
          }
        }
      });
    });

    // Convert ingredients map to sorted array
    const ingredients = Array.from(ingredientMap.values())
      .sort((a, b) => b.count - a.count);

    // Generate prep tasks based on recipes
    const taskMap = new Map();
    
    recipePreps.forEach(({ recipe, day, mealType }) => {
      // Extract common prep tasks from instructions
      if (recipe.instructions && Array.isArray(recipe.instructions)) {
        recipe.instructions.forEach((instruction, index) => {
          const lowerInstruction = instruction.toLowerCase();

          // Identify prep tasks (can be done ahead)
          const prepKeywords = ['chop', 'dice', 'slice', 'mince', 'cut', 'prep', 'wash', 'clean', 'marinate'];
          const isPrepTask = prepKeywords.some(keyword => lowerInstruction.includes(keyword));

          if (isPrepTask) {
            const taskKey = `${recipe.id}-${index}`;
            if (!taskMap.has(taskKey)) {
              taskMap.set(taskKey, {
                id: taskKey,
                task: instruction,
                recipe: recipe.title,
                recipeId: recipe.id,
                estimatedTime: '5-10 min',
                category: getTaskCategory(instruction)
              });
            }
          }
        });
      }
    });

    return {
      ingredients,
      prepTasks: Array.from(taskMap.values()),
      recipePreps: recipePreps.sort((a, b) => a.dayIndex - b.dayIndex),
      totalRecipes: recipePreps.length,
      totalIngredients: ingredients.length
    };
  }, [mealPlan, recipes]);

  const exportSelectedIngredients = async () => {
    if (!user || selectedIngredients.size === 0) return;

    setIsExporting(true);
    try {
      const selectedItems = Array.from(selectedIngredients).map(index => weeklyPrep.ingredients[index]);

      for (const item of selectedItems) {
        const quantity = item.count > 1 ? `${item.count}` : '1';
        await ShoppingListService.addOrUpdateItem(
          user.uid,
          item.ingredient,
          quantity,
          'meal_plan',
          'prep_export' // Special identifier for manual exports from prep view
        );
      }

      setSelectedIngredients(new Set());
      toast.success(`Added ${selectedItems.length} ingredients to shopping list!`);
    } catch (error) {
      console.error('Error exporting ingredients:', error);
      toast.error('Failed to add some ingredients to shopping list');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="prep-day-view min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="prep-header bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Meal Prep</h1>
              <p className="text-sm text-gray-600">{mealPlan.week}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">{weeklyPrep.totalRecipes}</div>
            <div className="text-sm text-gray-600">Recipes to Prep</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{weeklyPrep.totalIngredients}</div>
            <div className="text-sm text-gray-600">Unique Ingredients</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{weeklyPrep.prepTasks.length}</div>
            <div className="text-sm text-gray-600">Prep Tasks</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
              {Math.round(weeklyPrep.recipePreps.reduce((total, prep) => {
                const time = parseInt(prep.prepTime) || 20;
                return total + time;
              }, 0) / 60)}h
            </div>
            <div className="text-sm text-gray-600">Est. Prep Time</div>
          </div>
        </div>

        {/* Ingredients List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🛒</span>
              Shopping & Ingredients List
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (selectedIngredients.size === weeklyPrep.ingredients.length) {
                    setSelectedIngredients(new Set());
                  } else {
                    setSelectedIngredients(new Set(weeklyPrep.ingredients.map((_, index) => index)));
                  }
                }}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                {selectedIngredients.size === weeklyPrep.ingredients.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={exportSelectedIngredients}
                disabled={selectedIngredients.size === 0 || isExporting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedIngredients.size === 0 || isExporting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M7 13v4a2 2 0 002 2h2m3-6v6a2 2 0 002 2h2" />
                </svg>
                <span className="text-sm">
                  {isExporting ? 'Adding...' : `Add to Shopping List (${selectedIngredients.size})`}
                </span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weeklyPrep.ingredients.map((item, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedIngredients.has(index)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedIngredients);
                    if (e.target.checked) {
                      newSelected.add(index);
                    } else {
                      newSelected.delete(index);
                    }
                    setSelectedIngredients(newSelected);
                  }}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 mr-3"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">{item.ingredient}</span>
                  {item.count > 1 && (
                    <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                      {item.count}x recipes
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {item.meals.length} meal{item.meals.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
          {selectedIngredients.size > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-orange-700">
                  <strong>{selectedIngredients.size}</strong> ingredient{selectedIngredients.size !== 1 ? 's' : ''} selected for export
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Prep Tasks */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👨‍🍳</span>
            Prep Tasks (Can Do Ahead)
          </h2>
          {weeklyPrep.prepTasks.length > 0 ? (
            <div className="space-y-3">
              {weeklyPrep.prepTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm">
                    {getCategoryIcon(task.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{task.task}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      For: <button 
                        onClick={() => onRecipeClick && onRecipeClick(task.recipeId)}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        {task.recipe}
                      </button>
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 flex-shrink-0">
                    {task.estimatedTime}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No specific prep tasks identified. Most recipes can be prepared fresh on the day.
            </p>
          )}
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📅</span>
            Weekly Cooking Schedule
          </h2>
          <div className="space-y-4">
            {mealPlan.meals.map((day, dayIndex) => {
              const dayMeals = weeklyPrep.recipePreps.filter(prep => prep.dayIndex === dayIndex);
              
              if (dayMeals.length === 0) return null;

              return (
                <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {day.day}, {day.date}
                  </h3>
                  <div className="space-y-2">
                    {dayMeals.map((prep, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm">{getMealTypeIcon(prep.mealType)}</span>
                          <div>
                            <button
                              onClick={() => onRecipeClick && onRecipeClick(prep.recipe.id)}
                              className="text-sm font-medium text-gray-900 hover:text-orange-600"
                            >
                              {prep.recipe.title}
                            </button>
                            <p className="text-xs text-gray-600 capitalize">{prep.mealType}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {prep.prepTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrepDayView;
