import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RecipeGrid from '../components/RecipeGrid';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import { getRecipes } from '@/services/recipeService';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        // The new API endpoint will return all recipes for the user,
        // including any "default" or "mock" recipes if that's the desired logic.
        const fetchedRecipes = await getRecipes();
        setRecipes(fetchedRecipes);
      } catch (error) {
        toast.error(error.message || "Failed to load recipes.");
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };
    // Fetch recipes if the user is loaded. The backend will handle authorization.
    if (user) {
      fetchRecipes();
    } else if (user === null) { // user is loaded, but not logged in
      setLoading(false);
      setRecipes([]); // Or set to public/mock recipes if the app supports that
    }
  }, [user]);

  const filteredRecipes = useMemo(() => {
    if (!searchTerm.trim()) {
      return recipes;
    }
    
    return recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, recipes]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="home-page min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />
      
      <main className="main-content pt-24 pb-20">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center p-10 text-gray-600">Loading your recipes...</div>
          ) : (
            <>
              {searchTerm && (
                <div className="search-results-header px-4 mb-4">
                  <p className="text-sm text-gray-600">
                    {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
                    {searchTerm && ` for "${searchTerm}"`}
                  </p>
                </div>
              )}
              <RecipeGrid recipes={filteredRecipes} />
            </>
          )}
        </div>
      </main>

      {/* Floating Action Button for Add Recipe */}
      <button 
        onClick={() => navigate('/add-recipe')}
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