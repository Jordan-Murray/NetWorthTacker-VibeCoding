/**
 * Year Manager UI Module
 * Handles year selection, adding new years, and related functionality
 */
import { getDataStore } from './enhancedDataService.js';
import { renderFinancialTables } from './financialTablesUI.js';
import { updateDashboardSummary } from './dashboardUI.js';
// import { renderDashboardCharts } from './chartsUI.js';

/**
 * Initialize year manager UI
 */
export function initYearManager() {
    populateYearSelect();
    setupYearActions();
}

/**
 * Populate the year selection dropdown
 * @param {string} [selectedYear] - Year to select after populating (optional)
 */
export function populateYearSelect(selectedYear) {
    const dataStore = getDataStore();
    const yearSelect = document.getElementById('year-select');
    
    if (!yearSelect) return;
    
    // Save current selection if no specific year was requested
    const currentSelection = selectedYear || yearSelect.value;
    
    // Clear existing options
    yearSelect.innerHTML = '';
    
    // Get all years
    const years = dataStore.getYears();
    
    // If no years exist, create the current year
    if (years.length === 0) {
        const currentYear = new Date().getFullYear();
        dataStore.addYear(currentYear);
        years.push(currentYear);
    }
    
    // Add options for each year
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
    
    // Set selected year (either the previously selected one or the newest)
    if (currentSelection && years.includes(parseInt(currentSelection))) {
        yearSelect.value = currentSelection;
    } else {
        yearSelect.value = years[0]; // Default to first (most recent) year
    }
    
    // Trigger change event to update UI based on selected year
    const event = new Event('change');
    yearSelect.dispatchEvent(event);
}

/**
 * Set up year selection and add/delete year functionality
 */
function setupYearActions() {
    const yearSelect = document.getElementById('year-select');
    const addYearBtn = document.getElementById('add-year-btn');
    const deleteYearBtn = document.getElementById('delete-year-btn');
    
    if (!yearSelect) return;
    
    // Handle year selection change
    yearSelect.addEventListener('change', function() {
        const selectedYear = this.value;
        const dataStore = getDataStore();
        
        // Update the current year in the data store
        dataStore.setCurrentYear(parseInt(selectedYear));
        
        // Update UI components based on selected year
        renderFinancialTables(selectedYear);
        updateDashboardSummary();
        
        // Update delete button visibility (don't allow deleting the last year)
        if (deleteYearBtn) {
            const yearCount = dataStore.getYears().length;
            deleteYearBtn.disabled = yearCount <= 1;
        }
    });
    
    // Handle add year button
    if (addYearBtn) {
        addYearBtn.addEventListener('click', function() {
            showAddYearModal();
        });
    }
    
    // Handle delete year button
    if (deleteYearBtn) {
        deleteYearBtn.addEventListener('click', function() {
            deleteCurrentYear();
        });
    }
    
    // Initial update of delete button state
    if (deleteYearBtn) {
        const dataStore = getDataStore();
        const yearCount = dataStore.getYears().length;
        deleteYearBtn.disabled = yearCount <= 1;
    }
}

/**
 * Show the add year modal
 */
function showAddYearModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('add-year-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'add-year-modal';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', 'add-year-modal-label');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="add-year-modal-label">Add New Year</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="add-year-form">
                            <div class="mb-3">
                                <label for="new-year-input" class="form-label">Year</label>
                                <input type="number" class="form-control" id="new-year-input" min="1900" max="2100" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Copy data from existing year (optional)</label>
                                <select class="form-select" id="copy-from-year-select">
                                    <option value="">No - Start with empty data</option>
                                </select>
                                <div class="form-text">This will copy all assets and liabilities from the selected year.</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="add-year-submit-btn">Add Year</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up submit button
        const submitBtn = document.getElementById('add-year-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', function() {
                addNewYear();
            });
        }
    }
    
    // Get existing years for the copy-from dropdown
    const dataStore = getDataStore();
    const copyFromSelect = document.getElementById('copy-from-year-select');
    
    if (copyFromSelect) {
        // Clear existing options except the first one
        while (copyFromSelect.options.length > 1) {
            copyFromSelect.remove(1);
        }
        
        // Add options for each existing year
        if (dataStore.getYears()) {
            const years = dataStore.getYears().sort().reverse();
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                copyFromSelect.appendChild(option);
            });
        }
    }
    
    // Set default year to current year + 1
    const yearInput = document.getElementById('new-year-input');
    if (yearInput) {
        const currentYear = new Date().getFullYear();
        yearInput.value = currentYear + 1;
        yearInput.min = 1900;
        yearInput.max = currentYear + 100;
    }
    
    // Show the modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

/**
 * Add a new year to the data
 */
function addNewYear() {
    const yearInput = document.getElementById('new-year-input');
    const copyFromSelect = document.getElementById('copy-from-year-select');
    
    if (!yearInput) return;
    
    const newYear = yearInput.value.trim();
    const copyFromYear = copyFromSelect ? copyFromSelect.value : '';
    
    if (!newYear || isNaN(parseInt(newYear))) {
        alert('Please enter a valid year.');
        return;
    }
    
    const dataStore = getDataStore();
    
    // Check if year already exists
    if (dataStore.getYears() && dataStore.getYears().includes(parseInt(newYear))) {
        alert('This year already exists in your data.');
        return;
    }
    
    // Initialize year data
    if (!dataStore.getYears()) {
        dataStore.addYear(parseInt(newYear));
    }
    
    if (copyFromYear && dataStore.getYears().includes(parseInt(copyFromYear))) {
        // Copy from existing year
        const sourceYear = dataStore.getYearData(parseInt(copyFromYear));
        
        // Deep clone the year data
        dataStore.addYear(parseInt(newYear), sourceYear);
    } else {
        // Create with empty data
        dataStore.addYear(parseInt(newYear));
    }
    
    // Save and update UI
    dataStore.saveData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('add-year-modal'));
    if (modal) {
        modal.hide();
    }
    
    // Update year selector and select the new year
    populateYearSelect(newYear);
}

/**
 * Delete the currently selected year
 */
function deleteCurrentYear() {
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect) return;
    
    const selectedYear = yearSelect.value;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete all data for the year ${selectedYear}? This cannot be undone.`)) {
        return;
    }
    
    const data = getCurrentData();
    
    // Don't allow deleting the last year
    if (!data.years || Object.keys(data.years).length <= 1) {
        alert('You cannot delete the last remaining year. Please add another year first.');
        return;
    }
    
    // Delete the year
    delete data.years[selectedYear];
    saveData(data);
    
    // Update year selector
    populateYearSelect();
}