import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Header from '../components/Header';
import RecipeGrid from '../components/RecipeGrid';
import { mockRecipes } from '../data/mockData';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); // Initialize the hook

  const filteredRecipes = useMemo(() => {
    if (!searchTerm.trim()) {
      return mockRecipes;
    }
    
    return mockRecipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="home-page min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />
      
      <main className="main-content pt-24 pb-20">
        <div className="max-w-4xl mx-auto">
          {searchTerm && (
            <div className="search-results-header px-4 mb-4">
              <p className="text-sm text-gray-600">              with 

                {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found 
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>
          )}
          
          <RecipeGrid recipes={filteredRecipes} />
        </div>
      </main>

      {/* Floating Action Button for Add Recipe */}
      <button 
        onClick={() => navigate('/add-recipe')} // Use the navigate function
        className="fixed bottom-24 right-6 bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors duration-200 z-40"
        title="Add New Recipe"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
      </button>
    </div>
  );
};

export default HomePage;