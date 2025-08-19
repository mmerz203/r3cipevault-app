import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RecipeGrid from '../components/RecipeGrid';
import { mockRecipes } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const recipesRef = collection(db, 'users', user.uid, 'recipes');
    const q = query(recipesRef, orderBy('id', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRecipes = snapshot.docs.map(doc => doc.data());
      setUserRecipes(fetchedRecipes);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user recipes: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const combinedRecipes = useMemo(() => {
    const allRecipes = [...userRecipes, ...mockRecipes];
    const uniqueRecipes = [];
    const seenIds = new Set();
    for (const recipe of allRecipes) {
      if (!seenIds.has(recipe.id)) {
        uniqueRecipes.push(recipe);
        seenIds.add(recipe.id);
      }
    }
    return uniqueRecipes;
  }, [userRecipes]);

  const filteredRecipes = useMemo(() => {
    if (!searchTerm.trim()) {
      return combinedRecipes;
    }
    
    return combinedRecipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, combinedRecipes]);

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