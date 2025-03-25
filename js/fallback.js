/**
 * Fallback Script
 * This script provides basic functionality if the module system fails to load
 */

// Log initialization
console.log('Fallback script loading');

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Fallback script initializing');
    
    // Basic initialization
    setupNavigation();
    setupModals();
    loadData();
    setupEventListeners();
});

/**
 * Set up navigation
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('#main-nav a');
    const sections = document.querySelectorAll('main > section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Update active navigation item
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
            
            // Show target section, hide others
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active-section');
                    section.classList.remove('hidden-section');
                    section.style.display = 'block';
                } else {
                    section.classList.remove('active-section');
                    section.classList.add('hidden-section');
                    section.style.display = 'none';
                }
            });
        });
    });
    
    // Handle initial URL hash
    const initialHash = window.location.hash.substring(1) || 'dashboard';
    const targetSection = document.getElementById(initialHash);
    const targetLink = document.querySelector(`#main-nav a[href="#${initialHash}"]`);
    
    if (targetSection && targetLink) {
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        targetLink.classList.add('active');
        
        sections.forEach(section => {
            if (section.id === initialHash) {
                section.classList.add('active-section');
                section.classList.remove('hidden-section');
                section.style.display = 'block';
            } else {
                section.classList.remove('active-section');
                section.classList.add('hidden-section');
                section.style.display = 'none';
            }
        });
    }
}

/**
 * Set up modals
 */
function setupModals() {
    // Global modal functions
    window.showModal = function(content, modalType) {
        const modalContainer = document.getElementById('modal-container');
        const modalBody = document.getElementById('modal-body');
        
        if (!modalContainer || !modalBody) {
            return;
        }
        
        if (content) {
            modalBody.innerHTML = content;
        }
        
        modalContainer.classList.remove('modal-hidden');
        modalContainer.classList.add('modal-visible');
        modalContainer.style.display = 'flex';
    };
    
    window.hideModal = function() {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) {
            return;
        }
        
        modalContainer.classList.add('modal-hidden');
        modalContainer.classList.remove('modal-visible');
        modalContainer.style.display = 'none';
    };
    
    // Set up close button
    const closeButton = document.querySelector('.close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', window.hideModal);
    }
    
    // Close modal when clicking outside
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                window.hideModal();
            }
        });
    }
}

/**
 * Load data from localStorage
 */
function loadData() {
    try {
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        window.appData = data;
        
        // Initialize with default data if empty
        if (!data.years || Object.keys(data.years).length === 0) {
            const currentYear = new Date().getFullYear().toString();
            
            window.appData = {
                years: {
                    [currentYear]: {
                        assets: [],
                        liabilities: []
                    }
                },
                milestones: [
                    {
                        id: Date.now().toString(),
                        amount: 10000,
                        name: 'First £10,000',
                        achieved: false
                    }
                ],
                salaryHistory: [],
                savingsHistory: []
            };
            
            saveData();
        }
        
        updateYearSelector();
        updateFinancialTables();
        updateDashboardSummary();
    } catch (e) {
        console.error('Error loading data:', e);
    }
}

/**
 * Save data to localStorage
 */
function saveData() {
    try {
        localStorage.setItem('netWorthData', JSON.stringify(window.appData));
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Add button listeners
    const addAssetBtn = document.getElementById('add-asset');
    if (addAssetBtn) {
        addAssetBtn.addEventListener('click', showAddAssetModal);
    }
    
    const addLiabilityBtn = document.getElementById('add-liability');
    if (addLiabilityBtn) {
        addLiabilityBtn.addEventListener('click', showAddLiabilityModal);
    }
    
    const addMilestoneBtn = document.getElementById('add-milestone');
    if (addMilestoneBtn) {
        addMilestoneBtn.addEventListener('click', showAddMilestoneModal);
    }
    
    const addSalaryBtn = document.getElementById('add-salary');
    if (addSalaryBtn) {
        addSalaryBtn.addEventListener('click', showAddSalaryModal);
    }
    
    const refreshTrendsBtn = document.getElementById('refresh-trends-btn');
    if (refreshTrendsBtn) {
        refreshTrendsBtn.addEventListener('click', renderCharts);
    }
    
    const yearSelect = document.getElementById('year-select');
    if (yearSelect) {
        yearSelect.addEventListener('change', updateFinancialTables);
    }
    
    const settingsIcon = document.getElementById('settings-icon');
    if (settingsIcon) {
        settingsIcon.addEventListener('click', showImportExportModal);
    }
}

/**
 * Update year selector
 */
function updateYearSelector() {
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect) return;
    
    // Clear current options
    yearSelect.innerHTML = '';
    
    // Get years
    const years = Object.keys(window.appData.years).sort().reverse();
    
    // Add options
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
}

