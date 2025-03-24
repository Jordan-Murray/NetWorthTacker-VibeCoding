/**
 * DEPRECATED: Direct UI Module
 * This file is kept for backward compatibility and will redirect to new modular system
 */

// Display console warning about the deprecated file
console.warn('direct-ui.js is deprecated and will be removed in a future version. Please use the modular JS files instead.');

// When this script loads, redirect to the new structure
document.addEventListener('DOMContentLoaded', function() {
    console.info('Loading modular JS structure...');
    
    // The new structure is loaded via module imports in main.js
});

// Proxy functions for backward compatibility
// These will simply pass-through to the new modular functions

// Define a global namespace for backward compatibility if needed
window.NetWorthTracker = window.NetWorthTracker || {};

// Define empty dummy functions that won't throw errors if called
const dummyFunctions = [
    'setupDirectUI',
    'setupSettingsIcon',
    'getCurrentData',
    'saveData',
    'showDataManagementModal',
    'setupDataManagementActions',
    'renderFinancialTables',
    'renderAssetsTable',
    'renderLiabilitiesTable',
    'updateTotals',
    'editItem',
    'deleteItem',
    'updateDashboardSummary',
    'renderDashboardCharts',
    'renderNetWorthChart',
    'renderAssetDiversityChart',
    'renderTrendsCharts',
    'renderNetWorthGrowthChart',
    'renderAssetCategoriesOverTimeChart',
    'renderGrowthVsBenchmarksChart',
    'renderMilestones',
    'deleteMilestone',
    'renderSalaryTable',
    'editSalaryEntry',
    'deleteSalaryEntry',
    'renderSalaryChart',
    'setupBudgetingCalculators',
    'renderJointExpensesChart',
    'formatCurrency'
];

// Create dummy functions that log warnings
dummyFunctions.forEach(funcName => {
    window.NetWorthTracker[funcName] = function() {
        console.warn(`The function '${funcName}' is deprecated. Use the new modular structure instead.`);
        return null; // Return null to prevent undefined errors
    };
});

// No-op function as entry point to avoid errors
function setupDirectUI() {
    console.warn('setupDirectUI is deprecated. Use the new modular structure instead.');
} 