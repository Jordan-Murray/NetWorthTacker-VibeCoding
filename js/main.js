/**
 * Main Application Entry Point
 * Centralized initialization for Net Worth Tracker
 */

// Debug log to verify script loading
console.log('main.js is loading');

// Set global flag to indicate the script loaded
window.mainScriptLoaded = true;

// Import modules
import { getDataStore } from './modules/enhancedDataService.js';
import { initNavigation } from './modules/navigationModule.js';
import { initModal } from './modules/modalModule.js';
import { initCharts, renderDashboardCharts, renderTrendsCharts } from './modules/chartModule.js';
import { initFinancialTables } from './modules/financialTablesUI.js';
import { initMilestonesUI } from './modules/milestonesUI.js';
import { initSalaryTrackerUI } from './modules/salaryTrackerUI.js';
import { initSavingsTrackerUI } from './modules/savingsTrackerUI.js';
import { initYearManager } from './modules/yearManagerUI.js';
import { initImportExport } from './modules/importExportModule.js';
import { initDashboard } from './modules/dashboardUI.js';
import { initFormHandlerUI } from './modules/formHandlerUI.js';

// Log application startup
console.log('Net Worth Tracker initializing...');

/**
 * Initialize the application
 */
function initializeApp() {
    // Initialize components in the correct order
    
    // 1. Initialize data store first (required by all other modules)
    const dataStore = getDataStore();
    window.dataStore = dataStore; // Make available globally for debugging
    
    // 2. Initialize navigation (required for section visibility)
    initNavigation();
    
    // 3. Initialize modal handling (required for all forms)
    initModal();
    
    // 4. Initialize UI components that don't depend on each other
    initYearManager();
    initFinancialTables();
    initMilestonesUI();
    initSalaryTrackerUI();
    initSavingsTrackerUI();
    initDashboard(); // Initialize dashboard
    initFormHandlerUI(); // Initialize form handlers
    
    // 5. Initialize charts after other UI is ready
    initCharts();
    
    // 6. Initialize import/export functionality
    initImportExport();
    
    // 7. Create global references for compatibility with older code
    window.renderDashboardCharts = renderDashboardCharts;
    window.renderTrendsCharts = renderTrendsCharts;
    
    // 8. Set up event listeners for app-wide events
    setupGlobalEvents();
    
    // 9. Render initial charts
    renderDashboardCharts();
    renderTrendsCharts();
    
    // Log successful initialization
    console.log('Net Worth Tracker initialized successfully');
}

/**
 * Set up global event listeners
 */
function setupGlobalEvents() {
    // When data is updated, refresh all UI
    document.addEventListener('dataUpdated', () => {
        console.log('Data updated, refreshing UI...');
        refreshAllUI();
    });
    
    // When navigation changes, update relevant UI
    document.addEventListener('navigationChanged', (e) => {
        console.log(`Navigated to section: ${e.detail.section}`);
        refreshSectionUI(e.detail.section);
    });
    
    // Refresh trends button
    const refreshTrendsBtn = document.getElementById('refresh-trends-btn');
    if (refreshTrendsBtn) {
        refreshTrendsBtn.addEventListener('click', renderTrendsCharts);
    }
    
    // Handle settings icon click for import/export
    const settingsIcon = document.getElementById('settings-icon');
    if (settingsIcon) {
        settingsIcon.addEventListener('click', () => {
            console.log('Settings icon clicked');
            showImportExportModal();
        });
    }
}

/**
 * Refresh all UI components
 */
function refreshAllUI() {
    // Update year selector
    if (typeof window.refreshYearSelector === 'function') {
        window.refreshYearSelector();
    }
    
    // Update financial tables
    if (typeof window.refreshFinancialTables === 'function') {
        window.refreshFinancialTables();
    }
    
    // Update dashboard
    if (typeof window.refreshDashboard === 'function') {
        window.refreshDashboard();
    }
    
    // Update charts
    renderDashboardCharts();
    renderTrendsCharts();
    
    // Update milestones
    if (typeof window.refreshMilestones === 'function') {
        window.refreshMilestones();
    }
    
    // Update salary table
    if (typeof window.refreshSalaryTable === 'function') {
        window.refreshSalaryTable();
    }
}

/**
 * Refresh UI for a specific section
 * @param {string} section - Section ID
 */
function refreshSectionUI(section) {
    switch(section) {
        case 'dashboard':
            renderDashboardCharts();
            if (typeof window.refreshDashboard === 'function') {
                window.refreshDashboard();
            }
            break;
        case 'assets-liabilities':
            if (typeof window.refreshFinancialTables === 'function') {
                window.refreshFinancialTables();
            }
            break;
        case 'trends':
            renderTrendsCharts();
            break;
        case 'goals':
            if (typeof window.refreshMilestones === 'function') {
                window.refreshMilestones();
            }
            break;
        case 'salary-tracking':
            if (typeof window.refreshSalaryTable === 'function') {
                window.refreshSalaryTable();
            }
            break;
        case 'savings-tracking':
            if (typeof window.refreshSavingsTable === 'function') {
                window.refreshSavingsTable();
            }
            break;
        case 'budgeting':
            if (typeof window.refreshBudgetUI === 'function') {
                window.refreshBudgetUI();
            }
            break;
    }
}

/**
 * Show import/export modal
 */
function showImportExportModal() {
    if (typeof window.showImportExportModal === 'function') {
        window.showImportExportModal();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle errors
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    // Could add error reporting or a user-friendly error message here
});