/**
 * Financial Tables UI Module
 * Handles the assets and liabilities tables UI
 */
import { getDataStore } from './enhancedDataService.js';
import { formatCurrency } from './utils.js';
import { showModal } from './modalModule.js';

/**
 * Initialize financial tables
 */
export function initFinancialTables() {
    // Initial render
    renderFinancialTables();
    
    // Set up event listeners
    const dataStore = getDataStore();
    dataStore.addEventListener('dataUpdated', renderFinancialTables);
    dataStore.addEventListener('yearChanged', renderFinancialTables);
    dataStore.addEventListener('assetAdded', renderFinancialTables);
    dataStore.addEventListener('assetUpdated', renderFinancialTables);
    dataStore.addEventListener('assetRemoved', renderFinancialTables);
    dataStore.addEventListener('liabilityAdded', renderFinancialTables);
    dataStore.addEventListener('liabilityUpdated', renderFinancialTables);
    dataStore.addEventListener('liabilityRemoved', renderFinancialTables);
    
    // Add button event listeners
    setupAddButtons();
    
    // Export for global access (backward compatibility)
    window.refreshFinancialTables = renderFinancialTables;
}

/**
 * Set up add buttons
 */
function setupAddButtons() {
    const addAssetBtn = document.getElementById('add-asset');
    if (addAssetBtn) {
        addAssetBtn.addEventListener('click', showAddAssetModal);
    }
    
    const addLiabilityBtn = document.getElementById('add-liability');
    if (addLiabilityBtn) {
        addLiabilityBtn.addEventListener('click', showAddLiabilityModal);
    }
}

/**
 * Render the financial tables (assets & liabilities) for the specified year
 * @param {string} [yearId] - The year ID to render tables for (optional)
 */
export function renderFinancialTables(yearId) {
    if (!yearId) {
        const yearSelect = document.getElementById('year-select');
        if (yearSelect) {
            yearId = yearSelect.value;
        }
    }
    
    if (!yearId) {
        const dataStore = getDataStore();
        const years = dataStore.getYears();
        if (years.length > 0) {
            yearId = years[0].toString();
        } else {
            return; // No years available
        }
    }
    
    // Render both tables
    renderAssetsTable(yearId);
    renderLiabilitiesTable(yearId);
    
    // Update totals
    updateTotals(yearId);
}

/**
 * Render the assets table for the specified year
 * @param {string} yearId - The year ID to render the assets table for
 */
function renderAssetsTable(yearId) {
    const dataStore = getDataStore();
    const assetsTableBody = document.querySelector('#assets-table tbody');
    
    if (!assetsTableBody) return;
    
    // Clear existing rows
    assetsTableBody.innerHTML = '';
    
    // Get assets for year
    const assets = dataStore.getAssets(yearId);
    
    if (assets.length === 0) {
        // No assets to display
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="4" class="empty-table">No assets added yet. Click "Add Asset" to get started.</td>';
        assetsTableBody.appendChild(emptyRow);
        return;
    }
    
    // Sort assets by value (highest first)
    const sortedAssets = [...assets].sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    
    // Add assets to table
    sortedAssets.forEach(asset => {
        const row = document.createElement('tr');
        row.className = 'finance-item';
        
        row.innerHTML = `
            <td>${asset.category || 'Uncategorized'}</td>
            <td>${asset.name || ''}</td>
            <td>${formatCurrency(asset.value)}</td>
            <td class="item-actions">
                <button class="action-btn edit-btn" data-id="${asset.id}">Edit</button>
                <button class="action-btn delete-btn" data-id="${asset.id}">Delete</button>
            </td>
        `;
        
        assetsTableBody.appendChild(row);
    });
    
    // Set up edit and delete buttons
    setupAssetActionButtons(yearId);
}

/**
 * Set up asset edit and delete buttons
 * @param {string} yearId - The year ID
 */
