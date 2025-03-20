// Direct UI script - directly renders UI components based on localStorage
console.log('Direct UI script loaded');

document.addEventListener('DOMContentLoaded', () => {
    // Wait for DOM to be fully ready
    setTimeout(() => {
        if (document.getElementById('year-select')) {
            console.log('Year select found, setting up direct UI renderer');
            setupDirectUI();
        } else {
            console.log('Year select not found yet, waiting');
            setTimeout(setupDirectUI, 500);
        }
        
        // Setup settings icon functionality
        setupSettingsIcon();
    }, 500);
    
    // Setup settings icon for data import/export
    function setupSettingsIcon() {
        const settingsIcon = document.getElementById('settings-icon');
        if (settingsIcon) {
            settingsIcon.addEventListener('click', () => {
                showDataManagementModal();
            });
        }
    }
    
    // Show data management modal
    function showDataManagementModal() {
        const modalContent = `
            <h2>Data Management</h2>
            <p>Export your data as JSON to back it up, or import previously exported data.</p>
            
            <div class="tabs">
                <button class="tab-button active" data-tab="export">Export Data</button>
                <button class="tab-button" data-tab="import">Import Data</button>
            </div>
            
            <div class="tab-content active" id="export-tab">
                <p>Copy the JSON data below to save it:</p>
                <textarea id="export-data" rows="10" readonly>${getCurrentData()}</textarea>
                <div class="form-actions">
                    <button id="copy-data" class="save-btn">Copy to Clipboard</button>
                    <button id="download-data" class="save-btn">Download as File</button>
                </div>
            </div>
            
            <div class="tab-content" id="import-tab">
                <p>Paste your previously exported JSON data below:</p>
                <textarea id="import-data" rows="10" placeholder="Paste your backup data here..."></textarea>
                <div class="form-actions">
                    <button id="cancel-import" class="cancel-btn">Cancel</button>
                    <button id="import-data-btn" class="save-btn">Import Data</button>
                </div>
                <p class="warning">Warning: This will overwrite your current data!</p>
            </div>
        `;
        
        if (window.showModal) {
            window.showModal(modalContent, 'data-management');
            setupDataManagementActions();
        } else {
            // Fallback if showModal is not available
            const modal = document.getElementById('modal-container');
            if (modal) {
                const modalBody = document.getElementById('modal-body');
                modalBody.innerHTML = modalContent;
                modal.classList.remove('modal-hidden');
                modal.classList.add('modal-visible');
                setupDataManagementActions();
            }
        }
    }
    
    // Setup actions for data management modal
    function setupDataManagementActions() {
        // Tab switching
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
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });
        
        // Copy to clipboard
        const copyButton = document.getElementById('copy-data');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                const exportData = document.getElementById('export-data');
                exportData.select();
                document.execCommand('copy');
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy to Clipboard';
                }, 2000);
            });
        }
        
        // Download as file
        const downloadButton = document.getElementById('download-data');
        if (downloadButton) {
            downloadButton.addEventListener('click', () => {
                const data = document.getElementById('export-data').value;
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'net-worth-tracker-data.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }
        
        // Import data
        const importButton = document.getElementById('import-data-btn');
        if (importButton) {
            importButton.addEventListener('click', () => {
                const importData = document.getElementById('import-data').value;
                
                try {
                    const parsedData = JSON.parse(importData);
                    
                    // Basic validation
                    if (!parsedData.years) {
                        throw new Error('Invalid data format: missing years property');
                    }
                    
                    // Save the imported data
                    localStorage.setItem('netWorthData', importData);
                    
                    // Hide modal
                    if (window.hideModal) {
                        window.hideModal();
                    } else {
                        const modal = document.getElementById('modal-container');
                        if (modal) {
                            modal.classList.add('modal-hidden');
                            modal.classList.remove('modal-visible');
                        }
                    }
                    
                    // Show success message
                    alert('Data imported successfully! The page will now reload.');
                    
                    // Reload page to reflect changes
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                } catch (error) {
                    alert(`Error importing data: ${error.message}. Please check that your JSON is valid.`);
                }
            });
        }
        
        // Cancel import
        const cancelButton = document.getElementById('cancel-import');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                if (window.hideModal) {
                    window.hideModal();
                } else {
                    const modal = document.getElementById('modal-container');
                    if (modal) {
                        modal.classList.add('modal-hidden');
                        modal.classList.remove('modal-visible');
                    }
                }
            });
        }
    }
    
    // Get current data from localStorage
    function getCurrentData() {
        const data = localStorage.getItem('netWorthData') || '{}';
        try {
            // Format the JSON with pretty printing
            const parsedData = JSON.parse(data);
            return JSON.stringify(parsedData, null, 2);
        } catch (e) {
            console.error('Error parsing data:', e);
            return data;
        }
    }
    
    function setupDirectUI() {
        // Add event listener to year selector
        const yearSelect = document.getElementById('year-select');
        if (!yearSelect) {
            console.log('Year selector not found, aborting direct UI setup');
            return;
        }
        
        // Set up forced render on year change
        yearSelect.addEventListener('change', () => {
            setTimeout(() => {
                renderFinancialTables(yearSelect.value);
                updateDashboardSummary();
            }, 50);
        });
        
        // Initial render
        setTimeout(() => {
            if (yearSelect.options.length > 0) {
                renderFinancialTables(yearSelect.value);
                updateDashboardSummary();
            }
        }, 300);
        
        // Add event listener to ensure year select has data
        document.addEventListener('yearDataUpdated', (e) => {
            console.log('Year data updated event received');
            const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
            const yearToSelect = e.detail?.year || 
                                (yearSelect.value && data.years[yearSelect.value]) ? 
                                yearSelect.value : 
                                new Date().getFullYear().toString();
            
            if (data.years && data.years[yearToSelect]) {
                renderFinancialTables(yearToSelect);
                updateDashboardSummary();
            }
        });
        
        // Add event listener for milestone updates
        document.addEventListener('milestonesUpdated', () => {
            console.log('Milestones update event received');
            renderMilestones();
        });
        
        // Add event listener for salary data updates
        document.addEventListener('salaryDataUpdated', () => {
            console.log('Salary data update event received');
            renderSalaryTable();
        });
        
        // Initial render of milestones
        setTimeout(() => {
            renderMilestones();
            renderSalaryTable();
        }, 300);
        
        // Initial render of charts
        setTimeout(() => {
            renderDashboardCharts();
            renderTrendsCharts();
        }, 500);
        
        // Add event listener for refresh trends button
        const refreshTrendsBtn = document.getElementById('refresh-trends-btn');
        if (refreshTrendsBtn) {
            refreshTrendsBtn.addEventListener('click', function() {
                console.log('Manual refresh of trend charts requested');
                renderTrendsCharts();
            });
        }
        
        // Setup budgeting functionality
        setupBudgetingCalculators();
    }
    
    // Function to render financial tables
    function renderFinancialTables(year) {
        if (!year) return;
        
        console.log('Directly rendering financial tables for year:', year);
        
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        if (!data.years || !data.years[year]) {
            console.log('No data for year', year);
            return;
        }
        
        const yearData = data.years[year];
        
        // Render assets table
        renderAssetsTable(year);
        
        // Render liabilities table
        renderLiabilitiesTable(year);
        
        // Update totals
        updateTotals(year);
    }
    
    function renderAssetsTable(yearId) {
        console.log(`Rendering assets table for year ${yearId}`);
        
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        if (!data.years || !data.years[yearId]) return;
        
        const assetsTable = document.getElementById('assets-table');
        if (!assetsTable) {
            console.log('Assets table element not found');
            return;
        }
        
        // Clear existing rows
        assetsTable.innerHTML = '';
        
        const yearData = data.years[yearId];
        if (!yearData.assets || yearData.assets.length === 0) {
            // No assets
            assetsTable.innerHTML = '<tr><td colspan="3" class="empty-list">No assets added yet</td></tr>';
            return;
        }
        
        // Add table header 
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Category</th>
            <th>Name</th>
            <th>Value (£)</th>
            <th>Actions</th>
        `;
        assetsTable.appendChild(headerRow);
        
        // Sort by category then name
        const sortedAssets = [...yearData.assets].sort((a, b) => {
            if (a.category === b.category) {
                return a.name.localeCompare(b.name);
            }
            return a.category.localeCompare(b.category);
        });
        
        // Add each asset
        sortedAssets.forEach(asset => {
            const row = document.createElement('tr');
            row.className = 'finance-item';
            row.dataset.id = asset.id;
            
            row.innerHTML = `
                <td>${asset.category}</td>
                <td>${asset.name}</td>
                <td>£${parseFloat(asset.value).toLocaleString()}</td>
                <td class="item-actions">
                    <button class="edit-btn" data-id="${asset.id}" data-type="asset">Edit</button>
                    <button class="delete-btn" data-id="${asset.id}" data-type="asset">Delete</button>
                </td>
            `;
            
            assetsTable.appendChild(row);
        });
        
        // Set up action buttons
        setupActionButtons('asset');
    }
    
    function renderLiabilitiesTable(yearId) {
        console.log(`Rendering liabilities table for year ${yearId}`);
        
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        if (!data.years || !data.years[yearId]) return;
        
        const liabilitiesTable = document.getElementById('liabilities-table');
        if (!liabilitiesTable) {
            console.log('Liabilities table element not found');
            return;
        }
        
        // Clear existing rows
        liabilitiesTable.innerHTML = '';
        
        const yearData = data.years[yearId];
        if (!yearData.liabilities || yearData.liabilities.length === 0) {
            // No liabilities
            liabilitiesTable.innerHTML = '<tr><td colspan="3" class="empty-list">No liabilities added yet</td></tr>';
            return;
        }
        
        // Add table header
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Category</th>
            <th>Value (£)</th>
            <th>Actions</th>
        `;
        liabilitiesTable.appendChild(headerRow);
        
        // Sort by category
        const sortedLiabilities = [...yearData.liabilities].sort((a, b) => 
            a.category.localeCompare(b.category)
        );
        
        // Add each liability
        sortedLiabilities.forEach(liability => {
            const row = document.createElement('tr');
            row.className = 'finance-item';
            row.dataset.id = liability.id;
            
            row.innerHTML = `
                <td>${liability.category}</td>
                <td>£${parseFloat(liability.value).toLocaleString()}</td>
                <td class="item-actions">
                    <button class="edit-btn" data-id="${liability.id}" data-type="liability">Edit</button>
                    <button class="delete-btn" data-id="${liability.id}" data-type="liability">Delete</button>
                </td>
            `;
            
            liabilitiesTable.appendChild(row);
        });
        
        // Set up action buttons
        setupActionButtons('liability');
    }
    
    // Function to set up edit and delete buttons
    function setupActionButtons(itemType) {
        // Setup edit buttons
        document.querySelectorAll(`.edit-btn[data-type="${itemType}"]`).forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const type = this.getAttribute('data-type');
                editItem(id, type);
            });
        });
        
        // Setup delete buttons
        document.querySelectorAll(`.delete-btn[data-type="${itemType}"]`).forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const type = this.getAttribute('data-type');
                deleteItem(id, type);
            });
        });
    }
    
    // Function to edit an item
    function editItem(id, type) {
        console.log(`Editing ${type} with id: ${id}`);
        
        const currentYear = document.getElementById('year-select')?.value;
        if (!currentYear) return;
        
        // Load data from localStorage
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        if (!data.years || !data.years[currentYear]) return;
        
        const yearData = data.years[currentYear];
        
        if (type === 'asset') {
            // Find the asset
            const asset = yearData.assets.find(a => a.id === id);
            if (!asset) {
                console.error('Asset not found');
                return;
            }
            
            // Create edit form
            const modalContent = `
                <h2>Edit Asset</h2>
                <div class="form-group">
                    <label for="edit-asset-category">Category:</label>
                    <select id="edit-asset-category">
                        <option value="Properties" ${asset.category === 'Properties' ? 'selected' : ''}>Properties</option>
                        <option value="Retirement Savings" ${asset.category === 'Retirement Savings' ? 'selected' : ''}>Retirement Savings</option>
                        <option value="Investments" ${asset.category === 'Investments' ? 'selected' : ''}>Investments</option>
                        <option value="Cash and Cash Equivalent" ${asset.category === 'Cash and Cash Equivalent' ? 'selected' : ''}>Cash and Cash Equivalent</option>
                        <option value="Other Assets" ${asset.category === 'Other Assets' ? 'selected' : ''}>Other Assets</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-asset-name">Item Name:</label>
                    <input type="text" id="edit-asset-name" value="${asset.name}" />
                </div>
                <div class="form-group">
                    <label for="edit-asset-value">Value (£):</label>
                    <input type="number" id="edit-asset-value" min="0" step="0.01" value="${asset.value}" />
                </div>
                <input type="hidden" id="edit-asset-id" value="${asset.id}" />
                <div class="form-actions">
                    <button id="cancel-edit-asset" class="cancel-btn">Cancel</button>
                    <button id="save-edit-asset" class="save-btn">Save Changes</button>
                </div>
            `;
            
            // Show modal
            if (window.showModal) {
                window.showModal(modalContent, 'edit-asset');
                
                // Add event listeners for the edit form
                const saveBtn = document.getElementById('save-edit-asset');
                if (saveBtn) {
                    saveBtn.addEventListener('click', function() {
                        const category = document.getElementById('edit-asset-category').value;
                        const name = document.getElementById('edit-asset-name').value;
                        const valueInput = document.getElementById('edit-asset-value').value;
                        const value = parseFloat(valueInput);
                        const assetId = document.getElementById('edit-asset-id').value;
                        
                        if (category && name && !isNaN(value) && value >= 0) {
                            // Find and update the asset
                            const assetIndex = yearData.assets.findIndex(a => a.id === assetId);
                            if (assetIndex !== -1) {
                                yearData.assets[assetIndex] = {
                                    id: assetId,
                                    category,
                                    name,
                                    value
                                };
                                
                                // Save to localStorage
                                localStorage.setItem('netWorthData', JSON.stringify(data));
                                
                                // Hide modal
                                if (window.hideModal) window.hideModal();
                                
                                // Refresh UI
                                renderFinancialTables(currentYear);
                                updateDashboardSummary();
                            }
                        } else {
                            alert('Please fill all fields with valid values');
                        }
                    });
                }
                
                const cancelBtn = document.getElementById('cancel-edit-asset');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', function() {
                        if (window.hideModal) window.hideModal();
                    });
                }
            }
        } else if (type === 'liability') {
            // Find the liability
            const liability = yearData.liabilities.find(l => l.id === id);
            if (!liability) {
                console.error('Liability not found');
                return;
            }
            
            // Create edit form
            const modalContent = `
                <h2>Edit Liability</h2>
                <div class="form-group">
                    <label for="edit-liability-category">Category:</label>
                    <select id="edit-liability-category">
                        <option value="Mortgages" ${liability.category === 'Mortgages' ? 'selected' : ''}>Mortgages</option>
                        <option value="Car loans" ${liability.category === 'Car loans' ? 'selected' : ''}>Car loans</option>
                        <option value="Student loans" ${liability.category === 'Student loans' ? 'selected' : ''}>Student loans</option>
                        <option value="Credit Card Debt" ${liability.category === 'Credit Card Debt' ? 'selected' : ''}>Credit Card Debt</option>
                        <option value="Personal Loans" ${liability.category === 'Personal Loans' ? 'selected' : ''}>Personal Loans</option>
                        <option value="Other Debts" ${liability.category === 'Other Debts' ? 'selected' : ''}>Other Debts</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-liability-value">Value (£):</label>
                    <input type="number" id="edit-liability-value" min="0" step="0.01" value="${liability.value}" />
                </div>
                <input type="hidden" id="edit-liability-id" value="${liability.id}" />
                <div class="form-actions">
                    <button id="cancel-edit-liability" class="cancel-btn">Cancel</button>
                    <button id="save-edit-liability" class="save-btn">Save Changes</button>
                </div>
            `;
            
            // Show modal
            if (window.showModal) {
                window.showModal(modalContent, 'edit-liability');
                
                // Add event listeners for the edit form
                const saveBtn = document.getElementById('save-edit-liability');
                if (saveBtn) {
                    saveBtn.addEventListener('click', function() {
                        const category = document.getElementById('edit-liability-category').value;
                        const valueInput = document.getElementById('edit-liability-value').value;
                        const value = parseFloat(valueInput);
                        const liabilityId = document.getElementById('edit-liability-id').value;
                        
                        if (category && !isNaN(value) && value >= 0) {
                            // Find and update the liability
                            const liabilityIndex = yearData.liabilities.findIndex(l => l.id === liabilityId);
                            if (liabilityIndex !== -1) {
                                yearData.liabilities[liabilityIndex] = {
                                    id: liabilityId,
                                    category,
                                    value
                                };
                                
                                // Save to localStorage
                                localStorage.setItem('netWorthData', JSON.stringify(data));
                                
                                // Hide modal
                                if (window.hideModal) window.hideModal();
                                
                                // Refresh UI
                                renderFinancialTables(currentYear);
                                updateDashboardSummary();
                            }
                        } else {
                            alert('Please fill all fields with valid values');
                        }
                    });
                }
                
                const cancelBtn = document.getElementById('cancel-edit-liability');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', function() {
                        if (window.hideModal) window.hideModal();
                    });
                }
            }
        }
    }
    
    // Function to delete an item
    function deleteItem(id, type) {
        console.log(`Deleting ${type} with id: ${id}`);
        
        const currentYear = document.getElementById('year-select')?.value;
        if (!currentYear) return;
        
        // Load data from localStorage
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        if (!data.years || !data.years[currentYear]) return;
        
        // Create confirmation modal
        const itemName = type === 'asset' ? 
            (data.years[currentYear].assets.find(a => a.id === id)?.name || 'this asset') : 
            (data.years[currentYear].liabilities.find(l => l.id === id)?.category || 'this liability');
        
        const modalContent = `
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete ${itemName}?</p>
            <input type="hidden" id="delete-item-id" value="${id}" />
            <input type="hidden" id="delete-item-type" value="${type}" />
            <div class="form-actions">
                <button id="cancel-delete" class="cancel-btn">Cancel</button>
                <button id="confirm-delete" class="danger-btn">Delete</button>
            </div>
        `;
        
        // Show modal
        if (window.showModal) {
            window.showModal(modalContent, 'delete-item');
            
            // Add event listeners for the confirmation
            const confirmBtn = document.getElementById('confirm-delete');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', function() {
                    const itemId = document.getElementById('delete-item-id').value;
                    const itemType = document.getElementById('delete-item-type').value;
                    
                    if (itemType === 'asset') {
                        // Find and remove the asset
                        data.years[currentYear].assets = data.years[currentYear].assets.filter(a => a.id !== itemId);
                    } else if (itemType === 'liability') {
                        // Find and remove the liability
                        data.years[currentYear].liabilities = data.years[currentYear].liabilities.filter(l => l.id !== itemId);
                    }
                    
                    // Save to localStorage
                    localStorage.setItem('netWorthData', JSON.stringify(data));
                    
                    // Hide modal
                    if (window.hideModal) window.hideModal();
                    
                    // Refresh UI
                    renderFinancialTables(currentYear);
                    updateDashboardSummary();
                });
            }
            
            const cancelBtn = document.getElementById('cancel-delete');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    if (window.hideModal) window.hideModal();
                });
            }
        }
    }
    
    // Function to update totals in the tables
    function updateTotals(year) {
        if (!year) return;
        
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        if (!data.years || !data.years[year]) return;
        
        const yearData = data.years[year];
        
        // Calculate assets total
        let assetsTotal = 0;
        if (yearData.assets && yearData.assets.length > 0) {
            assetsTotal = yearData.assets.reduce((total, asset) => total + parseFloat(asset.value), 0);
        }
        
        // Calculate liabilities total
        let liabilitiesTotal = 0;
        if (yearData.liabilities && yearData.liabilities.length > 0) {
            liabilitiesTotal = yearData.liabilities.reduce((total, liability) => total + parseFloat(liability.value), 0);
        }
        
        // Update assets total in UI
        const assetsTotalElement = document.getElementById('assets-total');
        if (assetsTotalElement) {
            assetsTotalElement.textContent = `£${assetsTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
        
        // Update liabilities total in UI
        const liabilitiesTotalElement = document.getElementById('liabilities-total');
        if (liabilitiesTotalElement) {
            liabilitiesTotalElement.textContent = `£${liabilitiesTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
    }
    
    // Function to update dashboard summary
    function updateDashboardSummary() {
        console.log('Updating dashboard summary');
        
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        if (!data.years) return;
        
        // Get the current year
        const currentYear = document.getElementById('year-select')?.value || new Date().getFullYear().toString();
        if (!data.years[currentYear]) return;
        
        // Calculate totals
        let assetsTotal = 0;
        let liabilitiesTotal = 0;
        
        if (data.years[currentYear].assets) {
            assetsTotal = data.years[currentYear].assets.reduce((total, asset) => total + parseFloat(asset.value), 0);
        }
        
        if (data.years[currentYear].liabilities) {
            liabilitiesTotal = data.years[currentYear].liabilities.reduce((total, liability) => total + parseFloat(liability.value), 0);
        }
        
        const netWorth = assetsTotal - liabilitiesTotal;
        const debtRatio = assetsTotal > 0 ? (liabilitiesTotal / assetsTotal) * 100 : 0;
        
        // Calculate percentage change from previous year
        let percentChange = 0;
        let changeText = '+0% from last year';
        
        // Get all years and sort them
        const years = Object.keys(data.years).sort();
        const currentYearIndex = years.indexOf(currentYear);
        
        if (currentYearIndex > 0) {
            const previousYear = years[currentYearIndex - 1];
            const prevYearData = data.years[previousYear];
            
            let prevAssetsTotal = 0;
            let prevLiabilitiesTotal = 0;
            
            if (prevYearData.assets) {
                prevAssetsTotal = prevYearData.assets.reduce((total, asset) => total + parseFloat(asset.value), 0);
            }
            
            if (prevYearData.liabilities) {
                prevLiabilitiesTotal = prevYearData.liabilities.reduce((total, liability) => total + parseFloat(liability.value), 0);
            }
            
            const prevNetWorth = prevAssetsTotal - prevLiabilitiesTotal;
            
            if (prevNetWorth !== 0) {
                percentChange = ((netWorth - prevNetWorth) / Math.abs(prevNetWorth)) * 100;
                const sign = percentChange >= 0 ? '+' : '';
                changeText = `${sign}${percentChange.toFixed(1)}% from ${previousYear}`;
            }
        }
        
        // Update UI elements
        const netWorthElement = document.getElementById('current-net-worth');
        if (netWorthElement) {
            netWorthElement.textContent = `£${netWorth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
        
        const netWorthChangeElement = document.getElementById('net-worth-change');
        if (netWorthChangeElement) {
            netWorthChangeElement.textContent = changeText;
            
            // Add color based on change direction
            if (percentChange > 0) {
                netWorthChangeElement.classList.add('positive-change');
                netWorthChangeElement.classList.remove('negative-change');
            } else if (percentChange < 0) {
                netWorthChangeElement.classList.add('negative-change');
                netWorthChangeElement.classList.remove('positive-change');
            } else {
                netWorthChangeElement.classList.remove('positive-change');
                netWorthChangeElement.classList.remove('negative-change');
            }
        }
        
        const assetsElement = document.getElementById('total-assets');
        if (assetsElement) {
            assetsElement.textContent = `£${assetsTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
        
        const liabilitiesElement = document.getElementById('total-liabilities');
        if (liabilitiesElement) {
            liabilitiesElement.textContent = `£${liabilitiesTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
        
        const debtRatioElement = document.getElementById('debt-asset-ratio');
        if (debtRatioElement) {
            debtRatioElement.textContent = `${debtRatio.toFixed(1)}%`;
        }
        
        const debtRatioBar = document.getElementById('debt-ratio-bar');
        if (debtRatioBar) {
            debtRatioBar.style.width = `${Math.min(debtRatio, 100)}%`;
        }
        
        // Render charts with updated data
        renderDashboardCharts();
    }
    
    // Function to render charts on dashboard
    function renderDashboardCharts() {
        console.log('Rendering dashboard charts');
        
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        if (!data.years || Object.keys(data.years).length === 0) {
            console.log('No data for charts');
            return;
        }
        
        renderNetWorthChart(data);
        renderAssetDiversityChart(data);
    }
    
    // Expose function globally so it can be called from other scripts
    window.renderDashboardCharts = renderDashboardCharts;
    
    // Function to render Net Worth History chart
    function renderNetWorthChart(data) {
        // Get the canvas element
        const chartCanvas = document.getElementById('net-worth-chart');
        if (!chartCanvas) {
            console.log('Net worth chart canvas not found');
            return;
        }
        
        // Get all years and sort them chronologically
        const years = Object.keys(data.years).sort();
        
        // Prepare data for chart
        const netWorthData = [];
        const assetsData = [];
        const liabilitiesData = [];
        
        years.forEach(year => {
            const yearData = data.years[year];
            
            let assetsTotal = 0;
            if (yearData.assets) {
                assetsTotal = yearData.assets.reduce((total, asset) => total + parseFloat(asset.value), 0);
            }
            
            let liabilitiesTotal = 0;
            if (yearData.liabilities) {
                liabilitiesTotal = yearData.liabilities.reduce((total, liability) => total + parseFloat(liability.value), 0);
            }
            
            const netWorth = assetsTotal - liabilitiesTotal;
            
            netWorthData.push(netWorth);
            assetsData.push(assetsTotal);
            liabilitiesData.push(liabilitiesTotal);
        });
        
        // Check if we already have a chart instance and destroy it
        if (window.netWorthChart instanceof Chart) {
            window.netWorthChart.destroy();
        }
        
        // Create new chart
        window.netWorthChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Net Worth',
                        data: netWorthData,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        type: 'line',
                        fill: false,
                        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.1,
                        order: 0
                    },
                    {
                        label: 'Assets',
                        data: assetsData,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        order: 1
                    },
                    {
                        label: 'Liabilities',
                        data: liabilitiesData,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        order: 2
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
                                return '£' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += '£' + context.parsed.y.toLocaleString();
                                return label;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false,
                        text: 'Net Worth History'
                    }
                }
            }
        });
    }
    
    // Function to render Asset Diversity chart
    function renderAssetDiversityChart(data) {
        // Get the canvas element
        const chartCanvas = document.getElementById('asset-diversity-chart');
        if (!chartCanvas) {
            console.log('Asset diversity chart canvas not found');
            return;
        }
        
        // Get current year
        const currentYear = document.getElementById('year-select')?.value || 
                           new Date().getFullYear().toString();
                            
        if (!data.years[currentYear]) {
            console.log('No data for current year');
            return;
        }
        
        const yearData = data.years[currentYear];
        
        // Prepare data for chart
        const assetCategories = {};
        
        // Group assets by category
        if (yearData.assets && yearData.assets.length > 0) {
            yearData.assets.forEach(asset => {
                const category = asset.category || 'Other';
                if (!assetCategories[category]) {
                    assetCategories[category] = 0;
                }
                assetCategories[category] += parseFloat(asset.value);
            });
        }
        
        const categories = Object.keys(assetCategories);
        const values = categories.map(category => assetCategories[category]);
        
        // If no assets, show empty message
        if (categories.length === 0) {
            if (window.assetDiversityChart instanceof Chart) {
                window.assetDiversityChart.destroy();
            }
            
            // Create empty chart
            window.assetDiversityChart = new Chart(chartCanvas, {
                type: 'pie',
                data: {
                    labels: ['No Assets'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['#e0e0e0'],
                        borderWidth: 0
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
                                label: function() {
                                    return 'No assets data available';
                                }
                            }
                        }
                    }
                }
            });
            return;
        }
        
        // Chart colors - a nice palette for visualization
        const backgroundColors = [
            'rgba(54, 162, 235, 0.8)',  // Blue
            'rgba(75, 192, 192, 0.8)',   // Teal
            'rgba(153, 102, 255, 0.8)',  // Purple
            'rgba(255, 159, 64, 0.8)',   // Orange
            'rgba(255, 99, 132, 0.8)',   // Red
            'rgba(255, 205, 86, 0.8)',   // Yellow
            'rgba(201, 203, 207, 0.8)',  // Grey
            'rgba(100, 162, 100, 0.8)',  // Green
            'rgba(162, 100, 162, 0.8)'   // Pink
        ];
        
        // Check if we already have a chart instance and destroy it
        if (window.assetDiversityChart instanceof Chart) {
            window.assetDiversityChart.destroy();
        }
        
        // Create new chart
        window.assetDiversityChart = new Chart(chartCanvas, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: values,
                    backgroundColor: backgroundColors.slice(0, categories.length),
                    borderColor: 'white',
                    borderWidth: 2
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
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: £${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Function to render charts on trends page
    function renderTrendsCharts() {
        console.log('Rendering trends charts');
        
        try {
            // Get data from localStorage
            const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
            
            // Validate data structure
            if (!data.years) {
                console.log('No years data for trends charts');
                return;
            }
            
            // Check for empty string key in years and remove it
            if (data.years['']) {
                console.log('Found empty year key in data, removing it');
                delete data.years[''];
                // Save the corrected data back to localStorage
                localStorage.setItem('netWorthData', JSON.stringify(data));
            }
            
            // Check if there are any valid years
            const validYears = Object.keys(data.years).filter(year => year && year.trim() !== '');
            if (validYears.length === 0) {
                console.log('No valid years for trends charts');
                return;
            }
            
            console.log('Data available for trend charts:', validYears);
            
            // Render each chart, with separate try-catch for each
            try {
                renderNetWorthGrowthChart(data);
            } catch (error) {
                console.error('Error rendering net worth growth chart:', error);
            }
            
            try {
                renderAssetCategoriesOverTimeChart(data);
            } catch (error) {
                console.error('Error rendering asset categories chart:', error);
            }
            
            try {
                renderGrowthVsBenchmarksChart(data);
            } catch (error) {
                console.error('Error rendering growth vs benchmarks chart:', error);
            }
            
            console.log('All trend charts rendering complete');
        } catch (error) {
            console.error('Error in renderTrendsCharts:', error);
        }
    }
    
    // Expose function globally so it can be called from other scripts
    window.renderTrendsCharts = renderTrendsCharts;
    
    // Function to render Net Worth Growth chart (Line chart with growth percentage)
    function renderNetWorthGrowthChart(data) {
        const chartCanvas = document.getElementById('net-worth-growth-chart');
        if (!chartCanvas) {
            console.log('Net worth growth chart canvas not found');
            return;
        }
        
        // Get years and sort chronologically, filtering out any empty strings
        const years = Object.keys(data.years)
            .filter(year => year && year.trim() !== '')
            .sort();
        console.log('Years for net worth growth chart (after filtering):', years);
        
        // Need at least 2 years for growth analysis
        if (years.length < 2) {
            if (window.netWorthGrowthChart instanceof Chart) {
                window.netWorthGrowthChart.destroy();
            }
            
            // Show message for insufficient data
            window.netWorthGrowthChart = new Chart(chartCanvas, {
                type: 'bar',
                data: {
                    labels: ['Insufficient Data'],
                    datasets: [{
                        data: [0],
                        backgroundColor: '#e0e0e0'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function() {
                                    return 'Need at least 2 years of data';
                                }
                            }
                        }
                    }
                }
            });
            return;
        }
        
        // Calculate net worth for each year
        const netWorthData = [];
        const growthRates = [];
        
        // For each year, calculate net worth
        years.forEach((year, index) => {
            const yearData = data.years[year];
            
            let assetsTotal = 0;
            if (yearData && yearData.assets) {
                assetsTotal = yearData.assets.reduce((total, asset) => total + parseFloat(asset.value), 0);
            }
            
            let liabilitiesTotal = 0;
            if (yearData && yearData.liabilities) {
                liabilitiesTotal = yearData.liabilities.reduce((total, liability) => total + parseFloat(liability.value), 0);
            }
            
            const netWorth = assetsTotal - liabilitiesTotal;
            netWorthData.push(netWorth);
            
            // Calculate growth rate (year-over-year percentage change)
            if (index > 0) {
                const previousNetWorth = netWorthData[index - 1];
                if (previousNetWorth !== 0) {
                    const growthRate = ((netWorth - previousNetWorth) / Math.abs(previousNetWorth)) * 100;
                    growthRates.push(growthRate);
                } else {
                    growthRates.push(0);
                }
            } else {
                // First year has no growth rate
                growthRates.push(null);
            }
        });
        
        // Check if we already have a chart instance and destroy it
        if (window.netWorthGrowthChart instanceof Chart) {
            window.netWorthGrowthChart.destroy();
        }
        
        // Create new chart with two y-axes: one for net worth, one for growth rate
        window.netWorthGrowthChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Net Worth',
                        data: netWorthData,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        yAxisID: 'y',
                        fill: true,
                        tension: 0.1
                    },
                    {
                        label: 'Growth Rate (%)',
                        data: growthRates,
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
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Net Worth (£)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '£' + value.toLocaleString();
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Growth Rate (%)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + '%';
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
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.datasetIndex === 0) {
                                    label += '£' + context.parsed.y.toLocaleString();
                                } else {
                                    if (context.parsed.y !== null) {
                                        label += context.parsed.y.toFixed(1) + '%';
                                    } else {
                                        label += 'N/A';
                                    }
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Function to render Asset Categories Over Time chart (Stacked area chart)
    function renderAssetCategoriesOverTimeChart(data) {
        console.log('Attempting to render asset categories time chart');
        const chartCanvas = document.getElementById('asset-categories-time-chart');
        if (!chartCanvas) {
            console.error('Asset categories time chart canvas not found, ID: asset-categories-time-chart');
            return;
        }
        
        // Get years and sort chronologically, filtering out any empty strings
        const years = Object.keys(data.years)
            .filter(year => year && year.trim() !== '')
            .sort();
        console.log('Years for asset categories chart (after filtering):', years);
        
        if (years.length === 0) {
            console.log('No years data available for asset categories chart');
            if (window.assetCategoriesTimeChart instanceof Chart) {
                window.assetCategoriesTimeChart.destroy();
            }
            
            // Show message for no data
            window.assetCategoriesTimeChart = new Chart(chartCanvas, {
                type: 'bar',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        data: [0],
                        backgroundColor: '#e0e0e0'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function() {
                                    return 'No data available';
                                }
                            }
                        }
                    }
                }
            });
            return;
        }
        
        // Find all unique asset categories across all years
        const uniqueCategories = new Set();
        years.forEach(year => {
            const yearData = data.years[year];
            if (yearData && yearData.assets) {
                yearData.assets.forEach(asset => {
                    uniqueCategories.add(asset.category || 'Other');
                });
            }
        });
        
        const categories = Array.from(uniqueCategories).sort();
        console.log('Asset categories found:', categories);
        
        // Chart colors - a nice palette for visualization
        const backgroundColors = [
            'rgba(54, 162, 235, 0.7)',  // Blue
            'rgba(75, 192, 192, 0.7)',   // Teal
            'rgba(153, 102, 255, 0.7)',  // Purple
            'rgba(255, 159, 64, 0.7)',   // Orange
            'rgba(255, 99, 132, 0.7)',   // Red
            'rgba(255, 205, 86, 0.7)',   // Yellow
            'rgba(201, 203, 207, 0.7)',  // Grey
            'rgba(100, 162, 100, 0.7)',  // Green
            'rgba(162, 100, 162, 0.7)'   // Pink
        ];
        
        const borderColors = [
            'rgba(54, 162, 235, 1)',  // Blue
            'rgba(75, 192, 192, 1)',   // Teal
            'rgba(153, 102, 255, 1)',  // Purple
            'rgba(255, 159, 64, 1)',   // Orange
            'rgba(255, 99, 132, 1)',   // Red
            'rgba(255, 205, 86, 1)',   // Yellow
            'rgba(201, 203, 207, 1)',  // Grey
            'rgba(100, 162, 100, 1)',  // Green
            'rgba(162, 100, 162, 1)'   // Pink
        ];
        
        // Prepare datasets for each category
        const datasets = [];
        
        categories.forEach((category, index) => {
            const categoryData = [];
            
            years.forEach(year => {
                const yearData = data.years[year];
                let categoryTotal = 0;
                
                if (yearData && yearData.assets) {
                    yearData.assets.forEach(asset => {
                        if ((asset.category || 'Other') === category) {
                            categoryTotal += parseFloat(asset.value);
                        }
                    });
                }
                
                categoryData.push(categoryTotal);
            });
            
            datasets.push({
                label: category,
                data: categoryData,
                backgroundColor: backgroundColors[index % backgroundColors.length],
                borderColor: borderColors[index % borderColors.length],
                borderWidth: 1,
                fill: true
            });
        });
        
        // Check if we already have a chart instance and destroy it
        if (window.assetCategoriesTimeChart instanceof Chart) {
            window.assetCategoriesTimeChart.destroy();
        }
        
        // Create new stacked area chart
        window.assetCategoriesTimeChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: years,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Value (£)'
                        },
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
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += '£' + context.parsed.y.toLocaleString();
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Function to render Growth vs Benchmarks chart (Comparison line chart)
    function renderGrowthVsBenchmarksChart(data) {
        console.log('Attempting to render growth vs benchmarks chart');
        const chartCanvas = document.getElementById('growth-vs-benchmarks-chart');
        if (!chartCanvas) {
            console.error('Growth vs benchmarks chart canvas not found, ID: growth-vs-benchmarks-chart');
            return;
        }
        
        // Get years and sort chronologically, filtering out any empty strings
        const years = Object.keys(data.years)
            .filter(year => year && year.trim() !== '')
            .sort();
        console.log('Years for benchmarks chart (after filtering):', years);
        
        // Need at least 2 years for growth comparison
        if (years.length < 2) {
            console.log('Not enough years (need at least 2) for benchmarks chart');
            if (window.growthVsBenchmarksChart instanceof Chart) {
                window.growthVsBenchmarksChart.destroy();
            }
            
            // Show message for insufficient data
            window.growthVsBenchmarksChart = new Chart(chartCanvas, {
                type: 'bar',
                data: {
                    labels: ['Insufficient Data'],
                    datasets: [{
                        data: [0],
                        backgroundColor: '#e0e0e0'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function() {
                                    return 'Need at least 2 years of data';
                                }
                            }
                        }
                    }
                }
            });
            return;
        }
        
        // Calculate net worth for each year
        const netWorthValues = [];
        
        years.forEach(year => {
            const yearData = data.years[year];
            
            let assetsTotal = 0;
            if (yearData && yearData.assets) {
                assetsTotal = yearData.assets.reduce((total, asset) => total + parseFloat(asset.value), 0);
            }
            
            let liabilitiesTotal = 0;
            if (yearData && yearData.liabilities) {
                liabilitiesTotal = yearData.liabilities.reduce((total, liability) => total + parseFloat(liability.value), 0);
            }
            
            const netWorth = assetsTotal - liabilitiesTotal;
            netWorthValues.push(netWorth);
        });
        
        // Calculate indexed growth (first year = 100)
        const indexedNetWorth = [];
        const startValue = netWorthValues[0];
        
        if (startValue <= 0) {
            // Can't calculate proper index if starting with negative or zero net worth
            if (window.growthVsBenchmarksChart instanceof Chart) {
                window.growthVsBenchmarksChart.destroy();
            }
            
            window.growthVsBenchmarksChart = new Chart(chartCanvas, {
                type: 'bar',
                data: {
                    labels: ['Invalid Starting Point'],
                    datasets: [{
                        data: [0],
                        backgroundColor: '#e0e0e0'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function() {
                                    return 'Starting net worth must be positive';
                                }
                            }
                        }
                    }
                }
            });
            return;
        }
        
        netWorthValues.forEach(value => {
            indexedNetWorth.push((value / startValue) * 100);
        });
        
        // Create benchmark datasets
        // Benchmark 1: 5% annual growth
        const benchmark5Percent = [100];
        // Benchmark 2: 10% annual growth
        const benchmark10Percent = [100];
        
        for (let i = 1; i < years.length; i++) {
            benchmark5Percent.push(benchmark5Percent[0] * Math.pow(1.05, i));
            benchmark10Percent.push(benchmark10Percent[0] * Math.pow(1.10, i));
        }
        
        // Check if we already have a chart instance and destroy it
        if (window.growthVsBenchmarksChart instanceof Chart) {
            window.growthVsBenchmarksChart.destroy();
        }
        
        // Create new chart
        window.growthVsBenchmarksChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Your Net Worth',
                        data: indexedNetWorth,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: false,
                        tension: 0.1,
                        borderWidth: 3,
                        pointRadius: 4
                    },
                    {
                        label: '5% Annual Growth',
                        data: benchmark5Percent,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: '10% Annual Growth',
                        data: benchmark10Percent,
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderDash: [3, 3],
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Indexed Value (Year 1 = 100)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(0);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.parsed.y.toFixed(1);
                                return label;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Growth Comparison (Indexed to 100)'
                    }
                }
            }
        });
    }
    
    // Function to render milestones
    function renderMilestones() {
        console.log('Rendering milestones');
        
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        if (!data.milestones) return;
        
        const milestonesList = document.getElementById('milestones-list');
        if (!milestonesList) {
            console.log('Milestones list element not found');
            return;
        }
        
        // Clear existing milestones
        milestonesList.innerHTML = '';
        
        // Get current net worth
        const currentYear = new Date().getFullYear().toString();
        let netWorth = 0;
        
        if (data.years && data.years[currentYear]) {
            const assetsTotal = data.years[currentYear].assets.reduce((sum, asset) => sum + asset.value, 0);
            const liabilitiesTotal = data.years[currentYear].liabilities.reduce((sum, liability) => sum + liability.value, 0);
            netWorth = assetsTotal - liabilitiesTotal;
        }
        
        // Sort milestones by amount (ascending)
        const sortedMilestones = [...data.milestones].sort((a, b) => a.amount - b.amount);
        
        if (sortedMilestones.length === 0) {
            milestonesList.innerHTML = '<div class="empty-list">No milestones added yet</div>';
            return;
        }
        
        // Render each milestone
        sortedMilestones.forEach(milestone => {
            const achieved = netWorth >= milestone.amount;
            
            const milestoneElement = document.createElement('div');
            milestoneElement.className = `milestone ${achieved ? 'achieved' : ''}`;
            milestoneElement.dataset.id = milestone.id;
            
            milestoneElement.innerHTML = `
                <div class="milestone-status">
                    <div class="milestone-icon">
                        ${achieved ? '✓' : '○'}
                    </div>
                </div>
                <div class="milestone-details">
                    <h4>${milestone.name}</h4>
                    <p>Target: £${milestone.amount.toLocaleString()}</p>
                </div>
                <div class="milestone-actions">
                    <button class="delete-milestone-btn" data-id="${milestone.id}">
                        <i class="fas fa-times"></i> Delete
                    </button>
                </div>
            `;
            
            milestonesList.appendChild(milestoneElement);
        });
        
        // Set up delete buttons
        document.querySelectorAll('.delete-milestone-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                deleteMilestone(id);
            });
        });
    }
    
    // Function to delete a milestone
    function deleteMilestone(id) {
        console.log(`Deleting milestone with id: ${id}`);
        
        // Load data from localStorage
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        if (!data.milestones) return;
        
        // Create confirmation modal
        const milestoneName = data.milestones.find(m => m.id === id)?.name || 'this milestone';
        
        const modalContent = `
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete ${milestoneName}?</p>
            <input type="hidden" id="delete-milestone-id" value="${id}" />
            <div class="form-actions">
                <button id="cancel-delete-milestone" class="cancel-btn">Cancel</button>
                <button id="confirm-delete-milestone" class="danger-btn">Delete</button>
            </div>
        `;
        
        // Show modal
        if (window.showModal) {
            window.showModal(modalContent, 'delete-milestone');
            
            // Add event listeners for the confirmation
            const confirmBtn = document.getElementById('confirm-delete-milestone');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', function() {
                    const milestoneId = document.getElementById('delete-milestone-id').value;
                    
                    // Remove the milestone
                    data.milestones = data.milestones.filter(m => m.id !== milestoneId);
                    
                    // Save to localStorage
                    localStorage.setItem('netWorthData', JSON.stringify(data));
                    
                    // Hide modal
                    if (window.hideModal) window.hideModal();
                    
                    // Refresh UI
                    renderMilestones();
                });
            }
            
            const cancelBtn = document.getElementById('cancel-delete-milestone');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    if (window.hideModal) window.hideModal();
                });
            }
        }
    }
    
    // Function to render the salary table
    function renderSalaryTable() {
        console.log('Rendering salary table');
        
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        if (!data.salaryHistory) return;
        
        const salaryTableBody = document.querySelector('#salary-table tbody');
        if (!salaryTableBody) {
            console.log('Salary table element not found');
            return;
        }
        
        // Clear existing rows
        salaryTableBody.innerHTML = '';
        
        // Get salary history data
        const salaryEntries = data.salaryHistory;
        
        // If no salary entries, show empty message
        if (salaryEntries.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="5" class="empty-table">No salary entries added yet. Click "Add Salary" to get started.</td>`;
            salaryTableBody.appendChild(emptyRow);
            return;
        }
        
        // Sort entries by date (most recent first)
        const sortedEntries = [...salaryEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Add row for each salary entry
        sortedEntries.forEach(entry => {
            const row = document.createElement('tr');
            row.className = 'salary-entry';
            row.dataset.id = entry.id;
            
            // Format the date
            let dateStr = entry.date;
            if (typeof entry.date === 'string') {
                dateStr = new Date(entry.date).toLocaleDateString('en-GB', { 
                    month: 'short', 
                    year: 'numeric' 
                });
            } else {
                dateStr = 'Invalid Date';
            }
            
            row.innerHTML = `
                <td>${dateStr}</td>
                <td>${entry.company}</td>
                <td>£${parseFloat(entry.amount).toLocaleString()}</td>
                <td>${entry.increasePercent.toFixed(1)}%</td>
                <td class="item-actions">
                    <button class="edit-salary-btn" data-id="${entry.id}">Edit</button>
                    <button class="delete-salary-btn" data-id="${entry.id}">Delete</button>
                </td>
            `;
            
            salaryTableBody.appendChild(row);
        });
        
        // Set up edit and delete buttons
        document.querySelectorAll('.edit-salary-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                editSalaryEntry(id);
            });
        });
        
        document.querySelectorAll('.delete-salary-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                deleteSalaryEntry(id);
            });
        });
        
        // Update salary chart if available
        setTimeout(() => {
            renderSalaryChart();
        }, 100);
    }
    
    // Function to edit a salary entry
    function editSalaryEntry(id) {
        console.log(`Editing salary entry with id: ${id}`);
        
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        if (!data.salaryHistory) return;
        
        const entry = data.salaryHistory.find(entry => entry.id === id);
        if (!entry) {
            console.log(`Salary entry with id ${id} not found`);
            return;
        }
        
        // Format date for input (YYYY-MM)
        const date = new Date(entry.date);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const modalContent = `
            <h2>Edit Salary Entry</h2>
            <div class="form-group">
                <label for="edit-salary-date">Date (Month/Year):</label>
                <input type="month" id="edit-salary-date" value="${formattedDate}" />
            </div>
            <div class="form-group">
                <label for="edit-salary-company">Company:</label>
                <input type="text" id="edit-salary-company" value="${entry.company}" />
            </div>
            <div class="form-group">
                <label for="edit-salary-amount">Salary (£):</label>
                <input type="number" id="edit-salary-amount" min="0" step="0.01" value="${entry.amount}" />
            </div>
            <div class="form-actions">
                <button id="cancel-edit-salary" class="cancel-btn">Cancel</button>
                <button id="save-edit-salary" class="save-btn">Save Changes</button>
                <button id="delete-salary" class="danger-btn">Delete</button>
            </div>
        `;
        
        // Show the modal
        window.showModal(modalContent, 'edit-salary');
        
        // Set up event handlers
        document.getElementById('save-edit-salary').addEventListener('click', () => {
            const dateInput = document.getElementById('edit-salary-date').value;
            const company = document.getElementById('edit-salary-company').value;
            const amountInput = document.getElementById('edit-salary-amount').value;
            const amount = parseFloat(amountInput);
            
            if (dateInput && company && !isNaN(amount) && amount >= 0) {
                // Convert the input (YYYY-MM) to a Date object
                const date = new Date(dateInput);
                
                // Update the entry
                entry.date = date;
                entry.company = company;
                entry.amount = amount;
                
                // Sort entries by date (most recent first)
                data.salaryHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                // Recalculate increase percentages
                for (let i = 0; i < data.salaryHistory.length; i++) {
                    if (i === data.salaryHistory.length - 1) {
                        // First (oldest) entry has no previous to compare to
                        data.salaryHistory[i].increasePercent = 0;
                    } else {
                        const currentSalary = data.salaryHistory[i].amount;
                        const previousSalary = data.salaryHistory[i + 1].amount;
                        data.salaryHistory[i].increasePercent = ((currentSalary - previousSalary) / previousSalary) * 100;
                    }
                }
                
                // Save the updated data
                localStorage.setItem('netWorthData', JSON.stringify(data));
                
                // Hide the modal
                window.hideModal();
                
                // Render the updated table
                renderSalaryTable();
            } else {
                alert('Please fill all fields with valid values');
            }
        });
        
        document.getElementById('delete-salary').addEventListener('click', () => {
            // Call the delete function and close the modal
            deleteSalaryEntry(id);
            window.hideModal();
        });
    }
    
    // Function to delete a salary entry
    function deleteSalaryEntry(id) {
        console.log(`Deleting salary entry with id: ${id}`);
        
        const confirmDelete = confirm('Are you sure you want to delete this salary entry?');
        if (!confirmDelete) return;
        
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        if (!data.salaryHistory) return;
        
        // Remove the entry
        const initialLength = data.salaryHistory.length;
        data.salaryHistory = data.salaryHistory.filter(entry => entry.id !== id);
        
        if (initialLength !== data.salaryHistory.length) {
            // Recalculate all increase percentages if entries remain
            if (data.salaryHistory.length > 0) {
                // Ensure entries are sorted by date (newest first)
                data.salaryHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                for (let i = 0; i < data.salaryHistory.length; i++) {
                    if (i === data.salaryHistory.length - 1) {
                        // First (oldest) entry has no previous to compare to
                        data.salaryHistory[i].increasePercent = 0;
                    } else {
                        const currentSalary = data.salaryHistory[i].amount;
                        const previousSalary = data.salaryHistory[i + 1].amount;
                        data.salaryHistory[i].increasePercent = ((currentSalary - previousSalary) / previousSalary) * 100;
                    }
                }
            }
            
            // Save the updated data
            localStorage.setItem('netWorthData', JSON.stringify(data));
            
            // Render the updated table
            renderSalaryTable();
        }
    }
    
    // Function to render the salary chart
    function renderSalaryChart() {
        console.log('Rendering salary chart');
        
        const chartCanvas = document.getElementById('salary-growth-chart');
        if (!chartCanvas) {
            console.log('Salary chart canvas not found');
            return;
        }
        
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        if (!data.salaryHistory || data.salaryHistory.length === 0) {
            // No data to display
            return;
        }
        
        // Sort by date (oldest first for the chart)
        const sortedEntries = [...data.salaryHistory]
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Prepare chart data
        const chartData = {
            labels: sortedEntries.map(entry => {
                const date = new Date(entry.date);
                return `${date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
            }),
            data: sortedEntries.map(entry => entry.amount)
        };
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        
        // Check if a chart instance already exists
        if (window.salaryChart) {
            // Update existing chart
            window.salaryChart.data.labels = chartData.labels;
            window.salaryChart.data.datasets[0].data = chartData.data;
            window.salaryChart.update();
        } else {
            // Create new chart
            window.salaryChart = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Salary',
                        data: chartData.data,
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
    }
    
    // Setup budgeting functionality
    function setupBudgetingCalculators() {
        const calculateBudgetBtn = document.getElementById('calculate-budget');
        const calculateJointBtn = document.getElementById('calculate-joint');
        const contributionTypeSelect = document.getElementById('contribution-type');
        const customSplitContainer = document.getElementById('custom-split-container');
        
        // Setup budgeting localStorage
        let budgetData = JSON.parse(localStorage.getItem('budgetData') || '{}');
        
        // Restore previous values if available
        if (budgetData.yourIncome) {
            document.getElementById('your-income').value = budgetData.yourIncome;
        }
        if (budgetData.spouseIncome) {
            document.getElementById('spouse-income').value = budgetData.spouseIncome;
        }
        if (budgetData.jointExpenses) {
            document.getElementById('joint-expenses').value = budgetData.jointExpenses;
        }
        if (budgetData.contributionType) {
            document.getElementById('contribution-type').value = budgetData.contributionType;
            if (budgetData.contributionType === 'custom' && budgetData.customSplit) {
                document.getElementById('your-split').value = budgetData.customSplit;
                customSplitContainer.style.display = 'block';
            }
        }
        
        // Show contribution method
        contributionTypeSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customSplitContainer.style.display = 'block';
            } else {
                customSplitContainer.style.display = 'none';
            }
        });
        
        // Calculate initial income contribution percentages
        calculateBudgetBtn.addEventListener('click', function() {
            const yourIncome = parseFloat(document.getElementById('your-income').value) || 0;
            const spouseIncome = parseFloat(document.getElementById('spouse-income').value) || 0;
            
            if (yourIncome === 0 && spouseIncome === 0) {
                alert('Please enter at least one income value.');
                return;
            }
            
            // Calculate totals and percentages
            const totalIncome = yourIncome + spouseIncome;
            const yourPercentage = (yourIncome / totalIncome) * 100;
            const spousePercentage = (spouseIncome / totalIncome) * 100;
            
            // Display results
            document.getElementById('total-income').textContent = formatCurrency(totalIncome);
            document.getElementById('your-contribution').textContent = formatCurrency(yourIncome);
            document.getElementById('your-percentage').textContent = yourPercentage.toFixed(1) + '%';
            document.getElementById('spouse-contribution').textContent = formatCurrency(spouseIncome);
            document.getElementById('spouse-percentage').textContent = spousePercentage.toFixed(1) + '%';
            
            // Show results section
            document.getElementById('budget-results').style.display = 'block';
            
            // Save to localStorage
            budgetData.yourIncome = yourIncome;
            budgetData.spouseIncome = spouseIncome;
            budgetData.totalIncome = totalIncome;
            budgetData.yourPercentage = yourPercentage;
            budgetData.spousePercentage = spousePercentage;
            localStorage.setItem('budgetData', JSON.stringify(budgetData));
        });
        
        // Calculate joint account contributions
        calculateJointBtn.addEventListener('click', function() {
            if (!budgetData.totalIncome) {
                alert('Please calculate your income contributions first.');
                return;
            }
            
            const jointExpenses = parseFloat(document.getElementById('joint-expenses').value) || 0;
            if (jointExpenses === 0) {
                alert('Please enter your joint monthly expenses.');
                return;
            }
            
            const contributionType = document.getElementById('contribution-type').value;
            let yourTransfer = 0;
            let spouseTransfer = 0;
            
            switch (contributionType) {
                case 'equal':
                    // Split 50/50
                    yourTransfer = jointExpenses / 2;
                    spouseTransfer = jointExpenses / 2;
                    break;
                    
                case 'proportional':
                    // Split proportional to income
                    yourTransfer = (budgetData.yourPercentage / 100) * jointExpenses;
                    spouseTransfer = (budgetData.spousePercentage / 100) * jointExpenses;
                    break;
                    
                case 'custom':
                    // Custom split based on user input
                    const customSplit = parseFloat(document.getElementById('your-split').value) || 50;
                    yourTransfer = (customSplit / 100) * jointExpenses;
                    spouseTransfer = ((100 - customSplit) / 100) * jointExpenses;
                    budgetData.customSplit = customSplit;
                    break;
            }
            
            // Display results
            document.getElementById('total-expenses').textContent = formatCurrency(jointExpenses);
            document.getElementById('your-transfer').textContent = formatCurrency(yourTransfer);
            document.getElementById('spouse-transfer').textContent = formatCurrency(spouseTransfer);
            
            // Show joint results section
            document.getElementById('joint-results').style.display = 'block';
            
            // Save to localStorage
            budgetData.jointExpenses = jointExpenses;
            budgetData.contributionType = contributionType;
            budgetData.yourTransfer = yourTransfer;
            budgetData.spouseTransfer = spouseTransfer;
            localStorage.setItem('budgetData', JSON.stringify(budgetData));
            
            // Draw or update chart
            renderJointExpensesChart(yourTransfer, spouseTransfer);
        });
        
        // Run calculations again if data was previously entered
        if (budgetData.totalIncome) {
            document.getElementById('total-income').textContent = formatCurrency(budgetData.totalIncome);
            document.getElementById('your-contribution').textContent = formatCurrency(budgetData.yourIncome || 0);
            document.getElementById('your-percentage').textContent = (budgetData.yourPercentage || 0).toFixed(1) + '%';
            document.getElementById('spouse-contribution').textContent = formatCurrency(budgetData.spouseIncome || 0);
            document.getElementById('spouse-percentage').textContent = (budgetData.spousePercentage || 0).toFixed(1) + '%';
            document.getElementById('budget-results').style.display = 'block';
            
            if (budgetData.jointExpenses) {
                document.getElementById('total-expenses').textContent = formatCurrency(budgetData.jointExpenses);
                document.getElementById('your-transfer').textContent = formatCurrency(budgetData.yourTransfer || 0);
                document.getElementById('spouse-transfer').textContent = formatCurrency(budgetData.spouseTransfer || 0);
                document.getElementById('joint-results').style.display = 'block';
                
                // Draw chart on page load if data exists
                renderJointExpensesChart(budgetData.yourTransfer || 0, budgetData.spouseTransfer || 0);
            }
        }
    }
    
    function renderJointExpensesChart(yourTransfer, spouseTransfer) {
        const ctx = document.getElementById('joint-expenses-chart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (window.jointExpensesChart) {
            window.jointExpensesChart.destroy();
        }
        
        window.jointExpensesChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Your Contribution', 'Partner\'s Contribution'],
                datasets: [{
                    data: [yourTransfer, spouseTransfer],
                    backgroundColor: [
                        'rgba(58, 123, 213, 0.7)',
                        'rgba(255, 110, 84, 0.7)'
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
    
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }
});

console.log('Direct UI script loaded');
