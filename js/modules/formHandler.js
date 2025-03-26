/**
 * Form Handler Module
 * Manages asset and liability form inputs
 */
import { getDataService } from './dataService.js';

export class FormHandler {
    constructor(dataService) {
        this.dataService = dataService;
    }

    init() {
        // Set up form event listeners
        const assetForm = document.getElementById('asset-form');
        const liabilityForm = document.getElementById('liability-form');
        
        if (assetForm) {
            assetForm.addEventListener('submit', (e) => this.handleAssetSubmit(e));
        }
        
        if (liabilityForm) {
            liabilityForm.addEventListener('submit', (e) => this.handleLiabilitySubmit(e));
        }
        
        // Set up delete buttons
        this.setupDeleteHandlers();
    }

    handleAssetSubmit(event) {
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
        
        this.dataService.addAsset(year, { category, value });
        
        // Reset form
        event.target.reset();
    }

    handleLiabilitySubmit(event) {
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
        
        this.dataService.addLiability(year, { category, value });
        
        // Reset form
        event.target.reset();
    }

    setupDeleteHandlers() {
        // Set up asset deletion
        document.addEventListener('click', event => {
            if (event.target.matches('.delete-asset')) {
                const yearSelect = document.getElementById('year-select');
                if (!yearSelect) return;
                
                const year = parseInt(yearSelect.value);
                const assetId = event.target.dataset.id;
                
                if (confirm('Are you sure you want to delete this asset?')) {
                    this.dataService.removeAsset(year, assetId);
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
                    this.dataService.removeLiability(year, liabilityId);
                }
            }
        });
    }
} 