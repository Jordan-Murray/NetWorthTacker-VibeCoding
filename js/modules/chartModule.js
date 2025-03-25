/**
 * Chart Module
 * Handles all chart creation and updates with improved testability
 */
import { getDataStore } from './enhancedDataService.js';
import { formatCurrency } from './utils.js';

// Store chart instances to allow reuse
const charts = {};

/**
 * Initialize all charts
 * @param {Object} chartLibrary - Chart library (defaults to Chart global)
 */
export function initCharts(chartLibrary = window.Chart) {
    if (!chartLibrary) {
        console.error('Chart library not available');
        return;
    }
    
    // Initialize dashboard charts
    initNetWorthChart(chartLibrary);
    initAssetDiversityChart(chartLibrary);
    
    // Initialize trends charts
    initNetWorthGrowthChart(chartLibrary);
    initAssetCategoriesTimeChart(chartLibrary);
    initGrowthVsBenchmarksChart(chartLibrary);
    
    // Initialize salary chart
    initSalaryGrowthChart(chartLibrary);
    
    // Set up chart update on data change
    document.addEventListener('dataUpdated', () => {
        renderDashboardCharts();
        renderTrendsCharts();
    });
    
    console.log('Charts initialized');
}

/**
 * Render all dashboard charts
 */
export function renderDashboardCharts() {
    updateNetWorthChart();
    updateAssetDiversityChart();
}

/**
 * Render all trends charts
 */
export function renderTrendsCharts() {
    updateNetWorthGrowthChart();
    updateAssetCategoriesTimeChart();
    updateGrowthVsBenchmarksChart();
}

/**
 * Initialize the Net Worth history chart
 * @param {Object} chartLibrary - Chart library
 */
