/**
 * Utility functions for the Net Worth Tracker
 */

/**
 * Format a number as currency (GBP)
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
    // Format as GBP with 2 decimal places
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Calculate percentage change between two values
 * @param {number} oldValue - The original value
 * @param {number} newValue - The new value
 * @returns {number} Percentage change
 */
export function calculatePercentChange(oldValue, newValue) {
    if (oldValue === 0) {
        return newValue > 0 ? 100 : newValue < 0 ? -100 : 0;
    }
    
    return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Generate a random hex color
 * @returns {string} Hex color code
 */
export function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Truncate a string if it exceeds a certain length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export function truncateString(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
}

/**
 * Get a friendly date format
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Debounce a function to prevent rapid firing
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Calculate compound growth over years
 * @param {number} principal - Starting amount
 * @param {number} rate - Annual growth rate (as decimal, e.g., 0.07 for 7%)
 * @param {number} years - Number of years
 * @returns {number} Final amount after compound growth
 */
export function calculateCompoundGrowth(principal, rate, years) {
    return principal * Math.pow(1 + rate, years);
} 