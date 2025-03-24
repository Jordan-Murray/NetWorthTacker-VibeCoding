/**
 * Utility Module
 * Provides helper functions used across modules
 */

/**
 * Format a number as currency (GBP)
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
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
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Format a date string (YYYY-MM) to a readable format
 * @param {string} dateString - The date string in YYYY-MM format
 * @returns {string} Formatted date (e.g., "Jan 2023")
 */
export function formatDateString(dateString) {
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

/**
 * Get random color with specific opacity
 * @param {number} opacity - The opacity value (0-1)
 * @returns {string} RGBA color string
 */
export function getRandomColor(opacity = 0.7) {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
} 