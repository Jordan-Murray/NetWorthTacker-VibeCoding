/**
 * Chart Manager Module
 * Handles all Chart.js visualizations
 */
import { formatCurrency } from './utils.js';

export class ChartManager {
    constructor(dataStore) {
        this.dataStore = dataStore;
        this.charts = {};
        
        // Set up event listener for data updates
        document.addEventListener('dataUpdated', () => {
            this.updateAllCharts();
        });
    }
    
    /**
     * Initialize all charts
     */
    initializeCharts() {
        // Dashboard charts
        this.initializeNetWorthChart();
        this.initializeAssetDiversityChart();
        
        // Trends charts
        this.initializeNetWorthGrowthChart();
        this.initializeAssetCategoriesTimeChart();
        this.initializeGrowthVsBenchmarksChart();
        
        // Salary chart
        this.initializeSalaryGrowthChart();
    }
    
    /**
     * Update all charts
     */
    updateAllCharts() {
        // Dashboard charts
        this.updateNetWorthChart();
        this.updateAssetDiversityChart();
        
        // Trends charts
        this.updateNetWorthGrowthChart();
        this.updateAssetCategoriesTimeChart();
        this.updateGrowthVsBenchmarksChart();
        
        // Salary chart
        this.updateSalaryGrowthChart();
    }
    
