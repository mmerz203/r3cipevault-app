import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useUser } from './context/UserContext';

// Import your page components
import { mockShoppingList } from './data/mockData';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AddRecipe from './pages/AddRecipe';
import RecipePage from './pages/RecipePage';
import MealPlan from './pages/MealPlan';
import ShoppingList from './pages/ShoppingList';
import PantryPage from './pages/PantryPage';

function App() {
  const { user, loading } = useUser();
  const [shoppingList, setShoppingList] = useState(mockShoppingList);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        <p>Loading...</p>
      </div>
    );
  }

  // The app now always renders the main content because a user is always logged in
  return (
    <BrowserRouter>
      <div className="app-container min-h-screen bg-gray-50">
        <header className="p-4 bg-white shadow-md flex justify-end">
          {/* You can still add a sign-out button here, which signs out the anonymous user */}
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-recipe" element={<AddRecipe />} />
          <Route path="/edit-recipe/:id" element={<AddRecipe />} />
          <Route path="/recipes/:id" element={<RecipePage />} />
          <Route path="/meal-plan" element={<MealPlan setShoppingList={setShoppingList} />} />
          <Route path="/shopping-list" element={<ShoppingList shoppingList={shoppingList} setShoppingList={setShoppingList} />} />
          <Route path="/pantry" element={<PantryPage />} />
        </Routes>
        <Footer />
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;