function setupAssetActionButtons(yearId) {
    // Edit buttons
    document.querySelectorAll('#assets-table .edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            const assetId = button.getAttribute('data-id');
            showEditAssetModal(yearId, assetId);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('#assets-table .delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            const assetId = button.getAttribute('data-id');
            deleteAsset(yearId, assetId);
        });
    });
}

/**
 * Render the liabilities table for the specified year
 * @param {string} yearId - The year ID to render the liabilities table for
 */
function renderLiabilitiesTable(yearId) {
    const dataStore = getDataStore();
    const liabilitiesTableBody = document.querySelector('#liabilities-table tbody');
    
    if (!liabilitiesTableBody) return;
    
    // Clear existing rows
    liabilitiesTableBody.innerHTML = '';
    
    // Get liabilities for year
    const liabilities = dataStore.getLiabilities(yearId);
    
    if (liabilities.length === 0) {
        // No liabilities to display
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="4" class="empty-table">No liabilities added yet. Click "Add Liability" to get started.</td>';
        liabilitiesTableBody.appendChild(emptyRow);
        return;
    }
    
    // Sort liabilities by value (highest first)
    const sortedLiabilities = [...liabilities].sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    
    // Add liabilities to table
    sortedLiabilities.forEach(liability => {
        const row = document.createElement('tr');
        row.className = 'finance-item';
        
        row.innerHTML = `
            <td>${liability.category || 'Uncategorized'}</td>
            <td>${liability.name || liability.category}</td>
            <td>${formatCurrency(liability.value)}</td>
            <td class="item-actions">
                <button class="action-btn edit-btn" data-id="${liability.id}">Edit</button>
                <button class="action-btn delete-btn" data-id="${liability.id}">Delete</button>
            </td>
        `;
        
        liabilitiesTableBody.appendChild(row);
    });
    
    // Set up edit and delete buttons
    setupLiabilityActionButtons(yearId);
}

/**
 * Set up liability edit and delete buttons
 * @param {string} yearId - The year ID
 */
function setupLiabilityActionButtons(yearId) {
    // Edit buttons
    document.querySelectorAll('#liabilities-table .edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            const liabilityId = button.getAttribute('data-id');
            showEditLiabilityModal(yearId, liabilityId);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('#liabilities-table .delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            const liabilityId = button.getAttribute('data-id');
            deleteLiability(yearId, liabilityId);
        });
    });
}

/**
 * Update the totals displayed in the tables
 * @param {string} yearId - The year ID to update totals for
 */
export function updateTotals(yearId) {
    const dataStore = getDataStore();
    
    // Calculate totals
    const assetsTotal = dataStore.getTotalAssets(yearId);
    const liabilitiesTotal = dataStore.getTotalLiabilities(yearId);
    
    // Update UI
    const assetsTotalElement = document.getElementById('assets-total');
    const liabilitiesTotalElement = document.getElementById('liabilities-total');
    
    if (assetsTotalElement) {
        assetsTotalElement.textContent = formatCurrency(assetsTotal);
    }
    
    if (liabilitiesTotalElement) {
        liabilitiesTotalElement.textContent = formatCurrency(liabilitiesTotal);
    }
}

/**
 * Show add asset modal
 */
export function showAddAssetModal() {
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect || !yearSelect.value) {
        alert('Please select a year first.');
        return;
    }
    
    const modalContent = `
        <h2>Add New Asset</h2>
        <div class="form-group">
            <label for="asset-category">Category:</label>
            <select id="asset-category">
                <option value="Properties">Properties</option>
                <option value="Retirement Savings">Retirement Savings</option>
                <option value="Investments">Investments</option>
                <option value="Cash and Cash Equivalent">Cash and Cash Equivalent</option>
                <option value="Other Assets">Other Assets</option>
            </select>
        </div>
        <div class="form-group">
            <label for="asset-name">Item Name:</label>
            <input type="text" id="asset-name" placeholder="e.g. Home, Car, Stocks..." />
        </div>
        <div class="form-group">
            <label for="asset-value">Value (£):</label>
            <input type="number" id="asset-value" min="0" step="0.01" />
        </div>
        <div class="form-actions">
            <button id="cancel-asset" class="cancel-btn">Cancel</button>
            <button id="save-asset" class="save-btn">Add Asset</button>
        </div>
    `;
    
    showModal(modalContent, 'add-asset');
}

