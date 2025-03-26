/**
 * Form Handler Module
 * Manages asset and liability form inputs
 */
import { getDataService } from './dataService.js';

export function initFormHandler() {
    // Set up form event listeners
    const assetForm = document.getElementById('asset-form');
    const liabilityForm = document.getElementById('liability-form');
    
    if (assetForm) {
        assetForm.addEventListener('submit', handleAssetSubmit);
    }
    
    if (liabilityForm) {
        liabilityForm.addEventListener('submit', handleLiabilitySubmit);
    }
    
    // Set up delete buttons
    setupDeleteHandlers();
}

function handleAssetSubmit(event) {
    event.preventDefault();
    
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect) return;
    
    const year = parseInt(yearSelect.value);
    const category = document.getElementById('asset-category').value;
    const value = parseFloat(document.getElementById('asset-value').value);
    
    if (!category || isNaN(value)) {
        alert('Please fill in all fields correctly');
        return;
    }
    
    const dataService = getDataService();
    dataService.addAsset(year, { category, value });
    
    // Reset form
    event.target.reset();
}

function handleLiabilitySubmit(event) {
    event.preventDefault();
    
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect) return;
    
    const year = parseInt(yearSelect.value);
    const category = document.getElementById('liability-category').value;
    const value = parseFloat(document.getElementById('liability-value').value);
    
    if (!category || isNaN(value)) {
        alert('Please fill in all fields correctly');
        return;
    }
    
    const dataService = getDataService();
    dataService.addLiability(year, { category, value });
    
    // Reset form
    event.target.reset();
}

function setupDeleteHandlers() {
    // Set up asset deletion
    document.addEventListener('click', event => {
        if (event.target.matches('.delete-asset')) {
            const yearSelect = document.getElementById('year-select');
            if (!yearSelect) return;
            
            const year = parseInt(yearSelect.value);
            const assetId = event.target.dataset.id;
            
            if (confirm('Are you sure you want to delete this asset?')) {
                const dataService = getDataService();
                dataService.removeAsset(year, assetId);
            }
        }
    });
    
    // Set up liability deletion
    document.addEventListener('click', event => {
        if (event.target.matches('.delete-liability')) {
            const yearSelect = document.getElementById('year-select');
            if (!yearSelect) return;
            
            const year = parseInt(yearSelect.value);
            const liabilityId = event.target.dataset.id;
            
            if (confirm('Are you sure you want to delete this liability?')) {
                const dataService = getDataService();
                dataService.removeLiability(year, liabilityId);
            }
        }
    });
}

// Export for global access if needed
window.refreshForms = setupDeleteHandlers; 