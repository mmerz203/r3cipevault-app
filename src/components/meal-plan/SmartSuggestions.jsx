import React, { useState, useMemo } from 'react';

const SmartSuggestions = ({ 
  recipes = [], 
  pantryItems = [], 
  mealHistory = [], 
  onSelectRecipe,
  onDismiss 
}) => {
  const [dismissedSuggestions, setDismissedSuggestions] = useState([]);

  // Generate suggestions based on available data
  const suggestions = useMemo(() => {
    const allSuggestions = [];

    // Defensive programming - ensure arrays are valid
    const safeRecipes = Array.isArray(recipes) ? recipes : [];
    const safePantryItems = Array.isArray(pantryItems) ? pantryItems : [];
    const safeMealHistory = Array.isArray(mealHistory) ? mealHistory : [];

    // 1. "Use Your Pantry!" suggestions
    if (safePantryItems.length > 0) {
      const pantryIngredients = safePantryItems.map(item => item.item?.toLowerCase() || '').filter(Boolean);
      const pantryRecipes = safeRecipes.filter(recipe =>
        recipe.ingredients && Array.isArray(recipe.ingredients) &&
        recipe.ingredients.some(ingredient =>
          pantryIngredients.some(pantryItem =>
            ingredient.toLowerCase().includes(pantryItem)
          )
        )
      );

      if (pantryRecipes.length > 0) {
        const randomPantryRecipe = pantryRecipes[Math.floor(Math.random() * pantryRecipes.length)];
        allSuggestions.push({
          id: 'pantry-suggestion',
          type: 'pantry',
          title: 'Use Your Pantry!',
          subtitle: 'Make something with ingredients you already have',
          recipe: randomPantryRecipe,
          icon: '🥫',
          color: 'bg-green-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700'
        });
      }
    }

    // 2. "Quick & Easy" suggestions (recipes with cook time <= 30 min)
    const quickRecipes = safeRecipes.filter(recipe => {
      const cookTime = parseInt(recipe.cookTime || '0');
      return !isNaN(cookTime) && cookTime <= 30;
    });

    if (quickRecipes.length > 0) {
      const randomQuickRecipe = quickRecipes[Math.floor(Math.random() * quickRecipes.length)];
      allSuggestions.push({
        id: 'quick-suggestion',
        type: 'quick',
        title: 'Quick & Easy',
        subtitle: 'Perfect for a busy day',
        recipe: randomQuickRecipe,
        icon: '⚡',
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700'
      });
    }

    // 3. "Past Favorites" suggestions (recipes not used recently)
    if (safeMealHistory.length > 0) {
      const recentRecipeIds = new Set(safeMealHistory.slice(-10).map(meal => meal.recipeId).filter(Boolean));
      const oldFavorites = safeRecipes.filter(recipe => recipe.id && !recentRecipeIds.has(recipe.id));

      if (oldFavorites.length > 0) {
        const randomOldFavorite = oldFavorites[Math.floor(Math.random() * oldFavorites.length)];
        allSuggestions.push({
          id: 'favorite-suggestion',
          type: 'favorite',
          title: 'Past Favorites',
          subtitle: "Haven't made this in a while",
          recipe: randomOldFavorite,
          icon: '❤️',
          color: 'bg-pink-500',
          bgColor: 'bg-pink-50',
          textColor: 'text-pink-700'
        });
      }
    }

    // 4. "Try Something New" for variety
    if (safeRecipes.length > 0) {
      const randomRecipe = safeRecipes[Math.floor(Math.random() * safeRecipes.length)];
      allSuggestions.push({
        id: 'new-suggestion',
        type: 'new',
        title: 'Try Something New',
        subtitle: 'Expand your culinary horizons',
        recipe: randomRecipe,
        icon: '✨',
        color: 'bg-purple-500',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700'
      });
    }

    // Filter out dismissed suggestions
    return allSuggestions.filter(suggestion => 
      !dismissedSuggestions.includes(suggestion.id)
    );
  }, [recipes, pantryItems, mealHistory, dismissedSuggestions]);

  const handleDismiss = (suggestionId) => {
    setDismissedSuggestions(prev => [...prev, suggestionId]);
    if (onDismiss) {
      onDismiss(suggestionId);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    if (onSelectRecipe) {
      onSelectRecipe(suggestion.recipe);
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="smart-suggestions mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">🧠</span>
          Smart Suggestions
        </h2>
        <div className="text-sm text-gray-500">
          {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {suggestions.slice(0, 2).map((suggestion) => (
          <div
            key={suggestion.id}
            className={`suggestion-card ${suggestion.bgColor} border border-opacity-20 rounded-lg p-4 relative group hover:shadow-md transition-all duration-200`}
          >
            {/* Dismiss button */}
            <button
              onClick={() => handleDismiss(suggestion.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white hover:bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-10 h-10 ${suggestion.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                {suggestion.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold ${suggestion.textColor} mb-1`}>
                  {suggestion.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {suggestion.subtitle}
                </p>

                {/* Recipe preview */}
                <div 
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow group/recipe"
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={suggestion.recipe.image} 
                      alt={suggestion.recipe.title}
                      className="w-12 h-12 object-cover rounded-lg"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover/recipe:text-orange-600">
                        {suggestion.recipe.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                        <span>{suggestion.recipe.cookTime}</span>
                        <span>•</span>
                        <span>{suggestion.recipe.difficulty}</span>
                      </div>
                    </div>
                    <svg 
                      className="w-4 h-4 text-gray-400 group-hover/recipe:text-orange-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more suggestions if available */}
      {suggestions.length > 2 && (
        <div className="mt-4 text-center">
          <button 
            onClick={() => {
              // For now, just shuffle the suggestions order
              setDismissedSuggestions([]);
            }}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            Refresh Suggestions ({suggestions.length - 2} more available)
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;
