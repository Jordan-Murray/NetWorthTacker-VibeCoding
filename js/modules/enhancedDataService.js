/**
 * Enhanced Data Service Module
 * Provides a comprehensive interface for data operations with improved testability
 */

/**
 * DataStore class for managing application data
 */
export class DataStore {
    /**
     * Constructor for DataStore
     * @param {Object} storage - Storage interface (defaults to localStorage)
     */
    constructor(storage = localStorage) {
        this.storage = storage;
        this.data = {
            years: {},
            milestones: [],
            salaryHistory: [],
            savingsHistory: [],
            emergencyFundGoal: 3 // Default to 3 months
        };
        this.storageKey = 'netWorthData';
        this.eventListeners = {};
    }
    
    /**
     * Load data from storage
     * @returns {boolean} Success status
     */
    loadData() {
        const savedData = this.storage.getItem(this.storageKey);
        if (savedData) {
            try {
                this.data = JSON.parse(savedData);
                
                // Backward compatibility checks
                if (!this.data.salaryHistory) {
                    this.data.salaryHistory = [];
                }
                if (!this.data.savingsHistory) {
                    this.data.savingsHistory = [];
                }
                if (this.data.emergencyFundGoal === undefined) {
                    this.data.emergencyFundGoal = 3;
                }
                
                return true;
            } catch (e) {
                console.error('Error loading data:', e);
                this.initializeDefaultData();
                return false;
            }
        } else {
            this.initializeDefaultData();
            return true;
        }
    }
    
    /**
     * Save data to storage
     * @returns {boolean} Success status
     */
    saveData() {
        try {
            this.storage.setItem(this.storageKey, JSON.stringify(this.data));
            this.triggerEvent('dataUpdated', this.data);
            return true;
        } catch (e) {
            console.error('Error saving data:', e);
            return false;
        }
    }
    
