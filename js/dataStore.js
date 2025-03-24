/**
 * Data Store Module
 * Handles all data operations and localStorage persistence
 */
export class DataStore {
    constructor() {
        this.data = {
            years: {},
            milestones: [],
            salaryHistory: [],
            savingsHistory: [],
            emergencyFundGoal: 3 // Default to 3 months
        };
    }
    
    /**
     * Load data from localStorage
     */
    loadData() {
        const savedData = localStorage.getItem('netWorthData');
        if (savedData) {
            try {
                this.data = JSON.parse(savedData);
                // Add savingsHistory array if it doesn't exist (backward compatibility)
                if (!this.data.savingsHistory) {
                    this.data.savingsHistory = [];
                }
                // Add emergencyFundGoal if it doesn't exist (backward compatibility)
                if (this.data.emergencyFundGoal === undefined) {
                    this.data.emergencyFundGoal = 3;
                }
            } catch (e) {
                this.initializeDefaultData();
            }
        } else {
            this.initializeDefaultData();
        }
    }
    
    /**
     * Save data to localStorage
     */
    saveData() {
        localStorage.setItem('netWorthData', JSON.stringify(this.data));
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
                { amount: 10000, name: "First £10K" },
                { amount: 50000, name: "£50K Milestone" },
                { amount: 100000, name: "Six Figure Club" }
            ],
            salaryHistory: [],
            savingsHistory: [],
            emergencyFundGoal: 3
        };
        this.saveData();
    }
    
    /**
     * Add a new year to track
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
        return true;
    }
    
    /**
     * Get sorted list of years
     */
    getYears() {
        return Object.keys(this.data.years)
            .map(year => parseInt(year, 10))
            .sort((a, b) => b - a); // Sort descending (newest first)
    }
    
    /**
     * Add a new asset to a specific year
     */
    addAsset(year, category, name, value) {
        if (!this.data.years[year]) {
            this.addYear(year);
        }
        
        const asset = {
            id: this.generateId(),
            category,
            name,
            value
        };
        
        this.data.years[year].assets.push(asset);
        this.saveData();
        return asset;
    }
    
    /**
     * Update an existing asset
     */
    updateAsset(year, assetId, updates) {
        if (!this.data.years[year]) return false;
        
        const assetIndex = this.data.years[year].assets.findIndex(asset => asset.id === assetId);
        if (assetIndex === -1) return false;
        
        this.data.years[year].assets[assetIndex] = {
            ...this.data.years[year].assets[assetIndex],
            ...updates
        };
        
        this.saveData();
        return true;
    }
    
    /**
     * Remove an asset
     */
    removeAsset(year, assetId) {
        if (!this.data.years[year]) return false;
        
        const initialLength = this.data.years[year].assets.length;
        this.data.years[year].assets = this.data.years[year].assets.filter(asset => asset.id !== assetId);
        
        if (initialLength !== this.data.years[year].assets.length) {
            this.saveData();
            return true;
        }
        
        return false;
    }
    
    /**
     * Get assets for a specific year
     */
    getAssets(year) {
        if (!this.data.years[year]) return [];
        return [...this.data.years[year].assets];
    }
    
    /**
     * Get total assets for a specific year
     */
    getTotalAssets(year) {
        if (!this.data.years[year]) return 0;
        
        return this.data.years[year].assets.reduce((total, asset) => {
            return total + asset.value;
        }, 0);
    }
    
    /**
     * Get assets grouped by category for a specific year
     */
    getAssetsByCategory(year) {
        if (!this.data.years[year]) return {};
        
        const categories = {};
        
        this.data.years[year].assets.forEach(asset => {
            if (!categories[asset.category]) {
                categories[asset.category] = 0;
            }
            categories[asset.category] += asset.value;
        });
        
        return categories;
    }
    
    /**
     * Add a new liability to a specific year
     */
    addLiability(year, category, value) {
        if (!this.data.years[year]) {
            this.addYear(year);
        }
        
        const liability = {
            id: this.generateId(),
            category,
            value
        };
        
        this.data.years[year].liabilities.push(liability);
        this.saveData();
        return liability;
    }
    
    /**
     * Update an existing liability
     */
    updateLiability(year, liabilityId, updates) {
        if (!this.data.years[year]) return false;
        
        const liabilityIndex = this.data.years[year].liabilities.findIndex(liability => liability.id === liabilityId);
        if (liabilityIndex === -1) return false;
        
        this.data.years[year].liabilities[liabilityIndex] = {
            ...this.data.years[year].liabilities[liabilityIndex],
            ...updates
        };
        
        this.saveData();
        return true;
    }
    
    /**
     * Remove a liability
     */
    removeLiability(year, liabilityId) {
        if (!this.data.years[year]) return false;
        
        const initialLength = this.data.years[year].liabilities.length;
        this.data.years[year].liabilities = this.data.years[year].liabilities.filter(liability => liability.id !== liabilityId);
        
        if (initialLength !== this.data.years[year].liabilities.length) {
            this.saveData();
            return true;
        }
        
        return false;
    }
    
    /**
     * Get liabilities for a specific year
     */
    getLiabilities(year) {
        if (!this.data.years[year]) return [];
        return [...this.data.years[year].liabilities];
    }
    
    /**
     * Get total liabilities for a specific year
     */
    getTotalLiabilities(year) {
        if (!this.data.years[year]) return 0;
        
        return this.data.years[year].liabilities.reduce((total, liability) => {
            return total + liability.value;
        }, 0);
    }
    
    /**
     * Get liabilities grouped by category for a specific year
     */
    getLiabilitiesByCategory(year) {
        if (!this.data.years[year]) return {};
        
        const categories = {};
        
        this.data.years[year].liabilities.forEach(liability => {
            if (!categories[liability.category]) {
                categories[liability.category] = 0;
            }
            categories[liability.category] += liability.value;
        });
        
        return categories;
    }
    
    /**
     * Calculate net worth for a specific year
     */
    getNetWorth(year) {
        const totalAssets = this.getTotalAssets(year);
        const totalLiabilities = this.getTotalLiabilities(year);
        
        return totalAssets - totalLiabilities;
    }
    
    /**
     * Get debt-to-asset ratio for a specific year
     */
    getDebtToAssetRatio(year) {
        const totalAssets = this.getTotalAssets(year);
        const totalLiabilities = this.getTotalLiabilities(year);
        
        if (totalAssets === 0) return 0;
        
        return (totalLiabilities / totalAssets) * 100;
    }
    
    /**
     * Get historical net worth data for all years
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
    
    /**
     * Add a new milestone
     */
    addMilestone(amount, name) {
        const milestone = {
            id: this.generateId(),
            amount,
            name,
            achieved: false
        };
        
        this.data.milestones.push(milestone);
        this.updateMilestoneStatus();
        this.saveData();
        return milestone;
    }
    
    /**
     * Remove a milestone
     */
    removeMilestone(milestoneId) {
        const initialLength = this.data.milestones.length;
        this.data.milestones = this.data.milestones.filter(milestone => milestone.id !== milestoneId);
        
        if (initialLength !== this.data.milestones.length) {
            this.saveData();
            return true;
        }
        
        return false;
    }
    
    /**
     * Get all milestones
     */
    getMilestones() {
        return [...this.data.milestones].sort((a, b) => a.amount - b.amount);
    }
    
    /**
     * Update milestone achieved status based on current net worth
     */
    updateMilestoneStatus() {
        const currentYear = Math.max(...this.getYears());
        const currentNetWorth = this.getNetWorth(currentYear);
        
        this.data.milestones.forEach(milestone => {
            milestone.achieved = currentNetWorth >= milestone.amount;
        });
        
        this.saveData();
    }
    
    /**
     * Generate a unique ID
     */
    generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    /**
     * Add a new salary entry to the history
     */
    addSalaryEntry(date, company, amount) {
        const newEntry = {
            id: this.generateId(),
            date,
            company,
            amount,
            increasePercent: 0 // Will be calculated
        };
        
        // Sort entries by date (most recent first)
        let sortedEntries = [...this.data.salaryHistory, newEntry]
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Calculate increase percentage if not the first entry
        if (sortedEntries.length > 1) {
            // Current entry is at index 0 (newest), previous is at index 1
            const previousSalary = sortedEntries[1].amount;
            sortedEntries[0].increasePercent = ((sortedEntries[0].amount - previousSalary) / previousSalary) * 100;
        }
        
        // Update all entries with recalculated percentages
        this.data.salaryHistory = sortedEntries;
        this.saveData();
        return newEntry;
    }
    
    /**
     * Update an existing salary entry
     */
    updateSalaryEntry(entryId, updates) {
        const entryIndex = this.data.salaryHistory.findIndex(entry => entry.id === entryId);
        if (entryIndex === -1) return false;
        
        // Update entry with new data
        this.data.salaryHistory[entryIndex] = {
            ...this.data.salaryHistory[entryIndex],
            ...updates
        };
        
        // Sort entries again by date
        this.data.salaryHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Recalculate all increase percentages
        for (let i = 0; i < this.data.salaryHistory.length; i++) {
            if (i === this.data.salaryHistory.length - 1) {
                // First (oldest) entry has no previous to compare to
                this.data.salaryHistory[i].increasePercent = 0;
            } else {
                const currentSalary = this.data.salaryHistory[i].amount;
                const previousSalary = this.data.salaryHistory[i + 1].amount;
                this.data.salaryHistory[i].increasePercent = ((currentSalary - previousSalary) / previousSalary) * 100;
            }
        }
        
        this.saveData();
        return true;
    }
    
    /**
     * Remove a salary entry
     */
    removeSalaryEntry(entryId) {
        const initialLength = this.data.salaryHistory.length;
        this.data.salaryHistory = this.data.salaryHistory.filter(entry => entry.id !== entryId);
        
        if (initialLength !== this.data.salaryHistory.length) {
            // Recalculate all increase percentages if entries remain
            if (this.data.salaryHistory.length > 0) {
                // Ensure entries are sorted by date (newest first)
                this.data.salaryHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                for (let i = 0; i < this.data.salaryHistory.length; i++) {
                    if (i === this.data.salaryHistory.length - 1) {
                        // First (oldest) entry has no previous to compare to
                        this.data.salaryHistory[i].increasePercent = 0;
                    } else {
                        const currentSalary = this.data.salaryHistory[i].amount;
                        const previousSalary = this.data.salaryHistory[i + 1].amount;
                        this.data.salaryHistory[i].increasePercent = ((currentSalary - previousSalary) / previousSalary) * 100;
                    }
                }
            }
            
            this.saveData();
            return true;
        }
        
        return false;
    }
    
    /**
     * Get all salary entries
     */
    getSalaryHistory() {
        return [...this.data.salaryHistory];
    }
    
    /**
     * Get formatted data for the salary chart
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
    
    /**
     * Add a monthly savings entry
     */
    addSavingsEntry(date, amount, category, notes) {
        const newEntry = {
            id: this.generateId(),
            date,
            amount: parseFloat(amount),
            category,
            notes
        };
        
        this.data.savingsHistory.push(newEntry);
        
        // Sort entries by date (most recent first)
        this.data.savingsHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.saveData();
        return newEntry;
    }
    
    /**
     * Update an existing savings entry
     */
    updateSavingsEntry(entryId, updates) {
        const entryIndex = this.data.savingsHistory.findIndex(entry => entry.id === entryId);
        if (entryIndex === -1) return false;
        
        // Update entry with new data
        this.data.savingsHistory[entryIndex] = {
            ...this.data.savingsHistory[entryIndex],
            ...updates
        };
        
        // Re-sort entries by date (most recent first)
        this.data.savingsHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.saveData();
        return true;
    }
    
    /**
     * Remove a savings entry
     */
    removeSavingsEntry(entryId) {
        const initialLength = this.data.savingsHistory.length;
        this.data.savingsHistory = this.data.savingsHistory.filter(entry => entry.id !== entryId);
        
        if (initialLength !== this.data.savingsHistory.length) {
            this.saveData();
            return true;
        }
        
        return false;
    }
    
    /**
     * Get all savings entries
     */
    getSavingsHistory() {
        return [...this.data.savingsHistory];
    }
    
    /**
     * Get savings data grouped by category
     */
    getSavingsByCategory() {
        const categories = {};
        
        this.data.savingsHistory.forEach(entry => {
            if (!categories[entry.category]) {
                categories[entry.category] = 0;
            }
            categories[entry.category] += entry.amount;
        });
        
        return categories;
    }
    
    /**
     * Calculate savings percentage based on most recent salary
     */
    calculateSavingsPercentage(personalContributionPercent, employerContributionPercent) {
        // Get most recent salary
        const sortedSalaries = [...this.data.salaryHistory]
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (sortedSalaries.length === 0) {
            return 0;
        }
        
        const recentSalary = sortedSalaries[0].amount;
        
        // Get total monthly savings
        const totalMonthlySavings = this.getTotalMonthlySavings();
        
        // Calculate pension contributions
        const personalPensionContribution = (recentSalary / 12) * (personalContributionPercent / 100);
        const employerPensionContribution = (recentSalary / 12) * (employerContributionPercent / 100);
        
        // Calculate total savings percentage
        const totalMonthlyIncome = recentSalary / 12;
        const totalSavings = totalMonthlySavings + personalPensionContribution + employerPensionContribution;
        
        return (totalSavings / totalMonthlyIncome) * 100;
    }
    
    /**
     * Get total monthly savings average
     */
    getTotalMonthlySavings() {
        // Get entries from the last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const recentEntries = this.data.savingsHistory.filter(entry => 
            new Date(entry.date) >= threeMonthsAgo
        );
        
        if (recentEntries.length === 0) {
            return 0;
        }
        
        // Calculate the total
        const total = recentEntries.reduce((sum, entry) => sum + entry.amount, 0);
        
        // Return monthly average
        return total / Math.min(3, recentEntries.length);
    }
    
    /**
     * Set emergency fund goal (in months)
     */
    setEmergencyFundGoal(months) {
        this.data.emergencyFundGoal = months;
        this.saveData();
    }
    
    /**
     * Get emergency fund goal (in months)
     */
    getEmergencyFundGoal() {
        return this.data.emergencyFundGoal;
    }
} 