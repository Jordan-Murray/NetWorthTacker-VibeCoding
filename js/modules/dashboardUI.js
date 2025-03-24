/**
 * Dashboard UI Module
 * Handles the dashboard UI and summary display
 */
import { getCurrentData } from './dataService.js';
import { formatCurrency, calculatePercentChange } from './utils.js';

/**
 * Update the dashboard summary with the latest data
 */
export function updateDashboardSummary() {
    const data = getCurrentData();
    if (!data.years) return;
    
    // Get the current selected year
    const yearSelect = document.getElementById('year-select');
    const currentYear = yearSelect ? yearSelect.value : null;
    
    if (!currentYear || !data.years[currentYear]) return;
    
    // Get all years sorted chronologically
    const years = Object.keys(data.years).sort();
    
    // Find the index of the current year and previous year (if any)
    const currentYearIndex = years.indexOf(currentYear);
    const hasPreviousYear = currentYearIndex > 0;
    const previousYear = hasPreviousYear ? years[currentYearIndex - 1] : null;
    
    // Calculate current net worth, assets, and liabilities
    const netWorth = calculateNetWorth(data.years[currentYear]);
    const totalAssets = calculateTotalAssets(data.years[currentYear]);
    const totalLiabilities = calculateTotalLiabilities(data.years[currentYear]);
    
    // Calculate previous net worth for comparison
    let previousNetWorth = 0;
    if (previousYear && data.years[previousYear]) {
        previousNetWorth = calculateNetWorth(data.years[previousYear]);
    }
    
    // Calculate debt-to-asset ratio
    const debtAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    
    // Update UI
    updateNetWorthDisplay(netWorth, previousNetWorth);
    updateAssetsDisplay(totalAssets);
    updateLiabilitiesDisplay(totalLiabilities);
    updateDebtRatioDisplay(debtAssetRatio);
}

/**
 * Calculate net worth based on year data
 * @param {Object} yearData - Data for a specific year
 * @returns {number} - The calculated net worth
 */
function calculateNetWorth(yearData) {
    if (!yearData) return 0;
    
    const totalAssets = calculateTotalAssets(yearData);
    const totalLiabilities = calculateTotalLiabilities(yearData);
    
    return totalAssets - totalLiabilities;
}

/**
 * Calculate total assets based on year data
 * @param {Object} yearData - Data for a specific year
 * @returns {number} - The total assets value
 */
function calculateTotalAssets(yearData) {
    if (!yearData || !yearData.assets) return 0;
    
    return yearData.assets.reduce((total, asset) => total + parseFloat(asset.value || 0), 0);
}

/**
 * Calculate total liabilities based on year data
 * @param {Object} yearData - Data for a specific year
 * @returns {number} - The total liabilities value
 */
function calculateTotalLiabilities(yearData) {
    if (!yearData || !yearData.liabilities) return 0;
    
    return yearData.liabilities.reduce((total, liability) => total + parseFloat(liability.value || 0), 0);
}

/**
 * Update the net worth display
 * @param {number} netWorth - Current net worth
 * @param {number} previousNetWorth - Previous net worth for comparison
 */
function updateNetWorthDisplay(netWorth, previousNetWorth) {
    const netWorthElement = document.getElementById('current-net-worth');
    const netWorthChangeElement = document.getElementById('net-worth-change');
    
    if (netWorthElement) {
        netWorthElement.textContent = formatCurrency(netWorth);
    }
    
    if (netWorthChangeElement && previousNetWorth !== 0) {
        const percentChange = calculatePercentChange(previousNetWorth, netWorth);
        
        netWorthChangeElement.textContent = `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}% from last year`;
        netWorthChangeElement.className = 'change ' + (percentChange >= 0 ? 'positive' : 'negative');
    } else if (netWorthChangeElement) {
        netWorthChangeElement.textContent = 'No previous year data';
        netWorthChangeElement.className = 'change';
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