function initNetWorthChart(chartLibrary = window.Chart) {
    const ctx = document.getElementById('net-worth-chart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (charts.netWorth) {
        charts.netWorth.destroy();
    }
    
    charts.netWorth = new chartLibrary(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Net Worth',
                    backgroundColor: 'rgba(58, 123, 213, 0.8)',
                    data: []
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update the Net Worth history chart with current data
 */
function updateNetWorthChart() {
    if (!charts.netWorth) return;
    
    const dataStore = getDataStore();
    const history = dataStore.getNetWorthHistory();
    
    // Sort by year ascending for chart
    history.sort((a, b) => a.year - b.year);
    
    const labels = history.map(item => item.year.toString());
    const netWorthData = history.map(item => item.netWorth);
    
    charts.netWorth.data.labels = labels;
    charts.netWorth.data.datasets[0].data = netWorthData;
    charts.netWorth.update();
}

/**
 * Initialize the Asset Diversity pie chart
 * @param {Object} chartLibrary - Chart library
 */
function initAssetDiversityChart(chartLibrary = window.Chart) {
    const ctx = document.getElementById('asset-diversity-chart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (charts.assetDiversity) {
        charts.assetDiversity.destroy();
    }
    
    charts.assetDiversity = new chartLibrary(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    'rgba(58, 123, 213, 0.7)',
                    'rgba(0, 209, 178, 0.7)',
                    'rgba(255, 221, 87, 0.7)',
                    'rgba(255, 56, 96, 0.7)',
                    'rgba(142, 68, 173, 0.7)',
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(46, 204, 113, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update the Asset Diversity pie chart with current data
 */
function updateAssetDiversityChart() {
    if (!charts.assetDiversity) return;
    
    const dataStore = getDataStore();
    const years = dataStore.getYears();
    if (years.length === 0) return;
    
    const currentYear = years[0]; // Most recent year
    const assetCategories = dataStore.getAssetsByCategory(currentYear);
    
    const labels = Object.keys(assetCategories);
    const data = Object.values(assetCategories);
    
    charts.assetDiversity.data.labels = labels;
    charts.assetDiversity.data.datasets[0].data = data;
    charts.assetDiversity.update();
}

/**
 * Initialize the Net Worth Growth chart
 * @param {Object} chartLibrary - Chart library
 */
function initNetWorthGrowthChart(chartLibrary = window.Chart) {
    const ctx = document.getElementById('net-worth-growth-chart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (charts.netWorthGrowth) {
        charts.netWorthGrowth.destroy();
    }
    
    charts.netWorthGrowth = new chartLibrary(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Net Worth',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    yAxisID: 'y',
                    fill: true,
                    tension: 0.1
                },
                {
                    label: 'Growth Rate (%)',
                    data: [],
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0)',
                    borderDash: [5, 5],
                    yAxisID: 'y1',
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                y1: {
                    position: 'right',
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.yAxisID === 'y') {
                                return formatCurrency(context.raw);
                            } else {
                                return context.raw.toFixed(1) + '%';
                            }
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update the Net Worth Growth chart with current data
 */
function updateNetWorthGrowthChart() {
    if (!charts.netWorthGrowth) return;
    
    const dataStore = getDataStore();
    const history = dataStore.getNetWorthHistory();
    if (history.length < 2) {
        // Not enough data for growth chart
        charts.netWorthGrowth.data.labels = ['Insufficient Data'];
        charts.netWorthGrowth.data.datasets[0].data = [0];
        charts.netWorthGrowth.data.datasets[1].data = [0];
        charts.netWorthGrowth.update();
        return;
    }
    
    // Sort by year ascending for chart
    history.sort((a, b) => a.year - b.year);
    
    const labels = history.map(item => item.year.toString());
    const netWorthData = history.map(item => item.netWorth);
    
    // Calculate growth rates
    const growthRates = [];
    netWorthData.forEach((value, index) => {
        if (index === 0) {
            growthRates.push(null); // No growth rate for first entry
        } else {
            const previousValue = netWorthData[index - 1];
            if (previousValue !== 0) {
                const growthRate = ((value - previousValue) / Math.abs(previousValue)) * 100;
                growthRates.push(growthRate);
            } else {
                growthRates.push(0);
            }
        }
    });
    
    charts.netWorthGrowth.data.labels = labels;
    charts.netWorthGrowth.data.datasets[0].data = netWorthData;
    charts.netWorthGrowth.data.datasets[1].data = growthRates;
    charts.netWorthGrowth.update();
}

/**
 * Initialize the Asset Categories Time chart
 * @param {Object} chartLibrary - Chart library
 */
function initAssetCategoriesTimeChart(chartLibrary = window.Chart) {
    const ctx = document.getElementById('asset-categories-time-chart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (charts.assetCategoriesTime) {
        charts.assetCategoriesTime.destroy();
    }
    
    charts.assetCategoriesTime = new chartLibrary(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update the Asset Categories Time chart with current data
 */
function updateAssetCategoriesTimeChart() {
    if (!charts.assetCategoriesTime) return;
    
    const dataStore = getDataStore();
    // Get all years sorted chronologically
    const years = dataStore.getYears().sort((a, b) => a - b);
    if (years.length === 0) return;
    
    // Get all unique asset categories across all years
    const allCategories = new Set();
    
    years.forEach(year => {
        const categories = dataStore.getAssetsByCategory(year);
        Object.keys(categories).forEach(category => allCategories.add(category));
    });
    
    const categories = Array.from(allCategories);
    
    // Prepare data for each category
    const datasets = categories.map((category, index) => {
        const data = years.map(year => {
            const categories = dataStore.getAssetsByCategory(year);
            return categories[category] || 0;
        });
        
        // Get color based on index
        const colors = [
            'rgba(58, 123, 213, 0.7)',
            'rgba(0, 209, 178, 0.7)',
            'rgba(255, 221, 87, 0.7)',
            'rgba(255, 56, 96, 0.7)',
            'rgba(142, 68, 173, 0.7)',
            'rgba(52, 152, 219, 0.7)',
            'rgba(46, 204, 113, 0.7)'
        ];
        
        const colorIndex = index % colors.length;
        
        return {
            label: category,
            data: data,
            backgroundColor: colors[colorIndex],
            borderColor: colors[colorIndex],
            fill: false
        };
    });
    
    charts.assetCategoriesTime.data.labels = years.map(year => year.toString());
    charts.assetCategoriesTime.data.datasets = datasets;
    charts.assetCategoriesTime.update();
}

/**
 * Initialize the Growth vs Benchmarks chart
 * @param {Object} chartLibrary - Chart library
 */
function initGrowthVsBenchmarksChart(chartLibrary = window.Chart) {
    const ctx = document.getElementById('growth-vs-benchmarks-chart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (charts.growthVsBenchmarks) {
        charts.growthVsBenchmarks.destroy();
    }
    
    charts.growthVsBenchmarks = new chartLibrary(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Your Net Worth',
                    data: [],
                    borderColor: 'rgba(58, 123, 213, 1)',
                    backgroundColor: 'rgba(58, 123, 213, 0.1)',
                    fill: true,
                    tension: 0.1
                },
                {
                    label: 'Market Benchmark (7%)',
                    data: [],
                    borderColor: 'rgba(192, 192, 192, 1)',
                    borderDash: [5, 5],
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    fill: false,
                    tension: 0
                },
                {
                    label: 'Aggressive Growth (10%)',
                    data: [],
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderDash: [2, 2],
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update the Growth vs Benchmarks chart with current data
 */
function updateGrowthVsBenchmarksChart() {
    if (!charts.growthVsBenchmarks) return;
    
    const dataStore = getDataStore();
    // Get historical net worth data
    const history = dataStore.getNetWorthHistory();
    if (history.length < 2) {
        // Not enough data
        charts.growthVsBenchmarks.data.labels = ['Insufficient Data'];
        charts.growthVsBenchmarks.data.datasets.forEach(dataset => {
            dataset.data = [0];
        });
        charts.growthVsBenchmarks.update();
        return;
    }
    
    // Sort history by year
    history.sort((a, b) => a.year - b.year);
    
    const labels = history.map(item => item.year.toString());
    const netWorthData = history.map(item => item.netWorth);
    
    // Calculate benchmark growth at 7% annually starting from first year's net worth
    const benchmark7Data = [];
    const benchmark10Data = [];
    const startNetWorth = netWorthData[0];
    
    // Skip benchmark if starting net worth is not positive
    if (startNetWorth <= 0) {
        charts.growthVsBenchmarks.data.labels = ['Invalid Starting Point'];
        charts.growthVsBenchmarks.data.datasets.forEach(dataset => {
            dataset.data = [0];
        });
        charts.growthVsBenchmarks.update();
        return;
    }
    
    netWorthData.forEach((value, index) => {
        if (index === 0) {
            benchmark7Data.push(startNetWorth);
            benchmark10Data.push(startNetWorth);
        } else {
            const benchmark7Value = benchmark7Data[0] * Math.pow(1.07, index);
            const benchmark10Value = benchmark10Data[0] * Math.pow(1.10, index);
            benchmark7Data.push(benchmark7Value);
            benchmark10Data.push(benchmark10Value);
        }
    });
    
    charts.growthVsBenchmarks.data.labels = labels;
    charts.growthVsBenchmarks.data.datasets[0].data = netWorthData;
    charts.growthVsBenchmarks.data.datasets[1].data = benchmark7Data;
    charts.growthVsBenchmarks.data.datasets[2].data = benchmark10Data;
    charts.growthVsBenchmarks.update();
}

/**
 * Initialize salary growth chart
 * @param {Object} chartLibrary - Chart library
 */
function initSalaryGrowthChart(chartLibrary = window.Chart) {
    const ctx = document.getElementById('salary-growth-chart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (charts.salaryGrowth) {
        charts.salaryGrowth.destroy();
    }
    
    charts.salaryGrowth = new chartLibrary(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Salary',
                data: [],
                backgroundColor: 'rgba(58, 123, 213, 0.1)',
                borderColor: 'rgba(58, 123, 213, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '£' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '£' + context.raw.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update salary growth chart
 */
export function updateSalaryGrowthChart() {
    if (!charts.salaryGrowth) return;
    
    const dataStore = getDataStore();
    const chartData = dataStore.getSalaryChartData();
    
    charts.salaryGrowth.data.labels = chartData.labels;
    charts.salaryGrowth.data.datasets[0].data = chartData.data;
    
    charts.salaryGrowth.update();
}

/**
 * Render any chart by ID
 * @param {string} chartId - Chart ID
 */
export function renderChart(chartId) {
    switch(chartId) {
        case 'net-worth-chart':
            updateNetWorthChart();
            break;
        case 'asset-diversity-chart':
            updateAssetDiversityChart();
            break;
        case 'net-worth-growth-chart':
            updateNetWorthGrowthChart();
            break;
        case 'asset-categories-time-chart':
            updateAssetCategoriesTimeChart();
            break;
        case 'growth-vs-benchmarks-chart':
            updateGrowthVsBenchmarksChart();
            break;
        case 'salary-growth-chart':
            updateSalaryGrowthChart();
            break;
    }
}