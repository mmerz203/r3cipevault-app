import React, { useState } from 'react';
import { mockShoppingList } from '../data/mockData';

const ShoppingList = () => {
  const [items, setItems] = useState(mockShoppingList);
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState('');

  const toggleItem = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const addItem = (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      const item = {
        id: Date.now(),
        item: newItem.trim(),
        quantity: newQuantity.trim() || '1',
        completed: false
      };
      setItems([...items, item]);
      setNewItem('');
      setNewQuantity('');
    }
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const completedCount = items.filter(item => item.completed).length;

  return (
    <div className="shopping-list-page min-h-screen bg-gray-50 pb-20">
      <div className="shopping-header bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="page-title text-2xl font-bold text-gray-900 mb-2">Shopping List</h1>
          <p className="progress-text text-sm text-gray-600">
            {completedCount} of {items.length} items completed
          </p>
        </div>
      </div>

      <div className="shopping-content max-w-4xl mx-auto p-6">
        <form onSubmit={addItem} className="add-item-form bg-white rounded-lg p-4 shadow-sm mb-6">
          <h3 className="form-title text-lg font-semibold text-gray-900 mb-3">Add New Item</h3>
          <div className="form-grid grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Item name"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="Quantity"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="btn-primary">
              Add Item
            </button>
          </div>
        </form>

        <div className="items-list bg-white rounded-lg shadow-sm overflow-hidden">
          {items.length === 0 ? (
            <div className="empty-state text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M7 13v4a2 2 0 002 2h2m3-6v6a2 2 0 002 2h2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your shopping list is empty</h3>
              <p className="text-gray-500">Add items above to get started.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="list-item flex items-center p-4 border-b border-gray-100 last:border-b-0">
                <button
                  onClick={() => toggleItem(item.id)}
                  className={`checkbox w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                    item.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {item.completed && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                
                <div className="item-details flex-1">
                  <div className={`item-name font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.item}
                  </div>
                  <div className={`item-quantity text-sm ${item.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.quantity}
                  </div>
                </div>
                
                <button
                  onClick={() => removeItem(item.id)}
                  className="remove-button w-8 h-8 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
