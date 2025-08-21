import React, { useState } from 'react';

const WeekView = ({
  mealPlan,
  onAddMeal,
  onRemoveMeal,
  onMoveMeal,
  onRecipeClick,
  userRecipes = []
}) => {
  // Defensive programming - ensure mealPlan is valid
  if (!mealPlan || !mealPlan.meals || !Array.isArray(mealPlan.meals)) {
    return (
      <div className="week-view bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">Unable to load meal plan data.</p>
      </div>
    );
  }
  const [draggedMeal, setDraggedMeal] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);

  const handleDragStart = (e, meal, dayIndex, mealType) => {
    const dragData = { meal, sourceDayIndex: dayIndex, sourceMealType: mealType };
    setDraggedMeal(dragData);
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, dayIndex, mealType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ dayIndex, mealType });
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e, targetDayIndex, targetMealType) => {
    e.preventDefault();
    setDragOverSlot(null);
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { meal, sourceDayIndex, sourceMealType } = dragData;
      
      if (sourceDayIndex !== targetDayIndex || sourceMealType !== targetMealType) {
        onMoveMeal(meal, sourceDayIndex, sourceMealType, targetDayIndex, targetMealType);
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
    
    setDraggedMeal(null);
  };

  const handleDragEnd = () => {
    setDraggedMeal(null);
    setDragOverSlot(null);
  };

  const MealSlot = ({ meal, dayIndex, mealType, mealLabel, day }) => {
    const isDropTarget = dragOverSlot?.dayIndex === dayIndex && dragOverSlot?.mealType === mealType;
    const isDragging = draggedMeal?.sourceDayIndex === dayIndex && draggedMeal?.sourceMealType === mealType;

    if (meal) {
      return (
        <div 
          className={`meal-slot relative group transition-all duration-200 ${
            isDragging ? 'opacity-50 scale-95' : ''
          }`}
        >
          <div 
            draggable="true"
            onDragStart={(e) => handleDragStart(e, meal, dayIndex, mealType)}
            onDragEnd={handleDragEnd}
            onClick={() => onRecipeClick(meal.id)}
            className="meal-card bg-white rounded-lg shadow-sm overflow-hidden cursor-grab active:cursor-grabbing transition-transform hover:scale-102 hover:shadow-md"
          >
            <div className="relative">
              <img 
                src={meal.image} 
                alt={meal.title}
                className="w-full h-20 object-cover"
                loading="lazy"
              />
              <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                {mealLabel}
              </div>
            </div>
            <div className="p-2">
              <p className="meal-title text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                {meal.title}
              </p>
            </div>
          </div>
          
          {/* Remove button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveMeal(dayIndex, mealType);
            }}
            className="remove-meal absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Drag handle indicator */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-60 transition-opacity">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 5h2v2H9V5zm0 4h2v2H9V9zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-12h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
            </svg>
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`meal-slot transition-all duration-200 ${
          isDropTarget ? 'ring-2 ring-orange-400 ring-opacity-75' : ''
        }`}
        onDragOver={(e) => handleDragOver(e, dayIndex, mealType)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, dayIndex, mealType)}
      >
        <button
          onClick={() => onAddMeal(dayIndex, mealType, day)}
          className={`add-meal w-full h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 transition-all duration-200 ${
            isDropTarget 
              ? 'border-orange-400 bg-orange-50 text-orange-600' 
              : 'border-gray-300 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-25'
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs font-medium">{mealLabel}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="week-view">
      {/* Overview Stats */}
      <div className="weekly-overview bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="overview-title text-lg font-semibold text-gray-900 mb-3">This Week's Overview</h2>
        <div className="stats-grid grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="stat-item">
            <div className="stat-number text-2xl font-bold text-orange-500">
              {mealPlan.meals.reduce((count, day) => 
                count + (day.breakfast ? 1 : 0) + (day.lunch ? 1 : 0) + (day.dinner ? 1 : 0), 0
              )}
            </div>
            <div className="stat-label text-sm text-gray-600">Meals Planned</div>
          </div>
          <div className="stat-item">
            <div className="stat-number text-2xl font-bold text-blue-500">7</div>
            <div className="stat-label text-sm text-gray-600">Days</div>
          </div>
          <div className="stat-item">
            <div className="stat-number text-2xl font-bold text-green-500">
              {new Set(mealPlan.meals.flatMap(day => 
                [day.breakfast?.id, day.lunch?.id, day.dinner?.id].filter(Boolean)
              )).size}
            </div>
            <div className="stat-label text-sm text-gray-600">Unique Recipes</div>
          </div>
          <div className="stat-item">
            <div className="stat-number text-2xl font-bold text-purple-500">
              {21 - mealPlan.meals.reduce((count, day) => 
                count + (day.breakfast ? 1 : 0) + (day.lunch ? 1 : 0) + (day.dinner ? 1 : 0), 0
              )}
            </div>
            <div className="stat-label text-sm text-gray-600">Open Slots</div>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="days-container space-y-6">
        {mealPlan.meals.map((day, dayIndex) => {
          const isToday = day.isToday || false;
          return (
            <div key={day.day} className={`day-section rounded-lg shadow-sm overflow-hidden transition-all ${
              isToday
                ? 'bg-orange-50 ring-2 ring-orange-200 shadow-lg'
                : 'bg-white'
            }`}>
              <div className={`day-header px-4 py-3 border-b ${
                isToday
                  ? 'bg-orange-100 border-orange-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className={`day-name text-lg font-semibold ${
                          isToday ? 'text-orange-900' : 'text-gray-900'
                        }`}>{day.day}</h3>
                        {isToday && (
                          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Today
                          </span>
                        )}
                      </div>
                      <p className={`day-date text-sm ${
                        isToday ? 'text-orange-700' : 'text-gray-600'
                      }`}>{day.date}</p>
                    </div>
                  </div>
                  <div className={`meals-count text-sm ${
                    isToday ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    {[day.breakfast, day.lunch, day.dinner].filter(Boolean).length}/3 meals
                  </div>
                </div>
              </div>

              <div className="day-meals p-4">
                <div className="meals-grid grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <MealSlot
                    meal={day.breakfast}
                    dayIndex={dayIndex}
                    mealType="breakfast"
                    mealLabel="Breakfast"
                    day={day}
                  />
                  <MealSlot
                    meal={day.lunch}
                    dayIndex={dayIndex}
                    mealType="lunch"
                    mealLabel="Lunch"
                    day={day}
                  />
                  <MealSlot
                    meal={day.dinner}
                    dayIndex={dayIndex}
                    mealType="dinner"
                    mealLabel="Dinner"
                    day={day}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