    /**
     * Initialize the Net Worth history chart
     */
    initializeNetWorthChart() {
        const ctx = document.getElementById('net-worth-chart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (this.charts.netWorth) {
            this.charts.netWorth.destroy();
        }
        
        this.charts.netWorth = new Chart(ctx, {
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
    updateNetWorthChart() {
        if (!this.charts.netWorth) return;
        
        const history = this.dataStore.getNetWorthHistory();
        
        // Sort by year ascending for chart
        history.sort((a, b) => a.year - b.year);
        
        const labels = history.map(item => item.year.toString());
        const netWorthData = history.map(item => item.netWorth);
        
        this.charts.netWorth.data.labels = labels;
        this.charts.netWorth.data.datasets[0].data = netWorthData;
        this.charts.netWorth.update();
    }
    
    /**
     * Initialize the Asset Diversity pie chart
     */
    initializeAssetDiversityChart() {
        const ctx = document.getElementById('asset-diversity-chart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (this.charts.assetDiversity) {
            this.charts.assetDiversity.destroy();
        }
        
        this.charts.assetDiversity = new Chart(ctx, {
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
    updateAssetDiversityChart() {
        if (!this.charts.assetDiversity) return;
        
        const years = this.dataStore.getYears();
        if (years.length === 0) return;
        
        const currentYear = years[0]; // Most recent year
        const assetCategories = this.dataStore.getAssetsByCategory(currentYear);
        
        const labels = Object.keys(assetCategories);
        const data = Object.values(assetCategories);
        
        this.charts.assetDiversity.data.labels = labels;
        this.charts.assetDiversity.data.datasets[0].data = data;
        this.charts.assetDiversity.update();
    }
    
    /**
     * Initialize the Net Worth Growth chart
     */
    initializeNetWorthGrowthChart() {
        const ctx = document.getElementById('net-worth-growth-chart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (this.charts.netWorthGrowth) {
            this.charts.netWorthGrowth.destroy();
        }
        
        this.charts.netWorthGrowth = new Chart(ctx, {
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
    updateNetWorthGrowthChart() {
        if (!this.charts.netWorthGrowth) return;
        
        const history = this.dataStore.getNetWorthHistory();
        if (history.length < 2) {
            // Not enough data for growth chart
            this.charts.netWorthGrowth.data.labels = ['Insufficient Data'];
            this.charts.netWorthGrowth.data.datasets[0].data = [0];
            this.charts.netWorthGrowth.data.datasets[1].data = [0];
            this.charts.netWorthGrowth.update();
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
        
        this.charts.netWorthGrowth.data.labels = labels;
        this.charts.netWorthGrowth.data.datasets[0].data = netWorthData;
        this.charts.netWorthGrowth.data.datasets[1].data = growthRates;
        this.charts.netWorthGrowth.update();
    }
    
    /**
     * Initialize the Asset Categories Time chart
     */
    initializeAssetCategoriesTimeChart() {
        const ctx = document.getElementById('asset-categories-time-chart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (this.charts.assetCategoriesTime) {
            this.charts.assetCategoriesTime.destroy();
        }
        
        this.charts.assetCategoriesTime = new Chart(ctx, {
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
    updateAssetCategoriesTimeChart() {
        if (!this.charts.assetCategoriesTime) return;
        
        // Get all years sorted chronologically
        const years = this.dataStore.getYears().sort((a, b) => a - b);
        if (years.length === 0) return;
        
        // Get all unique asset categories across all years
        const allCategories = new Set();
        
        years.forEach(year => {
            const categories = this.dataStore.getAssetsByCategory(year);
            Object.keys(categories).forEach(category => allCategories.add(category));
        });
        
        const categories = Array.from(allCategories);
        
        // Prepare data for each category
        const datasets = categories.map((category, index) => {
            const data = years.map(year => {
                const categories = this.dataStore.getAssetsByCategory(year);
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
        
        this.charts.assetCategoriesTime.data.labels = years.map(year => year.toString());
        this.charts.assetCategoriesTime.data.datasets = datasets;
        this.charts.assetCategoriesTime.update();
    }
    
    /**
     * Initialize the Growth vs Benchmarks chart
     */
    initializeGrowthVsBenchmarksChart() {
        const ctx = document.getElementById('growth-vs-benchmarks-chart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (this.charts.growthVsBenchmarks) {
            this.charts.growthVsBenchmarks.destroy();
        }
        
        this.charts.growthVsBenchmarks = new Chart(ctx, {
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
    updateGrowthVsBenchmarksChart() {
        if (!this.charts.growthVsBenchmarks) return;
        
        // Get historical net worth data
        const history = this.dataStore.getNetWorthHistory();
        if (history.length < 2) {
            // Not enough data
            this.charts.growthVsBenchmarks.data.labels = ['Insufficient Data'];
            this.charts.growthVsBenchmarks.data.datasets.forEach(dataset => {
                dataset.data = [0];
            });
            this.charts.growthVsBenchmarks.update();
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
            this.charts.growthVsBenchmarks.data.labels = ['Invalid Starting Point'];
            this.charts.growthVsBenchmarks.data.datasets.forEach(dataset => {
                dataset.data = [0];
            });
            this.charts.growthVsBenchmarks.update();
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
        
        this.charts.growthVsBenchmarks.data.labels = labels;
        this.charts.growthVsBenchmarks.data.datasets[0].data = netWorthData;
        this.charts.growthVsBenchmarks.data.datasets[1].data = benchmark7Data;
        this.charts.growthVsBenchmarks.data.datasets[2].data = benchmark10Data;
        this.charts.growthVsBenchmarks.update();
    }
    
    /**
     * Initialize salary growth chart
     */
    initializeSalaryGrowthChart() {
        const ctx = document.getElementById('salary-growth-chart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (this.charts.salaryGrowth) {
            this.charts.salaryGrowth.destroy();
        }
        
        this.charts.salaryGrowth = new Chart(ctx, {
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
    updateSalaryGrowthChart() {
        if (!this.charts.salaryGrowth) return;
        
        const chartData = this.dataStore.getSalaryChartData();
        
        this.charts.salaryGrowth.data.labels = chartData.labels;
        this.charts.salaryGrowth.data.datasets[0].data = chartData.data;
        
        this.charts.salaryGrowth.update();
    }
    
    /**
     * Render Salary Growth Chart
     */
    renderSalaryChart(canvasId, chartData) {
        const ctx = document.getElementById(canvasId);
        
        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        // Create new chart
        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Salary (£)',
                    data: chartData.data,
                    borderColor: '#3a7bd5',
                    backgroundColor: 'rgba(58, 123, 213, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `£${value.toLocaleString()}`
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => `Salary: £${context.raw.toLocaleString()}`
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render Savings Distribution Chart
     */
    renderSavingsDistributionChart(canvasId, categoriesData) {
        const ctx = document.getElementById(canvasId);
        
        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        // No data case
        if (Object.keys(categoriesData).length === 0) {
            const noDataCtx = ctx.getContext('2d');
            noDataCtx.font = '16px Arial';
            noDataCtx.textAlign = 'center';
            noDataCtx.fillText('No savings data available', ctx.width / 2, ctx.height / 2);
            return;
        }
        
        // Prepare data for chart
        const labels = Object.keys(categoriesData);
        const data = Object.values(categoriesData);
        const backgroundColor = [
            'rgba(58, 123, 213, 0.7)',   // Primary blue
            'rgba(0, 209, 178, 0.7)',    // Teal
            'rgba(255, 71, 87, 0.7)'     // Pink
        ];
        
        // Create new chart
        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColor,
                    borderColor: 'white',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: £${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render Savings Timeline Chart
     */
    renderSavingsTimelineChart(canvasId, savingsData) {
        const ctx = document.getElementById(canvasId);
        
        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        // No data case
        if (savingsData.length === 0) {
            const noDataCtx = ctx.getContext('2d');
            noDataCtx.font = '16px Arial';
            noDataCtx.textAlign = 'center';
            noDataCtx.fillText('No savings data available', ctx.width / 2, ctx.height / 2);
            return;
        }
        
        // Sort data by date (oldest first)
        const sortedData = [...savingsData].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Group data by month and category
        const groupedData = {};
        const categories = ['Emergency Fund', 'Stocks & Shares ISA', 'Other'];
        
        sortedData.forEach(entry => {
            const date = new Date(entry.date);
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
            
            if (!groupedData[monthYear]) {
                groupedData[monthYear] = {
                    'Emergency Fund': 0,
                    'Stocks & Shares ISA': 0,
                    'Other': 0
                };
            }
            
            groupedData[monthYear][entry.category] += entry.amount;
        });
        
        // Convert to chart format
        const labels = Object.keys(groupedData);
        const datasets = categories.map((category, index) => {
            // Different colors for different categories
            const colors = [
                'rgba(58, 123, 213, 0.7)',   // Blue for Emergency Fund
                'rgba(0, 209, 178, 0.7)',    // Teal for ISA
                'rgba(255, 71, 87, 0.7)'     // Pink for Other
            ];
            
            return {
                label: category,
                data: labels.map(month => groupedData[month][category]),
                backgroundColor: colors[index],
                borderColor: colors[index].replace('0.7', '1'),
                borderWidth: 1
            };
        });
        
        // Create new chart
        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `£${value.toLocaleString()}`
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.dataset.label || '';
                                return `${label}: £${context.raw.toLocaleString()}`;
                            }
                        }
                    }
                }
            }
        });
    }
} 