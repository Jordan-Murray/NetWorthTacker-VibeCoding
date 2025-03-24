/**
 * Main Application
 * Entry point for the Net Worth Tracker application
 */
import { initYearManager } from './modules/yearManagerUI.js';
import { updateDashboardSummary } from './modules/dashboardUI.js';
import { renderDashboardCharts, renderTrendsCharts } from './modules/chartsUI.js';
import { initMilestonesUI } from './modules/milestonesUI.js';
import { initSalaryTrackerUI } from './modules/salaryTrackerUI.js';
import { initSettingsIcon } from './modules/dataManagementUI.js';
import { initFormHandlers } from './modules/formHandlerUI.js';

// Main initialization function
function initializeApp() {
    // Set up UI tabs
    initTabs();
    
    // Initialize year management
    initYearManager();
    
    // Initialize dashboard components
    updateDashboardSummary();
    renderDashboardCharts();
    
    // Initialize other modules
    initMilestonesUI();
    initSalaryTrackerUI();
    initFormHandlers();
    
    // Initialize data management
    initSettingsIcon();
    
    // Initialize event handler for refresh trends button
    const refreshTrendsBtn = document.getElementById('refresh-trends-btn');
    if (refreshTrendsBtn) {
        refreshTrendsBtn.addEventListener('click', renderTrendsCharts);
    }
    
    // Initial rendering of trends charts
    renderTrendsCharts();
}

// Handle tab switching
function initTabs() {
    const tabLinks = document.querySelectorAll('#main-nav a');
    
    tabLinks.forEach(tabLink => {
        tabLink.addEventListener('click', function (event) {
            event.preventDefault();
            
            // Get target section id
            const targetId = this.getAttribute('href').substring(1);
            
            // Hide all sections
            document.querySelectorAll('main > section').forEach(section => {
                section.classList.add('hidden-section');
                section.classList.remove('active-section');
            });
            
            // Show target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden-section');
                targetSection.classList.add('active-section');
            }
            
            // Update active tab
            tabLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // Update charts when switching to tabs with charts
            if (targetId === 'dashboard') {
                renderDashboardCharts();
            } else if (targetId === 'trends') {
                renderTrendsCharts();
            }
        });
    });
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle year selection changes globally
document.addEventListener('yearChanged', function(e) {
    if (e.detail && e.detail.year) {
        // Update UI based on selected year
        updateDashboardSummary();
        renderDashboardCharts();
    }
}); 