/**
 * Show edit asset modal
 * @param {string} yearId - Year ID
 * @param {string} assetId - Asset ID
 */
export function showEditAssetModal(yearId, assetId) {
    const dataStore = getDataStore();
    const assets = dataStore.getAssets(yearId);
    const asset = assets.find(a => a.id === assetId);
    
    if (!asset) {
        console.error(`Asset with ID ${assetId} not found`);
        return;
    }
    
    const modalContent = `
        <h2>Edit Asset</h2>
        <div class="form-group">
            <label for="asset-category">Category:</label>
            <select id="asset-category">
                <option value="Properties" ${asset.category === 'Properties' ? 'selected' : ''}>Properties</option>
                <option value="Retirement Savings" ${asset.category === 'Retirement Savings' ? 'selected' : ''}>Retirement Savings</option>
                <option value="Investments" ${asset.category === 'Investments' ? 'selected' : ''}>Investments</option>
                <option value="Cash and Cash Equivalent" ${asset.category === 'Cash and Cash Equivalent' ? 'selected' : ''}>Cash and Cash Equivalent</option>
                <option value="Other Assets" ${asset.category === 'Other Assets' ? 'selected' : ''}>Other Assets</option>
            </select>
        </div>
        <div class="form-group">
            <label for="asset-name">Item Name:</label>
            <input type="text" id="asset-name" value="${asset.name || ''}" placeholder="e.g. Home, Car, Stocks..." />
        </div>
        <div class="form-group">
            <label for="asset-value">Value (£):</label>
            <input type="number" id="asset-value" min="0" step="0.01" value="${asset.value}" />
        </div>
        <input type="hidden" id="asset-id" value="${asset.id}" />
        <div class="form-actions">
            <button id="cancel-asset" class="cancel-btn">Cancel</button>
            <button id="save-asset" class="save-btn">Save Changes</button>
        </div>
    `;
    
    showModal(modalContent, 'edit-asset');
    
    // Custom event handler for the save button
    const saveButton = document.getElementById('save-asset');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const category = document.getElementById('asset-category').value;
            const name = document.getElementById('asset-name').value;
            const value = parseFloat(document.getElementById('asset-value').value);
            
            if (category && name && !isNaN(value) && value >= 0) {
                dataStore.updateAsset(yearId, assetId, { category, name, value });
                window.hideModal();
            } else {
                alert('Please fill all fields with valid values');
            }
        });
    }
}

/**
 * Delete an asset
 * @param {string} yearId - Year ID
 * @param {string} assetId - Asset ID
 */
export function deleteAsset(yearId, assetId) {
    if (confirm('Are you sure you want to delete this asset?')) {
        const dataStore = getDataStore();
        dataStore.removeAsset(yearId, assetId);
    }
}

/**
 * Show add liability modal
 */
export function showAddLiabilityModal() {
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect || !yearSelect.value) {
        alert('Please select a year first.');
        return;
    }
    
    const modalContent = `
        <h2>Add New Liability</h2>
        <div class="form-group">
            <label for="liability-category">Category:</label>
            <select id="liability-category">
                <option value="Mortgages">Mortgages</option>
                <option value="Car loans">Car loans</option>
                <option value="Student loans">Student loans</option>
                <option value="Credit Card Debt">Credit Card Debt</option>
                <option value="Personal Loans">Personal Loans</option>
                <option value="Other Debts">Other Debts</option>
            </select>
        </div>
        <div class="form-group">
            <label for="liability-name">Description (optional):</label>
            <input type="text" id="liability-name" placeholder="e.g. Home mortgage, Car loan..." />
        </div>
        <div class="form-group">
            <label for="liability-value">Value (£):</label>
            <input type="number" id="liability-value" min="0" step="0.01" />
        </div>
        <div class="form-actions">
            <button id="cancel-liability" class="cancel-btn">Cancel</button>
            <button id="save-liability" class="save-btn">Add Liability</button>
        </div>
    `;
    
    showModal(modalContent, 'add-liability');
}

