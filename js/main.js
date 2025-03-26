/**
 * Main Application Entry Point
 * Centralized initialization for Net Worth Tracker
 */

// Debug log to verify script loading
console.log('main.js is loading');

// Set global flag to indicate the script loaded
window.mainScriptLoaded = true;

// Import core modules
import { getDataService } from './modules/dataService.js';
import { FormHandler } from './modules/formHandler.js';
import { DashboardUI } from './modules/dashboardUI.js';
import { Router } from './modules/router.js';

// Log application startup
console.log('Net Worth Tracker initializing...');

/**
 * Initialize the application
 */
function initializeApp() {
    try {
        // 1. Initialize data service first (required by all other modules)
        const dataService = getDataService();
        window.dataService = dataService; // Make available globally for debugging
        
        // 2. Initialize form handler
        const formHandler = new FormHandler(dataService);
        formHandler.init();
        
        // 3. Initialize dashboard UI
        const dashboardUI = new DashboardUI(dataService);
        dashboardUI.init();
        
        // 4. Initialize router
        const router = new Router();
        router.init();
        
        // 5. Set up event listeners for app-wide events
        setupGlobalEvents();
        
        // Log successful initialization
        console.log('Net Worth Tracker initialized successfully');
    } catch (error) {
        // Log the error with more detail
        console.error('Failed to initialize Net Worth Tracker:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        // Show error to user
        showError('Failed to initialize application. Please refresh the page.');
    }
}

/**
 * Set up global event listeners
 */
function setupGlobalEvents() {
    // When data is updated, refresh all UI
    document.addEventListener('dataChanged', () => {
        console.log('Data changed, refreshing UI...');
        refreshAllUI();
    });
    
    // When navigation changes, update relevant UI
    document.addEventListener('navigationChanged', (e) => {
        console.log(`Navigated to section: ${e.detail.section}`);
        refreshSectionUI(e.detail.section);
    });
}

/**
 * Refresh all UI components
 */
function refreshAllUI() {
    try {
        // Refresh dashboard
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.dispatchEvent(new Event('refresh'));
        }
        
        // Refresh assets table
        const assetsTable = document.getElementById('assets-table-body');
        if (assetsTable) {
            assetsTable.dispatchEvent(new Event('refresh'));
        }
        
        // Refresh liabilities table
        const liabilitiesTable = document.getElementById('liabilities-table-body');
        if (liabilitiesTable) {
            liabilitiesTable.dispatchEvent(new Event('refresh'));
        }
    } catch (error) {
        console.error('Error refreshing UI:', error);
    }
}

/**
 * Refresh specific section UI
 */
function refreshSectionUI(section) {
    try {
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
            sectionElement.dispatchEvent(new Event('refresh'));
            
            // If we're in the assets-liabilities section, refresh both tables
            if (section === 'assets-liabilities') {
                const assetsTable = document.getElementById('assets-table-body');
                const liabilitiesTable = document.getElementById('liabilities-table-body');
                
                if (assetsTable) {
                    assetsTable.dispatchEvent(new Event('refresh'));
                }
                if (liabilitiesTable) {
                    liabilitiesTable.dispatchEvent(new Event('refresh'));
                }
            }
        }
    } catch (error) {
        console.error(`Error refreshing section ${section}:`, error);
    }
}

/**
 * Show error message to user
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Initialize the application when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}