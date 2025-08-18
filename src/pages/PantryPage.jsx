import React, { useState } from 'react';
import { mockPantryItems } from '../data/mockData';
import toast from 'react-hot-toast';

const PantryPage = () => {
  const [items, setItems] = useState(mockPantryItems);
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');

  const categories = ['Grains', 'Oils', 'Spices', 'Canned Goods', 'Dairy', 'Produce', 'Other'];

  const addItem = (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      const item = {
        id: Date.now(),
        item: newItem.trim(),
        quantity: newQuantity.trim() || '1',
        category: newCategory || 'Other',
        expiryDate: newExpiryDate
      };
      setItems([...items, item]);
      setNewItem('');
      setNewQuantity('');
      setNewCategory('');
      setNewExpiryDate('');
      toast.success(`'${item.item}' added to pantry!`);
    }
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  const groupedItems = items.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  return (
    <div className="pantry-page min-h-screen bg-gray-50 pb-20">
      <div className="pantry-header bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="page-title text-2xl font-bold text-gray-900 mb-2">Pantry</h1>
          <p className="subtitle text-sm text-gray-600">
            Manage your kitchen inventory
          </p>
        </div>
      </div>

      <div className="pantry-content max-w-4xl mx-auto p-6">
        <form onSubmit={addItem} className="add-item-form bg-white rounded-lg p-4 shadow-sm mb-6">
          <h3 className="form-title text-lg font-semibold text-gray-900 mb-3">Add Pantry Item</h3>
          <div className="form-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="input-field"
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Expiry date"
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="btn-primary">
              Add Item
            </button>
          </div>
        </form>

        {Object.keys(groupedItems).length === 0 ? (
          <div className="empty-state bg-white rounded-lg shadow-sm">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your pantry is empty</h3>
              <p className="text-gray-500">Add items above to start organizing your kitchen inventory.</p>
            </div>
          </div>
        ) : (
          <div className="categories-container space-y-6">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category} className="category-section bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="category-header bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="category-title text-lg font-semibold text-gray-900">{category}</h3>
                  <p className="category-count text-sm text-gray-600">{categoryItems.length} items</p>
                </div>
                
                <div className="category-items">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="pantry-item flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
                      <div className="item-info flex-1">
                        <div className="item-name font-medium text-gray-900">{item.item}</div>
                        <div className="item-meta flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="quantity">Qty: {item.quantity}</span>
                          {item.expiryDate && (
                            <span className={`expiry-date ${
                              isExpired(item.expiryDate) ? 'text-red-600 font-medium' :
                              isExpiringSoon(item.expiryDate) ? 'text-orange-600 font-medium' :
                              'text-gray-600'
                            }`}>
                              Expires: {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="item-actions flex items-center space-x-2">
                        {isExpired(item.expiryDate) && (
                          <span className="expired-badge bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                            Expired
                          </span>
                        )}
                        {isExpiringSoon(item.expiryDate) && !isExpired(item.expiryDate) && (
                          <span className="expiring-badge bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                            Expiring Soon
                          </span>
                        )}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="remove-button w-8 h-8 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PantryPage;
