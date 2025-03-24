/**
 * Data Service Module
 * Handles data operations with localStorage
 */

/**
 * Get current data from localStorage
 * @returns {Object} The parsed data or empty object if not found
 */
export function getCurrentData() {
    try {
        return JSON.parse(localStorage.getItem('netWorthData') || '{}');
    } catch (e) {
        return {};
    }
}

/**
 * Save data to localStorage
 * @param {Object} data - The data to save
 */
export function saveData(data) {
    localStorage.setItem('netWorthData', JSON.stringify(data));
}

/**
 * Import data from JSON string
 * @param {string} jsonData - The JSON data to import
 * @returns {boolean} Success status
 */
export function importData(jsonData) {
    try {
        const parsedData = JSON.parse(jsonData);
        
        // Basic validation
        if (!parsedData.years) {
            throw new Error('Invalid data format: missing years property');
        }
        
        // Save the imported data
        localStorage.setItem('netWorthData', jsonData);
        return true;
    } catch (error) {
        throw error;
    }
}

/**
 * Export data as JSON string
 * @returns {string} Formatted JSON data
 */
export function exportData() {
    try {
        const data = localStorage.getItem('netWorthData') || '{}';
        const parsedData = JSON.parse(data);
        return JSON.stringify(parsedData, null, 2);
    } catch (e) {
        return '{}';
    }
}

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
export function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
} 