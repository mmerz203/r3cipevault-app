import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Service for managing shopping list items with intelligent quantity aggregation
 */
export class ShoppingListService {
  /**
   * Get all shopping list items for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Shopping list items
   */
  static async getShoppingList(userId) {
    if (!userId) throw new Error('User ID is required');
    
    try {
      const shoppingListRef = collection(db, 'users', userId, 'shoppingList');
      const q = query(shoppingListRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      throw error;
    }
  }

  /**
   * Listen to real-time shopping list changes
   * @param {string} userId - User ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  static listenToShoppingList(userId, callback) {
    if (!userId) throw new Error('User ID is required');
    
    try {
      const shoppingListRef = collection(db, 'users', userId, 'shoppingList');
      const q = query(shoppingListRef, orderBy('createdAt', 'desc'));
      
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(items);
      });
    } catch (error) {
      console.error('Error setting up shopping list listener:', error);
      throw error;
    }
  }

  /**
   * Add or update shopping list item with intelligent quantity aggregation
   * @param {string} userId - User ID
   * @param {string} itemName - Item name
   * @param {string} quantity - Quantity string (e.g., "2 cups", "1 kg")
   * @param {string} source - Source of item ('meal_plan' or 'manual')
   * @param {string} recipeId - Recipe ID if from meal plan
   * @returns {Promise<void>}
   */
  static async addOrUpdateItem(userId, itemName, quantity, source = 'manual', recipeId = null) {
    if (!userId || !itemName) throw new Error('User ID and item name are required');
    
    try {
      const normalizedName = this.normalizeItemName(itemName);
      const shoppingListRef = collection(db, 'users', userId, 'shoppingList');
      
      // Check if item already exists
      const existingItems = await this.getShoppingList(userId);
      const existingItem = existingItems.find(item => 
        this.normalizeItemName(item.item) === normalizedName
      );
      
      if (existingItem) {
        // Update existing item with aggregated quantity
        const aggregatedQuantity = this.aggregateQuantities(existingItem.quantity, quantity);
        const sources = existingItem.sources || [];
        
        // Add new source if not already present
        if (source === 'meal_plan' && recipeId) {
          const sourceExists = sources.some(s => s.recipeId === recipeId);
          if (!sourceExists) {
            sources.push({ type: source, recipeId, quantity });
          }
        } else if (source === 'manual') {
          const manualExists = sources.some(s => s.type === 'manual');
          if (!manualExists) {
            sources.push({ type: source, quantity });
          }
        }
        
        await updateDoc(doc(shoppingListRef, existingItem.id), {
          quantity: aggregatedQuantity,
          sources: sources,
          updatedAt: new Date()
        });
      } else {
        // Create new item
        const newItem = {
          item: itemName,
          quantity: quantity,
          completed: false,
          source: source,
          sources: source === 'meal_plan' && recipeId ? 
            [{ type: source, recipeId, quantity }] : 
            [{ type: source, quantity }],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const docRef = doc(shoppingListRef);
        await setDoc(docRef, newItem);
      }
    } catch (error) {
      console.error('Error adding/updating shopping list item:', error);
      throw error;
    }
  }

  /**
   * Remove item from shopping list
   * @param {string} userId - User ID
   * @param {string} itemId - Item ID
   * @returns {Promise<void>}
   */
  static async removeItem(userId, itemId) {
    if (!userId || !itemId) throw new Error('User ID and item ID are required');
    
    try {
      await deleteDoc(doc(db, 'users', userId, 'shoppingList', itemId));
    } catch (error) {
      console.error('Error removing shopping list item:', error);
      throw error;
    }
  }

  /**
   * Remove ingredients from shopping list when meal is removed
   * @param {string} userId - User ID
   * @param {string} recipeId - Recipe ID
   * @returns {Promise<void>}
   */
  static async removeMealIngredients(userId, recipeId) {
    if (!userId || !recipeId) return;
    
    try {
      const items = await this.getShoppingList(userId);
      
      for (const item of items) {
        const sources = item.sources || [];
        const mealPlanSources = sources.filter(s => s.type === 'meal_plan' && s.recipeId === recipeId);
        
        if (mealPlanSources.length > 0) {
          const remainingSources = sources.filter(s => !(s.type === 'meal_plan' && s.recipeId === recipeId));
          
          if (remainingSources.length === 0) {
            // No other sources, remove item completely
            await this.removeItem(userId, item.id);
          } else {
            // Recalculate quantity without this recipe's contribution
            const newQuantity = this.recalculateQuantity(remainingSources);
            await updateDoc(doc(db, 'users', userId, 'shoppingList', item.id), {
              quantity: newQuantity,
              sources: remainingSources,
              updatedAt: new Date()
            });
          }
        }
      }
    } catch (error) {
      console.error('Error removing meal ingredients:', error);
      throw error;
    }
  }

  /**
   * Toggle item completion status
   * @param {string} userId - User ID
   * @param {string} itemId - Item ID
   * @param {boolean} completed - Completion status
   * @returns {Promise<void>}
   */
  static async toggleItemCompletion(userId, itemId, completed) {
    if (!userId || !itemId) throw new Error('User ID and item ID are required');
    
    try {
      await updateDoc(doc(db, 'users', userId, 'shoppingList', itemId), {
        completed: completed,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error toggling item completion:', error);
      throw error;
    }
  }

  /**
   * Sync meal plan ingredients to shopping list
   * @param {string} userId - User ID
   * @param {Array} recipes - Array of recipes with ingredients
   * @param {Array} mealPlan - Current meal plan
   * @returns {Promise<void>}
   */
  static async syncMealPlanIngredients(userId, recipes, mealPlan) {
    if (!userId || !recipes || !mealPlan) return;
    
    try {
      // Get all ingredients from current meal plan
      const mealPlanIngredients = new Map();
      
      mealPlan.meals.forEach(day => {
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
          const meal = day[mealType];
          if (meal) {
            const recipe = recipes.find(r => r.id === meal.id);
            if (recipe && recipe.ingredients) {
              recipe.ingredients.forEach(ingredient => {
                const normalized = this.normalizeItemName(ingredient);
                if (mealPlanIngredients.has(normalized)) {
                  const existing = mealPlanIngredients.get(normalized);
                  existing.count += 1;
                  existing.recipes.push({ id: recipe.id, title: recipe.title });
                } else {
                  mealPlanIngredients.set(normalized, {
                    original: ingredient,
                    count: 1,
                    recipes: [{ id: recipe.id, title: recipe.title }]
                  });
                }
              });
            }
          }
        });
      });

      // Add each ingredient to shopping list
      for (const [, ingredientInfo] of mealPlanIngredients) {
        const quantity = this.extractAndMultiplyQuantity(ingredientInfo.original, ingredientInfo.count);
        await this.addOrUpdateItem(
          userId, 
          ingredientInfo.original, 
          quantity, 
          'meal_plan',
          ingredientInfo.recipes[0].id // Use first recipe ID as primary
        );
      }
    } catch (error) {
      console.error('Error syncing meal plan ingredients:', error);
      throw error;
    }
  }

  /**
   * Normalize item name for comparison
   * @param {string} itemName - Item name
   * @returns {string} Normalized name
   */
  static normalizeItemName(itemName) {
    return itemName.toLowerCase()
      .replace(/\s*\([^)]*\)/g, '') // Remove parentheses content
      .replace(/,.*$/, '') // Remove everything after comma
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract quantity and multiply by count
   * @param {string} ingredient - Original ingredient string
   * @param {number} count - Number of recipes using this ingredient
   * @returns {string} Calculated quantity
   */
  static extractAndMultiplyQuantity(ingredient, count) {
    // Extract number and unit from ingredient
    const match = ingredient.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*([a-zA-Z]*)/);
    
    if (match) {
      const [, numberStr, unit] = match;
      const number = this.parseNumber(numberStr);
      const multiplied = number * count;
      return `${this.formatNumber(multiplied)}${unit ? ' ' + unit : ''}`;
    }
    
    // If no number found, just indicate multiple
    return count > 1 ? `${count}x` : '1x';
  }

  /**
   * Parse number string including fractions
   * @param {string} numberStr - Number string
   * @returns {number} Parsed number
   */
  static parseNumber(numberStr) {
    if (numberStr.includes('/')) {
      const [whole, fraction] = numberStr.split('/');
      return parseFloat(whole) / parseFloat(fraction);
    }
    return parseFloat(numberStr);
  }

  /**
   * Format number for display
   * @param {number} number - Number to format
   * @returns {string} Formatted number
   */
  static formatNumber(number) {
    if (number % 1 === 0) {
      return number.toString();
    }
    return number.toFixed(1).replace('.0', '');
  }

  /**
   * Aggregate quantities from multiple sources
   * @param {string} existing - Existing quantity
   * @param {string} newQuantity - New quantity to add
   * @returns {string} Aggregated quantity
   */
  static aggregateQuantities(existing, newQuantity) {
    // Simple aggregation - in a real app, this would be more sophisticated
    const existingMatch = existing.match(/(\d+(?:\.\d+)?)/);
    const newMatch = newQuantity.match(/(\d+(?:\.\d+)?)/);
    
    if (existingMatch && newMatch) {
      const existingNum = parseFloat(existingMatch[1]);
      const newNum = parseFloat(newMatch[1]);
      const total = existingNum + newNum;
      
      // Try to preserve unit from existing quantity
      const unit = existing.replace(/^\d+(?:\.\d+)?\s*/, '');
      return `${this.formatNumber(total)} ${unit}`.trim();
    }
    
    return existing; // Fallback to existing if can't parse
  }

  /**
   * Recalculate quantity from remaining sources
   * @param {Array} sources - Remaining sources
   * @returns {string} Recalculated quantity
   */
  static recalculateQuantity(sources) {
    if (sources.length === 0) return '1';
    
    // Simple implementation - sum all numeric quantities
    let total = 0;
    let unit = '';
    
    for (const source of sources) {
      const match = source.quantity.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]*)/);
      if (match) {
        total += parseFloat(match[1]);
        if (!unit && match[2]) unit = match[2];
      } else {
        total += 1; // Default if can't parse
      }
    }
    
    return `${this.formatNumber(total)}${unit ? ' ' + unit : ''}`;
  }
}
