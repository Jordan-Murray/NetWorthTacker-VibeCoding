/**
 * Dashboard UI Module
 * Handles the dashboard UI, summary display, and charts
 */
import { getDataService } from './dataService.js';
import { Chart } from 'chart.js/auto';

// Utility functions
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

function calculatePercentChange(oldValue, newValue) {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

// Chart instances
let netWorthChart = null;
let assetsLiabilitiesChart = null;

export function initDashboard() {
    const dataService = getDataService();
    
    // Set up event listeners
    dataService.on('dataChanged', updateDashboard);
    
    // Initialize UI components
    initializeCharts();
    updateDashboard();
    
    // Set up year selector
    const yearSelect = document.getElementById('year-select');
    if (yearSelect) {
        yearSelect.addEventListener('change', updateDashboard);
        updateYearSelector();
    }
}

function updateYearSelector() {
    const dataService = getDataService();
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect) return;
    
    const years = dataService.getYears();
    const currentYear = new Date().getFullYear();
    
    // Clear existing options
    yearSelect.innerHTML = '';
    
    // Add options for each year
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    });
}

function updateDashboard() {
    const dataService = getDataService();
    const years = dataService.getYears();
    
    if (years.length === 0) return;
    
    const yearSelect = document.getElementById('year-select');
    const selectedYear = yearSelect ? parseInt(yearSelect.value) : years[years.length - 1];
    
    updateSummary(selectedYear);
    updateCharts(selectedYear);
}

function updateSummary(year) {
    const dataService = getDataService();
    const years = dataService.getYears();
    const yearIndex = years.indexOf(year);
    const previousYear = yearIndex > 0 ? years[yearIndex - 1] : null;
    
    // Calculate current values
    const netWorth = dataService.getNetWorth(year);
    const totalAssets = dataService.getTotalAssets(year);
    const totalLiabilities = dataService.getTotalLiabilities(year);
    const debtRatio = dataService.getDebtToAssetRatio(year);
    
    // Calculate previous net worth for comparison
    const previousNetWorth = previousYear ? dataService.getNetWorth(previousYear) : 0;
    
    // Update UI elements
    updateNetWorthDisplay(netWorth, previousNetWorth, previousYear);
    updateAssetsDisplay(totalAssets);
    updateLiabilitiesDisplay(totalLiabilities);
    updateDebtRatioDisplay(debtRatio);
}

function updateNetWorthDisplay(netWorth, previousNetWorth, previousYear) {
    const netWorthElement = document.getElementById('current-net-worth');
    const netWorthChangeElement = document.getElementById('net-worth-change');
    
    if (netWorthElement) {
        netWorthElement.textContent = formatCurrency(netWorth);
    }
    
    if (netWorthChangeElement && previousYear) {
        const percentChange = calculatePercentChange(previousNetWorth, netWorth);
        netWorthChangeElement.textContent = `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}% from ${previousYear}`;
        netWorthChangeElement.className = percentChange >= 0 ? 'positive-change' : 'negative-change';
    }
}

function updateAssetsDisplay(totalAssets) {
    const element = document.getElementById('total-assets');
    if (element) {
        element.textContent = formatCurrency(totalAssets);
    }
}

function updateLiabilitiesDisplay(totalLiabilities) {
    const element = document.getElementById('total-liabilities');
    if (element) {
        element.textContent = formatCurrency(totalLiabilities);
    }
}

function updateDebtRatioDisplay(ratio) {
    const element = document.getElementById('debt-asset-ratio');
    const barElement = document.getElementById('debt-ratio-bar');
    
    if (element) {
        element.textContent = `${ratio.toFixed(1)}%`;
    }
    
    if (barElement) {
        const width = Math.min(ratio, 100);
        barElement.style.width = `${width}%`;
        barElement.style.backgroundColor = ratio < 30 ? '#4caf50' : ratio < 60 ? '#ff9800' : '#f44336';
    }
}

function initializeCharts() {
    initNetWorthChart();
    initAssetsLiabilitiesChart();
}

function initNetWorthChart() {
    const ctx = document.getElementById('net-worth-chart');
    if (!ctx) return;
    
    netWorthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Net Worth',
                data: [],
                borderColor: '#2196f3',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Net Worth Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatCurrency(value)
                    }
                }
            }
        }
    });
}

function initAssetsLiabilitiesChart() {
    const ctx = document.getElementById('assets-liabilities-chart');
    if (!ctx) return;
    
    assetsLiabilitiesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Assets',
                    data: [],
                    backgroundColor: '#4caf50'
                },
                {
                    label: 'Liabilities',
                    data: [],
                    backgroundColor: '#f44336'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Assets & Liabilities Breakdown'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatCurrency(value)
                    }
                }
            }
        }
    });
}

function updateCharts(selectedYear) {
    const dataService = getDataService();
    const years = dataService.getYears();
    
    // Update Net Worth Chart
    if (netWorthChart) {
        netWorthChart.data.labels = years;
        netWorthChart.data.datasets[0].data = years.map(year => dataService.getNetWorth(year));
        netWorthChart.update();
    }
    
    // Update Assets & Liabilities Chart
    if (assetsLiabilitiesChart) {
        const assets = dataService.getAssets(selectedYear);
        const liabilities = dataService.getLiabilities(selectedYear);
        
        const assetCategories = [...new Set(assets.map(a => a.category))];
        const liabilityCategories = [...new Set(liabilities.map(l => l.category))];
        const allCategories = [...new Set([...assetCategories, ...liabilityCategories])];
        
        assetsLiabilitiesChart.data.labels = allCategories;
        assetsLiabilitiesChart.data.datasets[0].data = allCategories.map(category => 
            assets.filter(a => a.category === category).reduce((sum, a) => sum + a.value, 0)
        );
        assetsLiabilitiesChart.data.datasets[1].data = allCategories.map(category =>
            liabilities.filter(l => l.category === category).reduce((sum, l) => sum + l.value, 0)
        );
        assetsLiabilitiesChart.update();
    }
}