/**
 * Update financial tables
 */
function updateFinancialTables() {
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect) return;
    
    const selectedYear = yearSelect.value;
    if (!selectedYear) return;
    
    // Update assets table
    const assetsTableBody = document.querySelector('#assets-table tbody');
    if (assetsTableBody) {
        assetsTableBody.innerHTML = '';
        
        const assets = window.appData.years[selectedYear].assets || [];
        
        if (assets.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="4" class="empty-table">No assets added yet. Click "Add Asset" to get started.</td>';
            assetsTableBody.appendChild(emptyRow);
        } else {
            assets.forEach(asset => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${asset.category || 'Uncategorized'}</td>
                    <td>${asset.name || ''}</td>
                    <td>£${parseFloat(asset.value).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${asset.id}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${asset.id}">Delete</button>
                    </td>
                `;
                assetsTableBody.appendChild(row);
            });
        }
    }
    
    // Update liabilities table
    const liabilitiesTableBody = document.querySelector('#liabilities-table tbody');
    if (liabilitiesTableBody) {
        liabilitiesTableBody.innerHTML = '';
        
        const liabilities = window.appData.years[selectedYear].liabilities || [];
        
        if (liabilities.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="4" class="empty-table">No liabilities added yet. Click "Add Liability" to get started.</td>';
            liabilitiesTableBody.appendChild(emptyRow);
        } else {
            liabilities.forEach(liability => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${liability.category || 'Uncategorized'}</td>
                    <td>${liability.name || liability.category || ''}</td>
                    <td>£${parseFloat(liability.value).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${liability.id}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${liability.id}">Delete</button>
                    </td>
                `;
                liabilitiesTableBody.appendChild(row);
            });
        }
    }
    
    // Update totals
    updateTotals(selectedYear);
}

/**
 * Update totals
 */