    /**
     * Initialize with default data if nothing exists
     */
    initializeDefaultData() {
        const currentYear = new Date().getFullYear();
        this.data = {
            years: {
                [currentYear]: {
                    assets: [],
                    liabilities: []
                }
            },
            milestones: [
                { 
                    id: this.generateId(),
                    amount: 10000, 
                    name: "First £10K", 
                    achieved: false 
                },
                { 
                    id: this.generateId(),
                    amount: 50000, 
                    name: "£50K Milestone", 
                    achieved: false 
                },
                { 
                    id: this.generateId(),
                    amount: 100000, 
                    name: "Six Figure Club", 
                    achieved: false 
                }
            ],
            salaryHistory: [],
            savingsHistory: [],
            emergencyFundGoal: 3
        };
        this.saveData();
    }
    
    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    addEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    removeEventListener(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(
                listener => listener !== callback
            );
        }
    }
    
    /**
     * Trigger event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    triggerEvent(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
        
        // Also dispatch DOM event for compatibility
        const domEvent = new CustomEvent(event, { detail: data });
        document.dispatchEvent(domEvent);
    }
    
    /**
     * Get sorted list of years
     * @returns {Array} Sorted years
     */
    getYears() {
        return Object.keys(this.data.years)
            .map(year => parseInt(year, 10))
            .sort((a, b) => b - a); // Sort descending (newest first)
    }
    
    /**
     * Set the current year
     * @param {number} year - Year to set as current
     * @returns {boolean} Success status
     */
    setCurrentYear(year) {
        if (!this.data.years[year]) {
            return false;
        }
        
        this.data.currentYear = year;
        this.saveData();
        this.triggerEvent('yearChanged', { year });
        return true;
    }
    
    /**
     * Get the current year
     * @returns {number} Current year
     */
    getCurrentYear() {
        return this.data.currentYear || this.getYears()[0];
    }
    
    /**
     * Add a new year to track
     * @param {number} year - Year to add
     * @returns {boolean} Success status
     */
    addYear(year) {
        // Don't add if year already exists
        if (this.data.years[year]) {
            return false;
        }
        
        this.data.years[year] = {
            assets: [],
            liabilities: []
        };
        
        this.saveData();
        this.triggerEvent('yearAdded', { year });
        return true;
    }
    
    /**
     * Remove a year
     * @param {number} year - Year to remove
     * @returns {boolean} Success status
     */
    removeYear(year) {
        if (!this.data.years[year]) {
            return false;
        }
        
        delete this.data.years[year];
        this.saveData();
        this.triggerEvent('yearRemoved', { year });
        return true;
    }
    
    /**
     * Add a new asset to a specific year
     * @param {number} year - Year to add asset to
     * @param {string} category - Asset category
     * @param {string} name - Asset name
     * @param {number} value - Asset value
     * @returns {Object} Added asset
     */
    addAsset(year, category, name, value) {
        if (!this.data.years[year]) {
            this.addYear(year);
        }
        
        const asset = {
            id: this.generateId(),
            category,
            name,
            value,
            dateAdded: new Date().toISOString()
        };
        
        this.data.years[year].assets.push(asset);
        this.saveData();
        this.triggerEvent('assetAdded', { year, asset });
        return asset;
    }
    
    /**
     * Update an existing asset
     * @param {number} year - Year of the asset
     * @param {string} assetId - Asset ID
     * @param {Object} updates - Updates to apply
     * @returns {boolean} Success status
     */
    updateAsset(year, assetId, updates) {
        if (!this.data.years[year]) return false;
        
        const assetIndex = this.data.years[year].assets.findIndex(asset => asset.id === assetId);
        if (assetIndex === -1) return false;
        
        this.data.years[year].assets[assetIndex] = {
            ...this.data.years[year].assets[assetIndex],
            ...updates,
            lastModified: new Date().toISOString()
        };
        
        this.saveData();
        this.triggerEvent('assetUpdated', { 
            year, 
            assetId, 
            asset: this.data.years[year].assets[assetIndex] 
        });
        return true;
    }
    
    /**
     * Remove an asset
     * @param {number} year - Year of the asset
     * @param {string} assetId - Asset ID
     * @returns {boolean} Success status
     */
    removeAsset(year, assetId) {
        if (!this.data.years[year]) return false;
        
        const initialLength = this.data.years[year].assets.length;
        this.data.years[year].assets = this.data.years[year].assets.filter(asset => asset.id !== assetId);
        
        if (initialLength !== this.data.years[year].assets.length) {
            this.saveData();
            this.triggerEvent('assetRemoved', { year, assetId });
            return true;
        }
        
        return false;
    }
    
    /**
     * Get assets for a specific year
     * @param {number} year - Year to get assets for
     * @returns {Array} Assets
     */
    getAssets(year) {
        if (!this.data.years[year]) return [];
        return [...this.data.years[year].assets];
    }
    
    /**
     * Get total assets for a specific year
     * @param {number} year - Year to get total assets for
     * @returns {number} Total assets
     */
    getTotalAssets(year) {
        if (!this.data.years[year]) return 0;
        
        return this.data.years[year].assets.reduce((total, asset) => {
            return total + parseFloat(asset.value);
        }, 0);
    }
    
    /**
     * Get assets grouped by category for a specific year
     * @param {number} year - Year to get assets for
     * @returns {Object} Assets by category
     */
    getAssetsByCategory(year) {
        if (!this.data.years[year]) return {};
        
        const categories = {};
        
        this.data.years[year].assets.forEach(asset => {
            if (!categories[asset.category]) {
                categories[asset.category] = 0;
            }
            categories[asset.category] += parseFloat(asset.value);
        });
        
        return categories;
    }
    
    /**
     * Add a new liability to a specific year
     * @param {number} year - Year to add liability to
     * @param {string} category - Liability category
     * @param {number} value - Liability value
     * @returns {Object} Added liability
     */
    addLiability(year, category, value) {
        if (!this.data.years[year]) {
            this.addYear(year);
        }
        
        const liability = {
            id: this.generateId(),
            category,
            value,
            dateAdded: new Date().toISOString()
        };
        
        this.data.years[year].liabilities.push(liability);
        this.saveData();
        this.triggerEvent('liabilityAdded', { year, liability });
        return liability;
    }
    
    /**
     * Update an existing liability
     * @param {number} year - Year of the liability
     * @param {string} liabilityId - Liability ID
     * @param {Object} updates - Updates to apply
     * @returns {boolean} Success status
     */
    updateLiability(year, liabilityId, updates) {
        if (!this.data.years[year]) return false;
        
        const liabilityIndex = this.data.years[year].liabilities.findIndex(
            liability => liability.id === liabilityId
        );
        
        if (liabilityIndex === -1) return false;
        
        this.data.years[year].liabilities[liabilityIndex] = {
            ...this.data.years[year].liabilities[liabilityIndex],
            ...updates,
            lastModified: new Date().toISOString()
        };
        
        this.saveData();
        this.triggerEvent('liabilityUpdated', { 
            year, 
            liabilityId,
            liability: this.data.years[year].liabilities[liabilityIndex]
        });
        return true;
    }
    
    /**
     * Remove a liability
     * @param {number} year - Year of the liability
     * @param {string} liabilityId - Liability ID
     * @returns {boolean} Success status
     */
    removeLiability(year, liabilityId) {
        if (!this.data.years[year]) return false;
        
        const initialLength = this.data.years[year].liabilities.length;
        this.data.years[year].liabilities = this.data.years[year].liabilities.filter(
            liability => liability.id !== liabilityId
        );
        
        if (initialLength !== this.data.years[year].liabilities.length) {
            this.saveData();
            this.triggerEvent('liabilityRemoved', { year, liabilityId });
            return true;
        }
        
        return false;
    }
    
    /**
     * Get liabilities for a specific year
     * @param {number} year - Year to get liabilities for
     * @returns {Array} Liabilities
     */
    getLiabilities(year) {
        if (!this.data.years[year]) return [];
        return [...this.data.years[year].liabilities];
    }
    
    /**
     * Get total liabilities for a specific year
     * @param {number} year - Year to get total liabilities for
     * @returns {number} Total liabilities
     */
    getTotalLiabilities(year) {
        if (!this.data.years[year]) return 0;
        
        return this.data.years[year].liabilities.reduce((total, liability) => {
            return total + parseFloat(liability.value);
        }, 0);
    }
    
    /**
     * Get liabilities grouped by category for a specific year
     * @param {number} year - Year to get liabilities for
     * @returns {Object} Liabilities by category
     */
    getLiabilitiesByCategory(year) {
        if (!this.data.years[year]) return {};
        
        const categories = {};
        
        this.data.years[year].liabilities.forEach(liability => {
            if (!categories[liability.category]) {
                categories[liability.category] = 0;
            }
            categories[liability.category] += parseFloat(liability.value);
        });
        
        return categories;
    }
    
    /**
     * Calculate net worth for a specific year
     * @param {number} year - Year to calculate net worth for
     * @returns {number} Net worth
     */
    getNetWorth(year) {
        const totalAssets = this.getTotalAssets(year);
        const totalLiabilities = this.getTotalLiabilities(year);
        
        return totalAssets - totalLiabilities;
    }
    
    /**
     * Get debt-to-asset ratio for a specific year
     * @param {number} year - Year to calculate ratio for
     * @returns {number} Debt-to-asset ratio
     */
    getDebtToAssetRatio(year) {
        const totalAssets = this.getTotalAssets(year);
        const totalLiabilities = this.getTotalLiabilities(year);
        
        if (totalAssets === 0) return 0;
        
        return (totalLiabilities / totalAssets) * 100;
    }
    
    /**
     * Get historical net worth data for all years
     * @returns {Array} Historical net worth data
     */
    getNetWorthHistory() {
        const years = this.getYears().sort((a, b) => a - b); // Sort ascending for charts
        
        return years.map(year => {
            return {
                year,
                netWorth: this.getNetWorth(year),
                assets: this.getTotalAssets(year),
                liabilities: this.getTotalLiabilities(year)
            };
        });
    }
    
    /**
     * Get year-over-year growth percentage data
     * @returns {Array} Growth percentage data
     */
    getGrowthPercentages() {
        const history = this.getNetWorthHistory();
        
        if (history.length <= 1) {
            return [];
        }
        
        return history.slice(1).map((current, index) => {
            const previous = history[index];
            const previousNetWorth = previous.netWorth;
            const currentNetWorth = current.netWorth;
            
            let growthPercentage = 0;
            
            if (previousNetWorth > 0) {
                growthPercentage = ((currentNetWorth - previousNetWorth) / Math.abs(previousNetWorth)) * 100;
            } else if (previousNetWorth < 0 && currentNetWorth >= 0) {
                // If previous was negative and current is positive or zero, show positive growth
                growthPercentage = 100;
            } else if (previousNetWorth < 0 && currentNetWorth < 0) {
                // If both are negative, calculate improvement percentage
                growthPercentage = ((Math.abs(previousNetWorth) - Math.abs(currentNetWorth)) / Math.abs(previousNetWorth)) * 100;
            } else if (previousNetWorth === 0 && currentNetWorth > 0) {
                // From zero to positive
                growthPercentage = 100;
            } else if (previousNetWorth === 0 && currentNetWorth < 0) {
                // From zero to negative
                growthPercentage = -100;
            }
            
            return {
                year: current.year,
                growthPercentage: parseFloat(growthPercentage.toFixed(2))
            };
        });
    }
    
    // Milestone methods
    
    /**
     * Add a new milestone
     * @param {number} amount - Milestone amount
     * @param {string} name - Milestone name
     * @returns {Object} Added milestone
     */
    addMilestone(amount, name) {
        const milestone = {
            id: this.generateId(),
            amount,
            name,
            achieved: false,
            dateAdded: new Date().toISOString()
        };
        
        this.data.milestones.push(milestone);
        this.updateMilestoneStatus();
        this.saveData();
        this.triggerEvent('milestoneAdded', { milestone });
        return milestone;
    }
    
    /**
     * Remove a milestone
     * @param {string} milestoneId - Milestone ID
     * @returns {boolean} Success status
     */
    removeMilestone(milestoneId) {
        const initialLength = this.data.milestones.length;
        this.data.milestones = this.data.milestones.filter(milestone => milestone.id !== milestoneId);
        
        if (initialLength !== this.data.milestones.length) {
            this.saveData();
            this.triggerEvent('milestoneRemoved', { milestoneId });
            return true;
        }
        
        return false;
    }

    /**
     * Get all milestones
     * @returns {Array} Milestones
     */
    getMilestones() {
        return [...this.data.milestones].sort((a, b) => a.amount - b.amount);
    }

    /**
     * Get a single milestone by ID
     * @param {string} milestoneId - Milestone ID
     * @returns {Object|null} The milestone or null if not found
     */
    getMilestone(milestoneId) {
        return this.data.milestones.find(m => m.id === milestoneId) || null;
    }

    /**
     * Update an existing milestone
     * @param {string} milestoneId - Milestone ID
     * @param {Object} updates - Updates to apply
     * @returns {boolean} Success status
     */
    updateMilestone(milestoneId, updates) {
        const index = this.data.milestones.findIndex(m => m.id === milestoneId);
        if (index === -1) return false;

        this.data.milestones[index] = {
            ...this.data.milestones[index],
            ...updates,
            lastModified: new Date().toISOString()
        };

        this.updateMilestoneStatus();
        this.saveData();
        this.triggerEvent('milestoneUpdated', {
            milestoneId,
            milestone: this.data.milestones[index]
        });
        return true;
    }
    
    /**
     * Update milestone achieved status based on current net worth
     */
    updateMilestoneStatus() {
        if (this.getYears().length === 0) return;
        
        const currentYear = Math.max(...this.getYears());
        const currentNetWorth = this.getNetWorth(currentYear);
        
        this.data.milestones.forEach(milestone => {
            const wasAchieved = milestone.achieved;
            milestone.achieved = currentNetWorth >= milestone.amount;
            
            // Trigger event if achievement status changed
            if (wasAchieved !== milestone.achieved && milestone.achieved) {
                this.triggerEvent('milestoneAchieved', { 
                    milestone,
                    currentNetWorth 
                });
            }
        });
        
        this.saveData();
    }
    
    // Salary tracking methods
    
    /**
     * Add a new salary entry
     * @param {Date} date - Date of salary
     * @param {string} company - Company name
     * @param {string} title - Job title
     * @param {number} amount - Salary amount
     * @returns {Object} Added salary entry
     */
    addSalaryEntry(date, company, title, amount) {
        const newEntry = {
            id: this.generateId(),
            date: date.toISOString(),
            company,
            title,
            amount,
            dateAdded: new Date().toISOString()
        };
        
        // Add to salary history
        this.data.salaryHistory.push(newEntry);
        
        // Sort entries by date (most recent first)
        this.data.salaryHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Calculate increase percentage for each entry
        this.recalculateSalaryPercentages();
        
        this.saveData();
        this.triggerEvent('salaryEntryAdded', { salaryEntry: newEntry });
        return newEntry;
    }
    
    /**
     * Recalculate salary increase percentages
     */
    recalculateSalaryPercentages() {
        // Entries should already be sorted newest to oldest
        for (let i = 0; i < this.data.salaryHistory.length; i++) {
            // First (newest) entry has no increase
            if (i === 0 && this.data.salaryHistory.length > 1) {
                const currentSalary = this.data.salaryHistory[i].amount;
                const previousSalary = this.data.salaryHistory[i + 1].amount;
                this.data.salaryHistory[i].increasePercent = 
                    ((currentSalary - previousSalary) / previousSalary) * 100;
            }
            // For subsequent entries, calculate % from the previous (newer) entry
            else if (i > 0) {
                this.data.salaryHistory[i].increasePercent = 0;
            }
        }
    }
    
    /**
     * Update an existing salary entry
     * @param {string} entryId - Entry ID
     * @param {Object} updates - Updates to apply
     * @returns {boolean} Success status
     */
    updateSalaryEntry(entryId, updates) {
        const entryIndex = this.data.salaryHistory.findIndex(entry => entry.id === entryId);
        if (entryIndex === -1) return false;
        
        // Update entry with new data
        this.data.salaryHistory[entryIndex] = {
            ...this.data.salaryHistory[entryIndex],
            ...updates,
            lastModified: new Date().toISOString()
        };
        
        // Re-sort and recalculate
        this.data.salaryHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.recalculateSalaryPercentages();
        
        this.saveData();
        this.triggerEvent('salaryEntryUpdated', { 
            entryId,
            salaryEntry: this.data.salaryHistory[entryIndex]
        });
        return true;
    }
    
    /**
     * Remove a salary entry
     * @param {string} entryId - Entry ID
     * @returns {boolean} Success status
     */
    removeSalaryEntry(entryId) {
        const initialLength = this.data.salaryHistory.length;
        this.data.salaryHistory = this.data.salaryHistory.filter(entry => entry.id !== entryId);
        
        if (initialLength !== this.data.salaryHistory.length) {
            // Recalculate percentages if entries remain
            if (this.data.salaryHistory.length > 0) {
                this.recalculateSalaryPercentages();
            }
            
            this.saveData();
            this.triggerEvent('salaryEntryRemoved', { entryId });
            return true;
        }
        
        return false;
    }

    /**
     * Get all salary entries
     * @returns {Array} Salary entries
     */
    getSalaryHistory() {
        return [...this.data.salaryHistory];
    }

    /**
     * Get a single salary entry by ID
     * @param {string} entryId - Entry ID
     * @returns {Object|null} The salary entry or null if not found
     */
    getSalaryEntry(entryId) {
        return this.data.salaryHistory.find(entry => entry.id === entryId) || null;
    }
    
    /**
     * Get formatted data for the salary chart
     * @returns {Object} Chart data
     */
    getSalaryChartData() {
        // Sort by date (oldest first for the chart)
        const sortedEntries = [...this.data.salaryHistory]
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return {
            labels: sortedEntries.map(entry => {
                const date = new Date(entry.date);
                return `${date.getMonth() + 1}/${date.getFullYear()}`;
            }),
            data: sortedEntries.map(entry => entry.amount)
        };
    }

    // Savings tracking methods

    /**
     * Add a new saving entry
     * @param {number} year - Year of the saving
     * @param {Date|string} date - Date of saving
     * @param {number} amount - Amount saved
     * @param {string} category - Saving category
     * @param {string} [notes] - Optional notes
     * @returns {Object} Added entry
     */
    addSavingEntry(year, date, amount, category, notes = '') {
        if (!this.data.years[year]) {
            this.addYear(year);
        }

        if (!this.data.years[year].savings) {
            this.data.years[year].savings = [];
        }

        const entry = {
            id: this.generateId(),
            date: (date instanceof Date ? date : new Date(date)).toISOString(),
            amount: parseFloat(amount),
            category,
            notes,
            dateAdded: new Date().toISOString()
        };

        this.data.years[year].savings.push(entry);
        this.saveData();
        this.triggerEvent('savingEntryAdded', { year, savingEntry: entry });
        return entry;
    }

    /**
     * Update an existing saving entry
     * @param {number} year - Year of the entry
     * @param {string} entryId - Entry ID
     * @param {Object} updates - Updates to apply
     * @returns {boolean} Success status
     */
    updateSavingEntry(year, entryId, updates) {
        if (!this.data.years[year] || !this.data.years[year].savings) return false;

        const index = this.data.years[year].savings.findIndex(e => e.id === entryId);
        if (index === -1) return false;

        this.data.years[year].savings[index] = {
            ...this.data.years[year].savings[index],
            ...updates,
            lastModified: new Date().toISOString()
        };

        this.saveData();
        this.triggerEvent('savingEntryUpdated', {
            year,
            entryId,
            savingEntry: this.data.years[year].savings[index]
        });
        return true;
    }

    /**
     * Remove a saving entry
     * @param {number} year - Year of the entry
     * @param {string} entryId - Entry ID
     * @returns {boolean} Success status
     */
    removeSavingEntry(year, entryId) {
        if (!this.data.years[year] || !this.data.years[year].savings) return false;

        const initialLength = this.data.years[year].savings.length;
        this.data.years[year].savings = this.data.years[year].savings.filter(e => e.id !== entryId);

        if (initialLength !== this.data.years[year].savings.length) {
            this.saveData();
            this.triggerEvent('savingEntryRemoved', { year, entryId });
            return true;
        }

        return false;
    }

    /**
     * Get all savings for a year
     * @param {number} year - Year to fetch
     * @returns {Array} Savings entries
     */
    getSavings(year) {
        if (!this.data.years[year] || !this.data.years[year].savings) return [];
        return [...this.data.years[year].savings];
    }

    /**
     * Get total savings for a year
     * @param {number} year - Year
     * @returns {number} Total saved
     */
    getTotalSavings(year) {
        return this.getSavings(year).reduce((sum, e) => sum + parseFloat(e.amount), 0);
    }

    /**
     * Get savings grouped by category
     * @param {number} year - Year
     * @returns {Object} Totals by category
     */
    getSavingsByCategory(year) {
        const categories = {};
        this.getSavings(year).forEach(entry => {
            if (!categories[entry.category]) categories[entry.category] = 0;
            categories[entry.category] += parseFloat(entry.amount);
        });
        return categories;
    }

    /**
     * Get data for savings timeline chart
     * @param {number} year - Year
     * @returns {Object} Chart data
     */
    getSavingsChartData(year) {
        const sorted = [...this.getSavings(year)].sort((a, b) => new Date(a.date) - new Date(b.date));
        return {
            labels: sorted.map(e => {
                const d = new Date(e.date);
                return `${d.getMonth() + 1}/${d.getFullYear()}`;
            }),
            data: sorted.map(e => e.amount)
        };
    }

    /**
     * Calculate average monthly savings
     * @param {number} year - Year
     * @returns {number} Average amount
     */
    getMonthlySavingsAverage(year) {
        const monthly = {};
        this.getSavings(year).forEach(e => {
            const d = new Date(e.date);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (!monthly[key]) monthly[key] = 0;
            monthly[key] += parseFloat(e.amount);
        });
        const months = Object.keys(monthly).length;
        if (months === 0) return 0;
        return Object.values(monthly).reduce((a, b) => a + b, 0) / months;
    }

    /**
     * Get total salary for a given year
     * @param {number} year - Year
     * @returns {number} Total salary
     */
    getTotalSalaryForYear(year) {
        return this.data.salaryHistory
            .filter(entry => new Date(entry.date).getFullYear() === parseInt(year))
            .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
    }

    /**
     * Calculate savings rate for a year
     * @param {number} year - Year
     * @returns {number} Savings rate percentage
     */
    getSavingsRate(year) {
        const totalSalary = this.getTotalSalaryForYear(year);
        if (totalSalary === 0) return 0;
        return (this.getTotalSavings(year) / totalSalary) * 100;
    }

    /**
     * Get all savings across years
     * @returns {Array} All saving entries
     */
    getAllSavings() {
        return Object.values(this.data.years).flatMap(y => y.savings || []);
    }

    /**
     * Get total monthly savings average for recent months
     * @param {number} months - Number of months to average
     * @returns {number} Monthly savings average
     */
    getTotalMonthlySavings(months = 3) {
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - months);
        const recent = this.getAllSavings().filter(e => new Date(e.date) >= cutoff);
        if (recent.length === 0) return 0;
        const total = recent.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        return total / Math.min(months, recent.length);
    }

    /**
     * Set emergency fund goal in months
     * @param {number} months - Number of months
     */
    setEmergencyFundGoal(months) {
        this.data.emergencyFundGoal = parseInt(months, 10);
        this.saveData();
    }

    /**
     * Get emergency fund goal in months
     * @returns {number} Goal months
     */
    getEmergencyFundGoal() {
        return this.data.emergencyFundGoal;
    }

    /**
     * Get emergency fund progress percentage
     * @returns {number} Progress percent
     */
    getEmergencyFundProgress() {
        const latestSalary = [...this.data.salaryHistory]
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (!latestSalary) return 0;
        const monthlyIncome = latestSalary.amount / 12;
        const target = monthlyIncome * this.getEmergencyFundGoal();
        if (target === 0) return 0;
        const totalEmergency = this.getAllSavings()
            .filter(e => e.category === 'Emergency Fund')
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);
        return (totalEmergency / target) * 100;
    }

    /**
     * Calculate savings percentage including pension contributions
     * @param {number} personalContributionPercent - Personal pension percent
     * @param {number} employerContributionPercent - Employer pension percent
     * @returns {number} Savings rate percentage
     */
    calculateSavingsPercentage(personalContributionPercent, employerContributionPercent) {
        const sortedSalaries = [...this.data.salaryHistory]
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        if (sortedSalaries.length === 0) {
            return 0;
        }
        const recentSalary = sortedSalaries[0].amount;
        const totalMonthlySavings = this.getTotalMonthlySavings();
        const personal = (recentSalary / 12) * (personalContributionPercent / 100);
        const employer = (recentSalary / 12) * (employerContributionPercent / 100);
        const totalMonthlyIncome = recentSalary / 12;
        const totalSavings = totalMonthlySavings + personal + employer;
        if (totalMonthlyIncome === 0) return 0;
        return (totalSavings / totalMonthlyIncome) * 100;
    }
    
    // Utils
    
    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    /**
     * Import data from JSON
     * @param {string} jsonData - JSON data to import
     * @returns {boolean} Success status
     */
    importData(jsonData) {
        try {
            const parsedData = JSON.parse(jsonData);
            
            // Basic validation
            if (!parsedData.years) {
                throw new Error('Invalid data format: missing years property');
            }
            
            // Add backward compatibility
            if (!parsedData.salaryHistory) {
                parsedData.salaryHistory = [];
            }
            if (!parsedData.savingsHistory) {
                parsedData.savingsHistory = [];
            }
            if (parsedData.emergencyFundGoal === undefined) {
                parsedData.emergencyFundGoal = 3;
            }
            
            // Update data
            this.data = parsedData;
            this.saveData();
            this.triggerEvent('dataImported', { success: true });
            return true;
        } catch (error) {
            this.triggerEvent('dataImported', { 
                success: false,
                error: error.message 
            });
            throw error;
        }
    }
    
    /**
     * Export data as JSON
     * @returns {string} JSON data
     */
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }
}

// Create a singleton instance
let dataStoreInstance = null;

/**
 * Get the DataStore instance (singleton)
 * @param {Object} storage - Storage interface (defaults to localStorage)
 * @returns {DataStore} DataStore instance
 */
export function getDataStore(storage = localStorage) {
    if (!dataStoreInstance) {
        dataStoreInstance = new DataStore(storage);
        dataStoreInstance.loadData();
    }
    return dataStoreInstance;
}

// Export simplified function interface for backward compatibility

/**
 * Get current data from localStorage
 * @returns {Object} The parsed data or empty object if not found
 */
export function getCurrentData() {
    return getDataStore().data;
}

/**
 * Save data to localStorage
 * @param {Object} data - The data to save
 */
export function saveData(data) {
    const dataStore = getDataStore();
    dataStore.data = data;
    dataStore.saveData();
}

/**
 * Import data from JSON string
 * @param {string} jsonData - The JSON data to import
 * @returns {boolean} Success status
 */
export function importData(jsonData) {
    return getDataStore().importData(jsonData);
}

/**
 * Export data as JSON string
 * @returns {string} Formatted JSON data
 */
export function exportData() {
    return getDataStore().exportData();
}

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
export function generateId() {
    return getDataStore().generateId();
}