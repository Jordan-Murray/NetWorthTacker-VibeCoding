/**
 * Dashboard UI Module
 * Handles the dashboard UI, summary display, and charts
 */
import { getDataService } from './dataService.js';
// Chart.js is available globally via CDN

export class DashboardUI {
    constructor(dataService) {
        this.dataService = dataService;
        this.netWorthChart = null;
        this.assetsLiabilitiesChart = null;
    }

    // Utility functions
    formatCurrency(value, currency = 'GBP') {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency
        }).format(value);
    }

    calculatePercentChange(oldValue, newValue) {
        if (oldValue === 0) return 0;
        return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
    }

    init() {
        // Set up event listeners
        this.dataService.on('dataChanged', () => this.updateDashboard());
        
        // Initialize UI components
        this.initializeCharts();
        this.updateDashboard();
        
        // Set up year selector
        const yearSelect = document.getElementById('year-select');
        if (yearSelect) {
            yearSelect.addEventListener('change', () => this.updateDashboard());
            this.updateYearSelector();
        }
    }

    updateYearSelector() {
        const yearSelect = document.getElementById('year-select');
        if (!yearSelect) return;
        
        const years = this.dataService.getYears();
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

    updateDashboard() {
        const years = this.dataService.getYears();
        
        if (years.length === 0) return;
        
        const yearSelect = document.getElementById('year-select');
        const selectedYear = yearSelect ? parseInt(yearSelect.value) : years[years.length - 1];
        
        this.updateSummary(selectedYear);
        this.updateCharts(selectedYear);
    }

    updateSummary(year) {
        const years = this.dataService.getYears();
        const yearIndex = years.indexOf(year);
        const previousYear = yearIndex > 0 ? years[yearIndex - 1] : null;
        
        // Calculate current values
        const netWorth = this.dataService.getNetWorth(year);
        const totalAssets = this.dataService.getTotalAssets(year);
        const totalLiabilities = this.dataService.getTotalLiabilities(year);
        const debtRatio = this.dataService.getDebtToAssetRatio(year);
        
        // Calculate previous net worth for comparison
        const previousNetWorth = previousYear ? this.dataService.getNetWorth(previousYear) : 0;
        
        // Update UI elements
        this.updateNetWorthDisplay(netWorth, previousNetWorth, previousYear);
        this.updateAssetsDisplay(totalAssets);
        this.updateLiabilitiesDisplay(totalLiabilities);
        this.updateDebtRatioDisplay(debtRatio);
    }

    updateNetWorthDisplay(netWorth, previousNetWorth, previousYear) {
        const netWorthElement = document.getElementById('net-worth');
        const netWorthChangeElement = document.getElementById('net-worth-change');
        
        if (netWorthElement) {
            netWorthElement.textContent = this.formatCurrency(netWorth);
        }
        
        if (netWorthChangeElement && previousYear) {
            const percentChange = this.calculatePercentChange(previousNetWorth, netWorth);
            netWorthChangeElement.textContent = `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}% from ${previousYear}`;
            netWorthChangeElement.className = percentChange >= 0 ? 'positive-change' : 'negative-change';
        }
    }

    updateAssetsDisplay(totalAssets) {
        const element = document.getElementById('total-assets');
        if (element) {
            element.textContent = this.formatCurrency(totalAssets);
        }
    }

    updateLiabilitiesDisplay(totalLiabilities) {
        const element = document.getElementById('total-liabilities');
        if (element) {
            element.textContent = this.formatCurrency(totalLiabilities);
        }
    }

    updateDebtRatioDisplay(ratio) {
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

    initializeCharts() {
        this.initNetWorthChart();
        this.initAssetsLiabilitiesChart();
    }

    initNetWorthChart() {
        const ctx = document.getElementById('net-worth-chart');
        if (!ctx) return;
        
        this.netWorthChart = new Chart(ctx, {
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
                            callback: value => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    initAssetsLiabilitiesChart() {
        const ctx = document.getElementById('assets-liabilities-chart');
        if (!ctx) return;
        
        this.assetsLiabilitiesChart = new Chart(ctx, {
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
                            callback: value => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    updateCharts(selectedYear) {
        const years = this.dataService.getYears();
        
        // Update Net Worth Chart
        if (this.netWorthChart) {
            this.netWorthChart.data.labels = years;
            this.netWorthChart.data.datasets[0].data = years.map(year => this.dataService.getNetWorth(year));
            this.netWorthChart.update();
        }
        
        // Update Assets & Liabilities Chart
        if (this.assetsLiabilitiesChart) {
            const assets = this.dataService.getAssets(selectedYear);
            const liabilities = this.dataService.getLiabilities(selectedYear);
            
            const assetCategories = [...new Set(assets.map(a => a.category))];
            const liabilityCategories = [...new Set(liabilities.map(l => l.category))];
            const allCategories = [...new Set([...assetCategories, ...liabilityCategories])];
            
            this.assetsLiabilitiesChart.data.labels = allCategories;
            this.assetsLiabilitiesChart.data.datasets[0].data = allCategories.map(category => 
                assets.filter(a => a.category === category).reduce((sum, a) => sum + a.value, 0)
            );
            this.assetsLiabilitiesChart.data.datasets[1].data = allCategories.map(category =>
                liabilities.filter(l => l.category === category).reduce((sum, l) => sum + l.value, 0)
            );
            this.assetsLiabilitiesChart.update();
        }
    }
}