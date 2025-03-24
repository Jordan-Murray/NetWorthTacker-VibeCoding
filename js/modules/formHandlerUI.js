/**
 * Form Handler UI Module
 * Handles forms for adding/editing assets and liabilities
 */
import { getCurrentData, saveData, generateId } from './dataService.js';
import { renderFinancialTables } from './financialTablesUI.js';
import { updateDashboardSummary } from './dashboardUI.js';
import { renderDashboardCharts } from './chartsUI.js';

/**
 * Initialize form handlers
 */
export function initFormHandlers() {
    setupAssetForm();
    setupLiabilityForm();
}

/**
 * Set up asset form
 */
function setupAssetForm() {
    const addAssetBtn = document.getElementById('add-asset');
    if (addAssetBtn) {
        addAssetBtn.addEventListener('click', function() {
            showAssetForm();
        });
    }
}

/**
 * Set up liability form
 */
function setupLiabilityForm() {
    const addLiabilityBtn = document.getElementById('add-liability');
    if (addLiabilityBtn) {
        addLiabilityBtn.addEventListener('click', function() {
            showLiabilityForm();
        });
    }
}

/**
 * Show the asset form
 * @param {Object} [asset] - Asset to edit (optional)
 */
export function showAssetForm(asset) {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    
    const yearSelect = document.getElementById('year-select');
    const selectedYear = yearSelect ? yearSelect.value : null;
    
    if (!selectedYear) {
        alert('Please select a year first.');
        return;
    }
    
    const isEditing = !!asset;
    
    // Create form HTML
    modalBody.innerHTML = `
        <h2>${isEditing ? 'Edit' : 'Add'} Asset</h2>
        <form id="asset-form">
            <div class="form-group">
                <label for="asset-name">Name:</label>
                <input type="text" id="asset-name" class="form-control" value="${isEditing ? asset.name : ''}" required>
            </div>
            <div class="form-group">
                <label for="asset-category">Category:</label>
                <select id="asset-category" class="form-control">
                    <option value="Cash" ${isEditing && asset.category === 'Cash' ? 'selected' : ''}>Cash</option>
                    <option value="Property" ${isEditing && asset.category === 'Property' ? 'selected' : ''}>Property</option>
                    <option value="Investments" ${isEditing && asset.category === 'Investments' ? 'selected' : ''}>Investments</option>
                    <option value="Retirement" ${isEditing && asset.category === 'Retirement' ? 'selected' : ''}>Retirement</option>
                    <option value="Vehicle" ${isEditing && asset.category === 'Vehicle' ? 'selected' : ''}>Vehicle</option>
                    <option value="Other" ${isEditing && asset.category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label for="asset-value">Value (£):</label>
                <input type="number" id="asset-value" class="form-control" min="0" step="0.01" value="${isEditing ? asset.value : ''}" required>
            </div>
            <div class="form-group">
                <label for="asset-notes">Notes:</label>
                <textarea id="asset-notes" class="form-control">${isEditing && asset.notes ? asset.notes : ''}</textarea>
            </div>
            ${isEditing ? `<input type="hidden" id="asset-id" value="${asset.id}">` : ''}
            <div class="form-actions">
                <button type="button" class="cancel-btn" onclick="document.getElementById('modal-container').classList.add('modal-hidden')">Cancel</button>
                <button type="submit" class="save-btn">Save</button>
            </div>
        </form>
    `;
    
    // Show modal
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.remove('modal-hidden');
        modalContainer.classList.add('modal-visible');
    }
    
    // Set up form submission
    const form = document.getElementById('asset-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAssetForm(selectedYear);
        });
    }
}

/**
 * Save the asset form
 * @param {string} yearId - The year to save the asset to
 */
function saveAssetForm(yearId) {
    const nameInput = document.getElementById('asset-name');
    const categoryInput = document.getElementById('asset-category');
    const valueInput = document.getElementById('asset-value');
    const notesInput = document.getElementById('asset-notes');
    const idInput = document.getElementById('asset-id');
    
    if (!nameInput || !categoryInput || !valueInput) return;
    
    const name = nameInput.value.trim();
    const category = categoryInput.value;
    const value = parseFloat(valueInput.value);
    const notes = notesInput ? notesInput.value.trim() : '';
    const id = idInput ? idInput.value : '';
    
    if (!name || isNaN(value) || value < 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    const data = getCurrentData();
    
    if (!data.years[yearId]) {
        data.years[yearId] = {
            assets: [],
            liabilities: []
        };
    }
    
    if (!data.years[yearId].assets) {
        data.years[yearId].assets = [];
    }
    
    if (id) {
        // Edit existing asset
        const index = data.years[yearId].assets.findIndex(asset => asset.id === id);
        if (index !== -1) {
            data.years[yearId].assets[index] = {
                ...data.years[yearId].assets[index],
                name,
                category,
                value,
                notes,
                lastModified: new Date().toISOString()
            };
        }
    } else {
        // Add new asset
        data.years[yearId].assets.push({
            id: generateId(),
            name,
            category,
            value,
            notes,
            dateAdded: new Date().toISOString()
        });
    }
    
    saveData(data);
    
    // Close modal
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.add('modal-hidden');
        modalContainer.classList.remove('modal-visible');
    }
    
    // Update UI
    renderFinancialTables(yearId);
    updateDashboardSummary();
    renderDashboardCharts();
}

