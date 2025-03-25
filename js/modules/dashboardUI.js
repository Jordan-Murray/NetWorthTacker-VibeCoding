/**
 * Dashboard UI Module
 * Handles the dashboard UI and summary display
 */
import { getDataStore } from './enhancedDataService.js';
import { formatCurrency, calculatePercentChange } from './utils.js';

/**
 * Initialize the dashboard UI
 */
export function initDashboard() {
    // Initial render
    updateDashboardSummary();
    
    // Set up event listeners
    const dataStore = getDataStore();
    dataStore.addEventListener('dataUpdated', updateDashboardSummary);
    dataStore.addEventListener('yearChanged', updateDashboardSummary);
    
    // Export for global access (backward compatibility)
    window.refreshDashboard = updateDashboardSummary;
}

/**
 * Update the dashboard summary with the latest data
 */
export function updateDashboardSummary() {
    const dataStore = getDataStore();
    const years = dataStore.getYears();
    
    if (years.length === 0) return;
    
    // Get the current selected year
    const yearSelect = document.getElementById('year-select');
    const currentYear = yearSelect ? yearSelect.value : years[0];
    
    if (!currentYear) return;
    
    // Find the index of the current year and previous year (if any)
    const sortedYears = [...years].sort();
    const currentYearIndex = sortedYears.indexOf(parseInt(currentYear));
    const hasPreviousYear = currentYearIndex > 0;
    const previousYear = hasPreviousYear ? sortedYears[currentYearIndex - 1] : null;
    
    // Calculate current net worth, assets, and liabilities
    const netWorth = dataStore.getNetWorth(currentYear);
    const totalAssets = dataStore.getTotalAssets(currentYear);
    const totalLiabilities = dataStore.getTotalLiabilities(currentYear);
    
    // Calculate previous net worth for comparison
    let previousNetWorth = 0;
    if (previousYear) {
        previousNetWorth = dataStore.getNetWorth(previousYear);
    }
    
    // Calculate debt-to-asset ratio
    const debtAssetRatio = dataStore.getDebtToAssetRatio(currentYear);
    
    // Update UI
    updateNetWorthDisplay(netWorth, previousNetWorth, previousYear);
    updateAssetsDisplay(totalAssets);
    updateLiabilitiesDisplay(totalLiabilities);
    updateDebtRatioDisplay(debtAssetRatio);
}

/**
 * Update the net worth display
 * @param {number} netWorth - Current net worth
 * @param {number} previousNetWorth - Previous net worth for comparison
 * @param {number|null} previousYear - Previous year (if any)
 */
function updateNetWorthDisplay(netWorth, previousNetWorth, previousYear) {
    const netWorthElement = document.getElementById('current-net-worth');
    const netWorthChangeElement = document.getElementById('net-worth-change');
    
    if (netWorthElement) {
        netWorthElement.textContent = formatCurrency(netWorth);
    }
    
    if (netWorthChangeElement) {
        if (previousNetWorth !== 0 && previousYear !== null) {
            const percentChange = calculatePercentChange(previousNetWorth, netWorth);
            
            netWorthChangeElement.textContent = `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}% from ${previousYear}`;
            
            // Add class for styling
            if (percentChange >= 0) {
                netWorthChangeElement.classList.add('positive-change');
                netWorthChangeElement.classList.remove('negative-change');
            } else {
                netWorthChangeElement.classList.add('negative-change');
                netWorthChangeElement.classList.remove('positive-change');
            }
        } else {
            netWorthChangeElement.textContent = 'No previous year data';
            netWorthChangeElement.classList.remove('positive-change', 'negative-change');
        }
    }
}

/**
 * Update the assets display
 * @param {number} totalAssets - Total assets value
 */
function updateAssetsDisplay(totalAssets) {
    const assetsElement = document.getElementById('total-assets');
    
    if (assetsElement) {
        assetsElement.textContent = formatCurrency(totalAssets);
    }
}

/**
 * Update the liabilities display
 * @param {number} totalLiabilities - Total liabilities value
 */
function updateLiabilitiesDisplay(totalLiabilities) {
    const liabilitiesElement = document.getElementById('total-liabilities');
    
    if (liabilitiesElement) {
        liabilitiesElement.textContent = formatCurrency(totalLiabilities);
    }
}

/**
 * Update the debt-to-asset ratio display
 * @param {number} ratio - Debt-to-asset ratio percentage
 */
function updateDebtRatioDisplay(ratio) {
    const ratioElement = document.getElementById('debt-asset-ratio');
    const ratioBarElement = document.getElementById('debt-ratio-bar');
    
    if (ratioElement) {
        ratioElement.textContent = `${ratio.toFixed(1)}%`;
    }
    
    if (ratioBarElement) {
        // Limit width to 100%
        const barWidth = Math.min(ratio, 100);
        ratioBarElement.style.width = `${barWidth}%`;
        
        // Set color based on ratio
        if (ratio < 30) {
            ratioBarElement.style.backgroundColor = '#4caf50'; // Green - healthy
        } else if (ratio < 60) {
            ratioBarElement.style.backgroundColor = '#ff9800'; // Orange - warning
        } else {
            ratioBarElement.style.backgroundColor = '#f44336'; // Red - danger
        }
    }
}