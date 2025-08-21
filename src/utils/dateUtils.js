/**
 * Utility functions for date handling in meal planning
 */

/**
 * Get the start of the week (Monday) for a given date
 * @param {Date} date - The date to get the week start for
 * @returns {Date} Start of the week
 */
export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

/**
 * Get the end of the week (Sunday) for a given date
 * @param {Date} date - The date to get the week end for
 * @returns {Date} End of the week
 */
export const getWeekEnd = (date = new Date()) => {
  const weekStart = getWeekStart(date);
  return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
};

/**
 * Generate an array of dates for a week starting from a given date
 * @param {Date} weekStart - Start of the week
 * @returns {Array} Array of date objects for the week
 */
export const getWeekDates = (weekStart) => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(date);
  }
  return dates;
};

/**
 * Format a date range for display (e.g., "January 20 - 26, 2025")
 * @param {Date} startDate - Start of the range
 * @param {Date} endDate - End of the range
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  const options = { month: 'long', day: 'numeric' };
  const startFormatted = startDate.toLocaleDateString('en-US', options);
  const endFormatted = endDate.toLocaleDateString('en-US', { day: 'numeric' });
  const year = startDate.getFullYear();
  
  return `${startFormatted} - ${endFormatted}, ${year}`;
};

/**
 * Format a date for short display (e.g., "Jan 20")
 * @param {Date} date - The date to format
 * @returns {string} Formatted date
 */
export const formatShortDate = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Get day name for a date
 * @param {Date} date - The date
 * @returns {string} Day name (e.g., "Monday")
 */
export const getDayName = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Check if a date is today
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is today
 */
export const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is in the current week
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is in the current week
 */
export const isCurrentWeek = (date) => {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);
  
  return date >= weekStart && date <= weekEnd;
};

/**
 * Add weeks to a date
 * @param {Date} date - The starting date
 * @param {number} weeks - Number of weeks to add (can be negative)
 * @returns {Date} New date with weeks added
 */
export const addWeeks = (date, weeks) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + (weeks * 7));
  return newDate;
};

/**
 * Generate meal plan data structure for a given week
 * @param {Date} weekStart - Start of the week
 * @returns {Object} Meal plan structure with dates
 */
export const generateWeekMealPlan = (weekStart) => {
  const weekDates = getWeekDates(weekStart);
  const weekEnd = getWeekEnd(weekStart);
  
  return {
    week: formatDateRange(weekStart, weekEnd),
    weekStart: weekStart,
    weekEnd: weekEnd,
    meals: weekDates.map((date, index) => ({
      day: getDayName(date),
      date: formatShortDate(date),
      fullDate: date,
      isToday: isToday(date),
      dayIndex: index,
      breakfast: null,
      lunch: null,
      dinner: null
    }))
  };
};

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string in various formats
 * @returns {Date} Parsed date
 */
export const parseDate = (dateString) => {
  return new Date(dateString);
};

/**
 * Get week identifier for Firestore queries (YYYY-MM-DD format of week start)
 * @param {Date} date - Date in the week
 * @returns {string} Week identifier
 */
export const getWeekId = (date) => {
  const weekStart = getWeekStart(date);
  return weekStart.toISOString().split('T')[0]; // YYYY-MM-DD format
};