/**
 * Show the liability form
 * @param {Object} [liability] - Liability to edit (optional)
 */
export function showLiabilityForm(liability) {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    
    const yearSelect = document.getElementById('year-select');
    const selectedYear = yearSelect ? yearSelect.value : null;
    
    if (!selectedYear) {
        alert('Please select a year first.');
        return;
    }
    
    const isEditing = !!liability;
    
    // Create form HTML
    modalBody.innerHTML = `
        <h2>${isEditing ? 'Edit' : 'Add'} Liability</h2>
        <form id="liability-form">
            <div class="form-group">
                <label for="liability-name">Name:</label>
                <input type="text" id="liability-name" class="form-control" value="${isEditing ? liability.name : ''}" required>
            </div>
            <div class="form-group">
                <label for="liability-category">Category:</label>
                <select id="liability-category" class="form-control">
                    <option value="Mortgage" ${isEditing && liability.category === 'Mortgage' ? 'selected' : ''}>Mortgage</option>
                    <option value="Loan" ${isEditing && liability.category === 'Loan' ? 'selected' : ''}>Loan</option>
                    <option value="Credit Card" ${isEditing && liability.category === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                    <option value="Student Loan" ${isEditing && liability.category === 'Student Loan' ? 'selected' : ''}>Student Loan</option>
                    <option value="Other" ${isEditing && liability.category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label for="liability-value">Value (£):</label>
                <input type="number" id="liability-value" class="form-control" min="0" step="0.01" value="${isEditing ? liability.value : ''}" required>
            </div>
            <div class="form-group">
                <label for="liability-interest">Interest Rate (%):</label>
                <input type="number" id="liability-interest" class="form-control" min="0" step="0.1" value="${isEditing && liability.interestRate ? liability.interestRate : ''}">
            </div>
            <div class="form-group">
                <label for="liability-notes">Notes:</label>
                <textarea id="liability-notes" class="form-control">${isEditing && liability.notes ? liability.notes : ''}</textarea>
            </div>
            ${isEditing ? `<input type="hidden" id="liability-id" value="${liability.id}">` : ''}
            <div class="form-actions">
                <button type="button" class="cancel-btn" onclick="document.getElementById('modal-container').classList.add('modal-hidden')">Cancel</button>
                <button type="submit" class="save-btn">Save</button>
            </div>
        </form>
    `;
    
    // Show modal
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.remove('modal-hidden');
        modalContainer.classList.add('modal-visible');
    }
    
    // Set up form submission
    const form = document.getElementById('liability-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveLiabilityForm(selectedYear);
        });
    }
}

/**
 * Save the liability form
 * @param {string} yearId - The year to save the liability to
 */
function saveLiabilityForm(yearId) {
    const nameInput = document.getElementById('liability-name');
    const categoryInput = document.getElementById('liability-category');
    const valueInput = document.getElementById('liability-value');
    const interestInput = document.getElementById('liability-interest');
    const notesInput = document.getElementById('liability-notes');
    const idInput = document.getElementById('liability-id');
    
    if (!nameInput || !categoryInput || !valueInput) return;
    
    const name = nameInput.value.trim();
    const category = categoryInput.value;
    const value = parseFloat(valueInput.value);
    const interestRate = interestInput && interestInput.value ? parseFloat(interestInput.value) : null;
    const notes = notesInput ? notesInput.value.trim() : '';
    const id = idInput ? idInput.value : '';
    
    if (!name || isNaN(value) || value < 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    const data = getCurrentData();
    
    if (!data.years[yearId]) {
        data.years[yearId] = {
            assets: [],
            liabilities: []
        };
    }
    
    if (!data.years[yearId].liabilities) {
        data.years[yearId].liabilities = [];
    }
    
    if (id) {
        // Edit existing liability
        const index = data.years[yearId].liabilities.findIndex(liability => liability.id === id);
        if (index !== -1) {
            data.years[yearId].liabilities[index] = {
                ...data.years[yearId].liabilities[index],
                name,
                category,
                value,
                interestRate,
                notes,
                lastModified: new Date().toISOString()
            };
        }
    } else {
        // Add new liability
        data.years[yearId].liabilities.push({
            id: generateId(),
            name,
            category,
            value,
            interestRate,
            notes,
            dateAdded: new Date().toISOString()
        });
    }
    
    saveData(data);
    
    // Close modal
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.add('modal-hidden');
        modalContainer.classList.remove('modal-visible');
    }
    
    // Update UI
    renderFinancialTables(yearId);
    updateDashboardSummary();
    renderDashboardCharts();
} 