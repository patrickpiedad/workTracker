/**
 * Format a Date object or ISO string to "DD.MM.YYYY (DayName)" or "DD.MM.YYYY"
 * @param {Date|string} dateInput 
 * @param {boolean} includeDayName 
 * @returns {string}
 */
export const formatDate = (dateInput, includeDayName = true) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  const dateStr = `${day}.${month}.${year}`;

  if (includeDayName) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[date.getDay()];
    return `${dateStr} (${dayName})`;
  }

  return dateStr;
};

/**
 * Format a Year-Month string (YYYY-MM) or Date to "MM.YYYY"
 * @param {string|Date} dateInput 
 * @returns {string}
 */
export const formatMonth = (dateInput) => {
  if (!dateInput) return '';
  
  // Handle "YYYY-MM" string input directly for simplicity if strictly adhering to our key format
  if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = dateInput.split('-');
    return `${month}.${year}`;
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${month}.${year}`;
};