/**
 * Show edit liability modal
 * @param {string} yearId - Year ID
 * @param {string} liabilityId - Liability ID
 */
export function showEditLiabilityModal(yearId, liabilityId) {
    const dataStore = getDataStore();
    const liabilities = dataStore.getLiabilities(yearId);
    const liability = liabilities.find(l => l.id === liabilityId);
    
    if (!liability) {
        console.error(`Liability with ID ${liabilityId} not found`);
        return;
    }
    
    const modalContent = `
        <h2>Edit Liability</h2>
        <div class="form-group">
            <label for="liability-category">Category:</label>
            <select id="liability-category">
                <option value="Mortgages" ${liability.category === 'Mortgages' ? 'selected' : ''}>Mortgages</option>
                <option value="Car loans" ${liability.category === 'Car loans' ? 'selected' : ''}>Car loans</option>
                <option value="Student loans" ${liability.category === 'Student loans' ? 'selected' : ''}>Student loans</option>
                <option value="Credit Card Debt" ${liability.category === 'Credit Card Debt' ? 'selected' : ''}>Credit Card Debt</option>
                <option value="Personal Loans" ${liability.category === 'Personal Loans' ? 'selected' : ''}>Personal Loans</option>
                <option value="Other Debts" ${liability.category === 'Other Debts' ? 'selected' : ''}>Other Debts</option>
            </select>
        </div>
        <div class="form-group">
            <label for="liability-name">Description (optional):</label>
            <input type="text" id="liability-name" value="${liability.name || ''}" placeholder="e.g. Home mortgage, Car loan..." />
        </div>
        <div class="form-group">
            <label for="liability-value">Value (£):</label>
            <input type="number" id="liability-value" min="0" step="0.01" value="${liability.value}" />
        </div>
        <input type="hidden" id="liability-id" value="${liability.id}" />
        <div class="form-actions">
            <button id="cancel-liability" class="cancel-btn">Cancel</button>
            <button id="save-liability" class="save-btn">Save Changes</button>
        </div>
    `;
    
    showModal(modalContent, 'edit-liability');
    
    // Custom event handler for the save button
    const saveButton = document.getElementById('save-liability');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const category = document.getElementById('liability-category').value;
            const name = document.getElementById('liability-name').value;
            const value = parseFloat(document.getElementById('liability-value').value);
            
            if (category && !isNaN(value) && value >= 0) {
                dataStore.updateLiability(yearId, liabilityId, { category, name, value });
                window.hideModal();
            } else {
                alert('Please fill all required fields with valid values');
            }
        });
    }
}

/**
 * Delete a liability
 * @param {string} yearId - Year ID
 * @param {string} liabilityId - Liability ID
 */
export function deleteLiability(yearId, liabilityId) {
    if (confirm('Are you sure you want to delete this liability?')) {
        const dataStore = getDataStore();
        dataStore.removeLiability(yearId, liabilityId);
    }
}

/**
 * Add a new asset 
 * @param {string} year - Year ID
 * @param {string} category - Asset category
 * @param {string} name - Asset name
 * @param {number} value - Asset value
 * @returns {Object} The added asset
 */
export function addAsset(year, category, name, value) {
    const dataStore = getDataStore();
    return dataStore.addAsset(year, category, name, value);
}

/**
 * Add a new liability
 * @param {string} year - Year ID
 * @param {string} category - Liability category
 * @param {string} name - Liability name (optional)
 * @param {number} value - Liability value
 * @returns {Object} The added liability
 */
export function addLiability(year, category, value, name = '') {
    const dataStore = getDataStore();
    const liability = dataStore.addLiability(year, category, value);
    
    // Add name if provided
    if (name) {
        dataStore.updateLiability(year, liability.id, { name });
    }
    
    return liability;
}