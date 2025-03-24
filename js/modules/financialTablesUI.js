/**
 * Financial Tables UI Module
 * Handles the assets and liabilities tables UI
 */
import { getCurrentData, saveData } from './dataService.js';
import { formatCurrency } from './utils.js';
import { showAssetForm, showLiabilityForm } from './formHandlerUI.js';
import { updateDashboardSummary } from './dashboardUI.js';
import { renderDashboardCharts } from './chartsUI.js';

/**
 * Render the financial tables (assets & liabilities) for the specified year
 * @param {string} yearId - The year ID to render tables for
 */
export function renderFinancialTables(yearId) {
    if (!yearId) {
        const yearSelect = document.getElementById('year-select');
        if (yearSelect) {
            yearId = yearSelect.value;
        }
    }
    
    if (!yearId) return;
    
    // Render both tables
    renderAssetsTable(yearId);
    renderLiabilitiesTable(yearId);
    
    // Update totals
    updateTotals(yearId);
    
    // Set up action buttons for both tables
    setupActionButtons('asset');
    setupActionButtons('liability');
}

/**
 * Render the assets table for the specified year
 * @param {string} yearId - The year ID to render the assets table for
 */
function renderAssetsTable(yearId) {
    if (!yearId) return;
    
    const data = getCurrentData();
    const assetsTableBody = document.querySelector('#assets-table tbody');
    
    if (!assetsTableBody) return;
    
    // Clear existing rows
    assetsTableBody.innerHTML = '';
    
    // Check if year data exists
    if (!data.years || !data.years[yearId] || !data.years[yearId].assets) {
        // No assets to display
        return;
    }
    
    // Sort assets by value (highest first)
    const assets = [...data.years[yearId].assets].sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    
    // Add assets to table
    assets.forEach(asset => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${asset.category || 'Uncategorized'}</td>
            <td>${asset.name}</td>
            <td>${formatCurrency(asset.value)}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary edit-asset" data-id="${asset.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-outline-danger delete-asset" data-id="${asset.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        assetsTableBody.appendChild(row);
    });
}

/**
 * Render the liabilities table for the specified year
 * @param {string} yearId - The year ID to render the liabilities table for
 */
function renderLiabilitiesTable(yearId) {
    if (!yearId) return;
    
    const data = getCurrentData();
    const liabilitiesTableBody = document.querySelector('#liabilities-table tbody');
    
    if (!liabilitiesTableBody) return;
    
    // Clear existing rows
    liabilitiesTableBody.innerHTML = '';
    
    // Check if year data exists
    if (!data.years || !data.years[yearId] || !data.years[yearId].liabilities) {
        // No liabilities to display
        return;
    }
    
    // Sort liabilities by value (highest first)
    const liabilities = [...data.years[yearId].liabilities].sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    
    // Add liabilities to table
    liabilities.forEach(liability => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${liability.category || 'Uncategorized'}</td>
            <td>${liability.name}</td>
            <td>${formatCurrency(liability.value)}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary edit-liability" data-id="${liability.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-outline-danger delete-liability" data-id="${liability.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        liabilitiesTableBody.appendChild(row);
    });
}

/**
 * Set up action buttons for the specified item type
 * @param {string} itemType - The type of item ('asset' or 'liability')
 */
function setupActionButtons(itemType) {
    // Edit buttons
    document.querySelectorAll(`.edit-${itemType}`).forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editItem(id, itemType);
        });
    });
    
    // Delete buttons
    document.querySelectorAll(`.delete-${itemType}`).forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deleteItem(id, itemType);
        });
    });
}

/**
 * Edit an item
 * @param {string} id - The ID of the item to edit
 * @param {string} type - The type of item ('asset' or 'liability')
 */
function editItem(id, type) {
    if (!id || !type) return;
    
    const data = getCurrentData();
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect) return;
    
    const yearId = yearSelect.value;
    if (!yearId || !data.years || !data.years[yearId]) return;
    
    if (type === 'asset') {
        if (!data.years[yearId].assets) return;
        
        const asset = data.years[yearId].assets.find(a => a.id === id);
        if (asset) {
            showAssetForm(asset);
        }
    } else if (type === 'liability') {
        if (!data.years[yearId].liabilities) return;
        
        const liability = data.years[yearId].liabilities.find(l => l.id === id);
        if (liability) {
            showLiabilityForm(liability);
        }
    }
}

/**
 * Delete an item
 * @param {string} id - The ID of the item to delete
 * @param {string} type - The type of item ('asset' or 'liability')
 */
function deleteItem(id, type) {
    if (!id || !type) return;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
        return;
    }
    
    const data = getCurrentData();
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect) return;
    
    const yearId = yearSelect.value;
    if (!yearId || !data.years || !data.years[yearId]) return;
    
    let updated = false;
    
    if (type === 'asset') {
        if (!data.years[yearId].assets) return;
        
        const index = data.years[yearId].assets.findIndex(a => a.id === id);
        if (index !== -1) {
            data.years[yearId].assets.splice(index, 1);
            updated = true;
        }
    } else if (type === 'liability') {
        if (!data.years[yearId].liabilities) return;
        
        const index = data.years[yearId].liabilities.findIndex(l => l.id === id);
        if (index !== -1) {
            data.years[yearId].liabilities.splice(index, 1);
            updated = true;
        }
    }
    
    if (updated) {
        saveData(data);
        renderFinancialTables(yearId);
        updateDashboardSummary();
        renderDashboardCharts();
    }
}

/**
 * Update the totals displayed in the tables
 * @param {string} yearId - The year ID to update totals for
 */
export function updateTotals(yearId) {
    if (!yearId) {
        const yearSelect = document.getElementById('year-select');
        if (yearSelect) {
            yearId = yearSelect.value;
        }
    }
    
    if (!yearId) return;
    
    const data = getCurrentData();
    if (!data.years || !data.years[yearId]) return;
    
    // Calculate totals
    let assetsTotal = 0;
    let liabilitiesTotal = 0;
    
    if (data.years[yearId].assets) {
        assetsTotal = data.years[yearId].assets.reduce((total, asset) => total + parseFloat(asset.value), 0);
    }
    
    if (data.years[yearId].liabilities) {
        liabilitiesTotal = data.years[yearId].liabilities.reduce((total, liability) => total + parseFloat(liability.value), 0);
    }
    
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