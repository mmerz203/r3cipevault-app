import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockMealPlan, mockRecipes } from '../data/mockData';

const MealPlan = () => {
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState(mockMealPlan);

  const handleRecipeClick = (recipeId) => {
    if (recipeId) {
      navigate(`/recipes/${recipeId}`);
    }
  };

  const addMealToDay = (dayIndex, mealType) => {
    // Simple implementation - just cycle through available recipes
    const availableRecipes = mockRecipes.filter(recipe => recipe.id <= 6);
    const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
    
    const updatedMealPlan = { ...mealPlan };
    updatedMealPlan.meals[dayIndex][mealType] = {
      id: randomRecipe.id,
      title: randomRecipe.title,
      image: randomRecipe.image
    };
    setMealPlan(updatedMealPlan);
  };

  const removeMealFromDay = (dayIndex, mealType) => {
    const updatedMealPlan = { ...mealPlan };
    updatedMealPlan.meals[dayIndex][mealType] = null;
    setMealPlan(updatedMealPlan);
  };

  const MealSlot = ({ meal, dayIndex, mealType, mealLabel }) => {
    if (meal) {
      return (
        <div className="meal-slot relative group">
          <div 
            onClick={() => handleRecipeClick(meal.id)}
            className="meal-card bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-transform hover:scale-105"
          >
            <img 
              src={meal.image} 
              alt={meal.title}
              className="w-full h-20 object-cover"
            />
            <div className="p-2">
              <h4 className="meal-type text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">
                {mealLabel}
              </h4>
              <p className="meal-title text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                {meal.title}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeMealFromDay(dayIndex, mealType);
            }}
            className="remove-meal absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      );
    }

    return (
      <div className="meal-slot">
        <button
          onClick={() => addMealToDay(dayIndex, mealType)}
          className="add-meal w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs font-medium">{mealLabel}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="meal-plan-page min-h-screen bg-gray-50 pb-20">
      <div className="meal-plan-header bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="page-title text-2xl font-bold text-gray-900 mb-2">Meal Plan</h1>
          <p className="week-info text-sm text-gray-600">{mealPlan.week}</p>
        </div>
      </div>

      <div className="meal-plan-content max-w-4xl mx-auto p-6">
        <div className="weekly-overview bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="overview-title text-lg font-semibold text-gray-900 mb-3">This Week's Overview</h2>
          <div className="stats-grid grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="stat-item">
              <div className="stat-number text-2xl font-bold text-orange-500">
                {mealPlan.meals.reduce((count, day) => 
                  count + (day.breakfast ? 1 : 0) + (day.lunch ? 1 : 0) + (day.dinner ? 1 : 0), 0
                )}
              </div>
              <div className="stat-label text-sm text-gray-600">Meals Planned</div>
            </div>
            <div className="stat-item">
              <div className="stat-number text-2xl font-bold text-blue-500">7</div>
              <div className="stat-label text-sm text-gray-600">Days</div>
            </div>
            <div className="stat-item">
              <div className="stat-number text-2xl font-bold text-green-500">
                {new Set(mealPlan.meals.flatMap(day => 
                  [day.breakfast?.id, day.lunch?.id, day.dinner?.id].filter(Boolean)
                )).size}
              </div>
              <div className="stat-label text-sm text-gray-600">Unique Recipes</div>
            </div>
            <div className="stat-item">
              <div className="stat-number text-2xl font-bold text-purple-500">
                {21 - mealPlan.meals.reduce((count, day) => 
                  count + (day.breakfast ? 1 : 0) + (day.lunch ? 1 : 0) + (day.dinner ? 1 : 0), 0
                )}
              </div>
              <div className="stat-label text-sm text-gray-600">Open Slots</div>
            </div>
          </div>
        </div>

        <div className="days-container space-y-6">
          {mealPlan.meals.map((day, dayIndex) => (
            <div key={day.day} className="day-section bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="day-header bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="day-name text-lg font-semibold text-gray-900">{day.day}</h3>
                    <p className="day-date text-sm text-gray-600">{day.date}</p>
                  </div>
                  <div className="meals-count text-sm text-gray-500">
                    {[day.breakfast, day.lunch, day.dinner].filter(Boolean).length}/3 meals
                  </div>
                </div>
              </div>

              <div className="day-meals p-4">
                <div className="meals-grid grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <MealSlot 
                    meal={day.breakfast} 
                    dayIndex={dayIndex} 
                    mealType="breakfast" 
                    mealLabel="Breakfast"
                  />
                  <MealSlot 
                    meal={day.lunch} 
                    dayIndex={dayIndex} 
                    mealType="lunch" 
                    mealLabel="Lunch"
                  />
                  <MealSlot 
                    meal={day.dinner} 
                    dayIndex={dayIndex} 
                    mealType="dinner" 
                    mealLabel="Dinner"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="actions-section mt-8 space-y-4">
          <button 
            onClick={() => {
              const ingredients = new Set();
              mealPlan.meals.forEach(day => {
                [day.breakfast, day.lunch, day.dinner].forEach(meal => {
                  if (meal) {
                    const recipe = mockRecipes.find(r => r.id === meal.id);
                    if (recipe) {
                      recipe.ingredients.forEach(ingredient => ingredients.add(ingredient));
                    }
                  }
                });
              });
              navigate('/shopping-list', { state: { mealPlanIngredients: Array.from(ingredients) } });
            }}
            className="generate-list-btn w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Generate Shopping List from Meal Plan
          </button>
          
          <div className="action-buttons grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="btn-secondary">
              Clear All Meals
            </button>
            <button className="btn-secondary">
              Randomize Week
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlan;
