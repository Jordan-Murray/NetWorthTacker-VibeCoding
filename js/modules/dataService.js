/**
 * Core Data Service Module
 * Provides essential data operations for net worth tracking
 */

export class DataService {
    constructor(storage = localStorage) {
        this.storage = storage;
        this.storageKey = 'netWorthData';
        this.data = { years: {} };
        this.eventListeners = new Map();
        this.loadData();
        this._idCounter = 0;
    }

    generateId() {
        // Use crypto.randomUUID() in browser environment, fallback to counter for tests
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return `test-id-${++this._idCounter}`;
    }

    loadData() {
        const savedData = this.storage.getItem(this.storageKey);
        if (savedData) {
            try {
                this.data = JSON.parse(savedData);
            } catch (e) {
                this.initializeDefaultData();
            }
        } else {
            this.initializeDefaultData();
        }
    }

    saveData() {
        this.storage.setItem(this.storageKey, JSON.stringify(this.data));
        this.emit('dataChanged');
    }

    initializeDefaultData() {
        const currentYear = new Date().getFullYear();
        this.data = {
            years: {
                [currentYear]: {
                    assets: [],
                    liabilities: []
                }
            }
        };
        this.saveData();
    }

    // Event handling
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(callback);
        }
    }

    emit(event) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => callback());
        }
    }

    // Core data operations
    getYears() {
        return Object.keys(this.data.years).map(Number).sort((a, b) => a - b);
    }

    addYear(year) {
        if (!this.data.years[year]) {
            this.data.years[year] = {
                assets: [],
                liabilities: []
            };
            this.saveData();
            return true;
        }
        return false;
    }

    removeYear(year) {
        if (this.data.years[year]) {
            delete this.data.years[year];
            this.saveData();
            return true;
        }
        return false;
    }

    getAssets(year) {
        return this.data.years[year]?.assets || [];
    }

    getLiabilities(year) {
        return this.data.years[year]?.liabilities || [];
    }

    addAsset(year, category, value) {
        if (!this.data.years[year]) {
            this.addYear(year);
        }
        
        this.data.years[year].assets.push({
            id: this.generateId(),
            category,
            value: Number(value),
            dateAdded: new Date().toISOString()
        });
        
        this.saveData();
    }

    addLiability(year, category, value) {
        if (!this.data.years[year]) {
            this.addYear(year);
        }
        
        this.data.years[year].liabilities.push({
            id: this.generateId(),
            category,
            value: Number(value),
            dateAdded: new Date().toISOString()
        });
        
        this.saveData();
    }

    removeAsset(year, id) {
        if (!this.data.years[year]) {
            return false;
        }
        const initialLength = this.data.years[year].assets.length;
        this.data.years[year].assets = this.data.years[year].assets.filter(asset => asset.id !== id);
        const wasRemoved = initialLength > this.data.years[year].assets.length;
        if (wasRemoved) {
            this.saveData();
        }
        return wasRemoved;
    }

    removeLiability(year, id) {
        if (!this.data.years[year]) {
            return false;
        }
        const initialLength = this.data.years[year].liabilities.length;
        this.data.years[year].liabilities = this.data.years[year].liabilities.filter(liability => liability.id !== id);
        const wasRemoved = initialLength > this.data.years[year].liabilities.length;
        if (wasRemoved) {
            this.saveData();
        }
        return wasRemoved;
    }

    // Calculations
    getTotalAssets(year) {
        return this.getAssets(year).reduce((sum, asset) => sum + asset.value, 0);
    }

    getTotalLiabilities(year) {
        return this.getLiabilities(year).reduce((sum, liability) => sum + liability.value, 0);
    }

    getNetWorth(year) {
        return this.getTotalAssets(year) - this.getTotalLiabilities(year);
    }

    getDebtToAssetRatio(year) {
        const totalAssets = this.getTotalAssets(year);
        if (totalAssets === 0) return 0;
        return (this.getTotalLiabilities(year) / totalAssets) * 100;
    }
}

// Singleton instance
let dataService = null;

export function getDataService() {
    if (!dataService) {
        dataService = new DataService();
    }
    return dataService;
} 