function updateTotals(yearId) {
    if (!yearId || !window.appData.years[yearId]) return;
    
    // Calculate totals
    let assetsTotal = 0;
    let liabilitiesTotal = 0;
    
    if (window.appData.years[yearId].assets) {
        assetsTotal = window.appData.years[yearId].assets.reduce((total, asset) => {
            return total + parseFloat(asset.value || 0);
        }, 0);
    }
    
    if (window.appData.years[yearId].liabilities) {
        liabilitiesTotal = window.appData.years[yearId].liabilities.reduce((total, liability) => {
            return total + parseFloat(liability.value || 0);
        }, 0);
    }
    
    // Update UI
    const assetsTotalElement = document.getElementById('assets-total');
    const liabilitiesTotalElement = document.getElementById('liabilities-total');
    
    if (assetsTotalElement) {
        assetsTotalElement.textContent = `£${assetsTotal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    if (liabilitiesTotalElement) {
        liabilitiesTotalElement.textContent = `£${liabilitiesTotal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    // Update dashboard
    updateDashboardSummary();
}

/**
 * Update dashboard summary
 */
function updateDashboardSummary() {
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect) return;
    
    const selectedYear = yearSelect.value;
    if (!selectedYear || !window.appData.years[selectedYear]) return;
    
    // Calculate totals
    let assetsTotal = 0;
    let liabilitiesTotal = 0;
    
    if (window.appData.years[selectedYear].assets) {
        assetsTotal = window.appData.years[selectedYear].assets.reduce((total, asset) => {
            return total + parseFloat(asset.value || 0);
        }, 0);
    }
    
    if (window.appData.years[selectedYear].liabilities) {
        liabilitiesTotal = window.appData.years[selectedYear].liabilities.reduce((total, liability) => {
            return total + parseFloat(liability.value || 0);
        }, 0);
    }
    
    const netWorth = assetsTotal - liabilitiesTotal;
    const debtAssetRatio = assetsTotal > 0 ? (liabilitiesTotal / assetsTotal) * 100 : 0;
    
    // Update UI
    const netWorthElement = document.getElementById('current-net-worth');
    const assetsElement = document.getElementById('total-assets');
    const liabilitiesElement = document.getElementById('total-liabilities');
    const ratioElement = document.getElementById('debt-asset-ratio');
    const ratioBarElement = document.getElementById('debt-ratio-bar');
    
    if (netWorthElement) {
        netWorthElement.textContent = `£${netWorth.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    if (assetsElement) {
        assetsElement.textContent = `£${assetsTotal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    if (liabilitiesElement) {
        liabilitiesElement.textContent = `£${liabilitiesTotal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    if (ratioElement) {
        ratioElement.textContent = `${debtAssetRatio.toFixed(1)}%`;
    }
    
    if (ratioBarElement) {
        ratioBarElement.style.width = `${Math.min(debtAssetRatio, 100)}%`;
        
        if (debtAssetRatio < 30) {
            ratioBarElement.style.backgroundColor = '#4caf50';
        } else if (debtAssetRatio < 60) {
            ratioBarElement.style.backgroundColor = '#ff9800';
        } else {
            ratioBarElement.style.backgroundColor = '#f44336';
        }
    }
    
    // Render charts
    renderCharts();
}

/**
 * Render charts
 */
function renderCharts() {
    // Only attempt to render if Chart.js is available
    if (!window.Chart) {
        console.warn('Chart.js not available, skipping chart rendering');
        return;
    }
    
    try {
        renderNetWorthChart();
        renderAssetDiversityChart();
        renderNetWorthGrowthChart();
        renderAssetCategoriesTimeChart();
        renderGrowthVsBenchmarksChart();
        renderSalaryGrowthChart();
    } catch (e) {
        console.error('Error rendering charts:', e);
    }
}

/**
 * Render net worth chart
 */
function renderNetWorthChart() {
    const ctx = document.getElementById('net-worth-chart');
    if (!ctx) return;
    
    // Get all years
    const years = Object.keys(window.appData.years).sort();
    
    // Calculate net worth for each year
    const netWorthData = years.map(year => {
        let assetsTotal = 0;
        let liabilitiesTotal = 0;
        
        if (window.appData.years[year].assets) {
            assetsTotal = window.appData.years[year].assets.reduce((total, asset) => {
                return total + parseFloat(asset.value || 0);
            }, 0);
        }
        
        if (window.appData.years[year].liabilities) {
            liabilitiesTotal = window.appData.years[year].liabilities.reduce((total, liability) => {
                return total + parseFloat(liability.value || 0);
            }, 0);
        }
        
        return assetsTotal - liabilitiesTotal;
    });
    
    // Create or update chart
    if (window.netWorthChart) {
        window.netWorthChart.data.labels = years;
        window.netWorthChart.data.datasets[0].data = netWorthData;
        window.netWorthChart.update();
    } else {
        window.netWorthChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Net Worth',
                        backgroundColor: 'rgba(58, 123, 213, 0.8)',
                        data: netWorthData
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
                                return '£' + value.toLocaleString('en-GB');
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '£' + context.raw.toLocaleString('en-GB');
                            }
                        }
                    }
                }
            }
        });
    }
}

/**
 * Render asset diversity chart
 */
function renderAssetDiversityChart() {
    const ctx = document.getElementById('asset-diversity-chart');
    if (!ctx) return;
    
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect) return;
    
    const selectedYear = yearSelect.value;
    if (!selectedYear || !window.appData.years[selectedYear]) return;
    
    // Group assets by category
    const categories = {};
    
    if (window.appData.years[selectedYear].assets) {
        window.appData.years[selectedYear].assets.forEach(asset => {
            const category = asset.category || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = 0;
            }
            categories[category] += parseFloat(asset.value || 0);
        });
    }
    
    const labels = Object.keys(categories);
    const data = Object.values(categories);
    
    // Create or update chart
    if (window.assetDiversityChart) {
        window.assetDiversityChart.data.labels = labels;
        window.assetDiversityChart.data.datasets[0].data = data;
        window.assetDiversityChart.update();
    } else {
        window.assetDiversityChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
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
                                return `${context.label}: £${value.toLocaleString('en-GB')} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Add placeholder functions for other chart types
function renderNetWorthGrowthChart() { /* Implement if needed */ }
function renderAssetCategoriesTimeChart() { /* Implement if needed */ }
function renderGrowthVsBenchmarksChart() { /* Implement if needed */ }
function renderSalaryGrowthChart() { /* Implement if needed */ }

// Add placeholder functions for modal forms
function showAddAssetModal() { 
    const modalContent = `
        <h2>Add New Asset</h2>
        <div class="form-group">
            <label for="asset-category">Category:</label>
            <select id="asset-category">
                <option value="Properties">Properties</option>
                <option value="Retirement Savings">Retirement Savings</option>
                <option value="Investments">Investments</option>
                <option value="Cash and Cash Equivalent">Cash and Cash Equivalent</option>
                <option value="Other Assets">Other Assets</option>
            </select>
        </div>
        <div class="form-group">
            <label for="asset-name">Item Name:</label>
            <input type="text" id="asset-name" placeholder="e.g. Home, Car, Stocks..." />
        </div>
        <div class="form-group">
            <label for="asset-value">Value (£):</label>
            <input type="number" id="asset-value" min="0" step="0.01" />
        </div>
        <div class="form-actions">
            <button id="cancel-asset" class="cancel-btn">Cancel</button>
            <button id="save-asset" class="save-btn">Add Asset</button>
        </div>
    `;
    
    window.showModal(modalContent);
    
    // Add event listeners for the buttons
    const cancelBtn = document.getElementById('cancel-asset');
    const saveBtn = document.getElementById('save-asset');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', window.hideModal);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const category = document.getElementById('asset-category').value;
            const name = document.getElementById('asset-name').value;
            const valueInput = document.getElementById('asset-value').value;
            const value = parseFloat(valueInput);
            
            if (category && name && !isNaN(value) && value >= 0) {
                const yearSelect = document.getElementById('year-select');
                const selectedYear = yearSelect ? yearSelect.value : null;
                
                if (selectedYear && window.appData.years[selectedYear]) {
                    if (!window.appData.years[selectedYear].assets) {
                        window.appData.years[selectedYear].assets = [];
                    }
                    
                    window.appData.years[selectedYear].assets.push({
                        id: Date.now().toString(),
                        category,
                        name,
                        value,
                        dateAdded: new Date().toISOString()
                    });
                    
                    saveData();
                    updateFinancialTables();
                    window.hideModal();
                }
            } else {
                alert('Please fill all fields with valid values');
            }
        });
    }
}

function showAddLiabilityModal() { /* Similar to showAddAssetModal */ }
function showAddMilestoneModal() { /* Implement if needed */ }
function showAddSalaryModal() { /* Implement if needed */ }

function showImportExportModal() {
    const modalContent = `
        <h2>Data Management</h2>
        <p>Export your data as JSON to back it up, or import previously exported data.</p>
        
        <div class="tabs">
            <button class="tab-button active" data-tab="export">Export Data</button>
            <button class="tab-button" data-tab="import">Import Data</button>
        </div>
        
        <div class="tab-content active" id="export-tab">
            <p>Copy the JSON data below to save it:</p>
            <textarea id="export-data" rows="10" readonly>${JSON.stringify(window.appData, null, 2)}</textarea>
            <div class="form-actions">
                <button id="copy-data" class="save-btn">Copy to Clipboard</button>
            </div>
        </div>
        
        <div class="tab-content" id="import-tab" style="display: none;">
            <p>Paste your previously exported JSON data below:</p>
            <textarea id="import-data" rows="10" placeholder="Paste your backup data here..."></textarea>
            <div class="form-actions">
                <button id="cancel-import" class="cancel-btn">Cancel</button>
                <button id="import-data-btn" class="save-btn">Import Data</button>
            </div>
            <p class="warning">Warning: This will overwrite your current data!</p>
        </div>
    `;
    
    window.showModal(modalContent);
    
    // Set up tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show target tab content, hide others
            tabContents.forEach(content => {
                if (content.id === `${targetTab}-tab`) {
                    content.style.display = 'block';
                } else {
                    content.style.display = 'none';
                }
            });
        });
    });
    
    // Copy to clipboard
    const copyButton = document.getElementById('copy-data');
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const exportDataElement = document.getElementById('export-data');
            exportDataElement.select();
            document.execCommand('copy');
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy to Clipboard';
            }, 2000);
        });
    }
    
    // Import data
    const importButton = document.getElementById('import-data-btn');
    if (importButton) {
        importButton.addEventListener('click', () => {
            const importDataText = document.getElementById('import-data').value;
            
            try {
                const parsedData = JSON.parse(importDataText);
                
                // Basic validation
                if (!parsedData.years) {
                    throw new Error('Invalid data format: missing years property');
                }
                
                // Update data
                window.appData = parsedData;
                saveData();
                
                // Update UI
                updateYearSelector();
                updateFinancialTables();
                
                // Close modal
                window.hideModal();
                
                // Show success message
                alert('Data imported successfully!');
            } catch (error) {
                alert(`Error importing data: ${error.message}`);
            }
        });
    }
}