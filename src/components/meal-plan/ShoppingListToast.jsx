import React, { useState, useEffect } from 'react';

const ShoppingListToast = ({ 
  isVisible, 
  onHide, 
  duration = 3000,
  recipeName = '',
  ingredientCount = 0 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        handleHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleHide = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onHide();
    }, 300); // Match the animation duration
  };

  if (!isVisible && !isAnimating) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <div 
        className={`shopping-list-toast bg-green-500 text-white rounded-lg shadow-lg p-4 max-w-sm transform transition-all duration-300 ease-out ${
          isAnimating && isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-2 opacity-0 scale-95'
        }`}
      >
        <div className="flex items-start space-x-3">
          {/* Icon with animation */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg 
                className={`w-5 h-5 text-white transition-transform duration-500 ${
                  isAnimating && isVisible ? 'scale-110' : 'scale-100'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-semibold">Shopping List Updated!</h4>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5" />
              </svg>
            </div>
            
            {recipeName && (
              <p className="text-xs text-green-100 line-clamp-1">
                Added ingredients for "{recipeName}"
              </p>
            )}
            
            {ingredientCount > 0 && (
              <p className="text-xs text-green-200 mt-1">
                {ingredientCount} ingredient{ingredientCount !== 1 ? 's' : ''} added
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleHide}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors pointer-events-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full bg-white bg-opacity-20 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-linear"
            style={{
              width: isAnimating && isVisible ? '0%' : '100%',
              transitionDuration: `${duration}ms`
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Hook for managing toast state
export const useShoppingListToast = () => {
  const [toastState, setToastState] = useState({
    isVisible: false,
    recipeName: '',
    ingredientCount: 0
  });

  const showToast = (recipeName, ingredientCount = 0) => {
    setToastState({
      isVisible: true,
      recipeName,
      ingredientCount
    });
  };

  const hideToast = () => {
    setToastState(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return {
    toastState,
    showToast,
    hideToast
  };
};

export default ShoppingListToast;
