import React from 'react';
import RecipeCard from './RecipeCard';

const RecipeGrid = ({ recipes }) => {
  if (recipes.length === 0) {
    return (
      <div className="empty-state text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
        <p className="text-gray-500">Try adjusting your search terms or browse all recipes.</p>
      </div>
    );
  }

  return (
    <div className="recipe-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};

export default RecipeGrid;
