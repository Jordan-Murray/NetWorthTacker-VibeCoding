/**
 * UI Controller Module
 * Handles all UI rendering and updates
 */
import { formatCurrency, calculatePercentChange } from './utils.js';

export class UIController {
    constructor(dataStore) {
        this.dataStore = dataStore;
    }
    
    /**
     * Render the year selector dropdown
     */
    renderYearSelector() {
        const yearSelect = document.getElementById('year-select');
        if (!yearSelect) return;
        
        const years = this.dataStore.getYears();
        
        // Clear current options
        yearSelect.innerHTML = '';
        
        // Add options for each year
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
        
        // If no years available, disable the select
        if (years.length === 0) {
            yearSelect.disabled = true;
        } else {
            yearSelect.disabled = false;
        }
    }
    
    /**
     * Render the assets and liabilities tables
     */
    renderFinancialTables() {
        const yearSelect = document.getElementById('year-select');
        if (!yearSelect) return;
        
        const selectedYear = yearSelect.value;
        if (!selectedYear) return;
        
        this.renderAssetsTable(selectedYear);
        this.renderLiabilitiesTable(selectedYear);
    }
    
    /**
     * Render the assets table for a specific year
     */
    renderAssetsTable(year) {
        const assetsTableBody = document.querySelector('#assets-table tbody');
        const assetsTotalElement = document.getElementById('assets-total');
        
        if (!assetsTableBody || !assetsTotalElement) return;
        
        // Get assets data
        const assets = this.dataStore.getAssets(year);
        const totalAssets = this.dataStore.getTotalAssets(year);
        
        // Clear current table rows
        assetsTableBody.innerHTML = '';
        
        // If no assets, show empty message
        if (assets.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="4" class="empty-table">No assets added yet. Click "Add Asset" to get started.</td>`;
            assetsTableBody.appendChild(emptyRow);
        } else {
            // Add row for each asset
            assets.forEach(asset => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${asset.category}</td>
                    <td>${asset.name}</td>
                    <td>${formatCurrency(asset.value)}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${asset.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete-btn" data-id="${asset.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
                
                assetsTableBody.appendChild(row);
                
                // Add event listeners for edit and delete buttons
                const editBtn = row.querySelector('.edit-btn');
                const deleteBtn = row.querySelector('.delete-btn');
                
                editBtn.addEventListener('click', () => this.showEditAssetModal(year, asset));
                deleteBtn.addEventListener('click', () => this.handleDeleteAsset(year, asset.id));
            });
        }
        
        // Update total
        assetsTotalElement.textContent = formatCurrency(totalAssets);
    }
    
    /**
     * Show modal for editing an asset
     */
    showEditAssetModal(year, asset) {
        const modal = document.getElementById('modal-container');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalBody) return;
        
        modalBody.innerHTML = `
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
            <div class="form-actions">
                <button id="cancel-edit-asset" class="cancel-btn">Cancel</button>
                <button id="save-edit-asset" class="save-btn">Save Changes</button>
            </div>
        `;
        
        modal.classList.remove('modal-hidden');
        
        // Set up modal event listeners
        document.getElementById('cancel-edit-asset').addEventListener('click', () => {
            modal.classList.add('modal-hidden');
        });
        
        document.getElementById('save-edit-asset').addEventListener('click', () => {
            const category = document.getElementById('edit-asset-category').value;
            const name = document.getElementById('edit-asset-name').value;
            const valueInput = document.getElementById('edit-asset-value').value;
            const value = parseFloat(valueInput);
            
            if (category && name && !isNaN(value) && value >= 0) {
                this.dataStore.updateAsset(year, asset.id, { category, name, value });
                this.renderFinancialTables();
                this.renderDashboardSummary();
                
                // Trigger chart updates via the event system
                const event = new CustomEvent('dataUpdated');
                document.dispatchEvent(event);
                
                modal.classList.add('modal-hidden');
            } else {
                alert('Please fill all fields with valid values');
            }
        });
    }
    
    /**
     * Handle asset deletion
     */
    handleDeleteAsset(year, assetId) {
        const confirmDelete = confirm('Are you sure you want to delete this asset?');
        
        if (confirmDelete) {
            this.dataStore.removeAsset(year, assetId);
            this.renderFinancialTables();
            this.renderDashboardSummary();
            
            // Trigger chart updates via the event system
            const event = new CustomEvent('dataUpdated');
            document.dispatchEvent(event);
        }
    }
    
    /**
     * Render the liabilities table for a specific year
     */
    renderLiabilitiesTable(year) {
        const liabilitiesTableBody = document.querySelector('#liabilities-table tbody');
        const liabilitiesTotalElement = document.getElementById('liabilities-total');
        
        if (!liabilitiesTableBody || !liabilitiesTotalElement) return;
        
        // Get liabilities data
        const liabilities = this.dataStore.getLiabilities(year);
        const totalLiabilities = this.dataStore.getTotalLiabilities(year);
        
        // Clear current table rows
        liabilitiesTableBody.innerHTML = '';
        
        // If no liabilities, show empty message
        if (liabilities.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="3" class="empty-table">No liabilities added yet. Click "Add Liability" to get started.</td>`;
            liabilitiesTableBody.appendChild(emptyRow);
        } else {
            // Add row for each liability
            liabilities.forEach(liability => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${liability.category}</td>
                    <td>${formatCurrency(liability.value)}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${liability.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete-btn" data-id="${liability.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
                
                liabilitiesTableBody.appendChild(row);
                
                // Add event listeners for edit and delete buttons
                const editBtn = row.querySelector('.edit-btn');
                const deleteBtn = row.querySelector('.delete-btn');
                
                editBtn.addEventListener('click', () => this.showEditLiabilityModal(year, liability));
                deleteBtn.addEventListener('click', () => this.handleDeleteLiability(year, liability.id));
            });
        }
        
        // Update total
        liabilitiesTotalElement.textContent = formatCurrency(totalLiabilities);
    }
    
    /**
     * Show modal for editing a liability
     */
    showEditLiabilityModal(year, liability) {
        const modal = document.getElementById('modal-container');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalBody) return;
        
        modalBody.innerHTML = `
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
            <div class="form-actions">
                <button id="cancel-edit-liability" class="cancel-btn">Cancel</button>
                <button id="save-edit-liability" class="save-btn">Save Changes</button>
            </div>
        `;
        
        modal.classList.remove('modal-hidden');
        
        // Set up modal event listeners
        document.getElementById('cancel-edit-liability').addEventListener('click', () => {
            modal.classList.add('modal-hidden');
        });
        
        document.getElementById('save-edit-liability').addEventListener('click', () => {
            const category = document.getElementById('edit-liability-category').value;
            const valueInput = document.getElementById('edit-liability-value').value;
            const value = parseFloat(valueInput);
            
            if (category && !isNaN(value) && value >= 0) {
                this.dataStore.updateLiability(year, liability.id, { category, value });
                this.renderFinancialTables();
                this.renderDashboardSummary();
                
                // Trigger chart updates via the event system
                const event = new CustomEvent('dataUpdated');
                document.dispatchEvent(event);
                
                modal.classList.add('modal-hidden');
            } else {
                alert('Please fill all fields with valid values');
            }
        });
    }
    
    /**
     * Handle liability deletion
     */
    handleDeleteLiability(year, liabilityId) {
        const confirmDelete = confirm('Are you sure you want to delete this liability?');
        
        if (confirmDelete) {
            this.dataStore.removeLiability(year, liabilityId);
            this.renderFinancialTables();
            this.renderDashboardSummary();
            
            // Trigger chart updates via the event system
            const event = new CustomEvent('dataUpdated');
            document.dispatchEvent(event);
        }
    }
    
    /**
     * Render the dashboard summary cards
     */
    renderDashboardSummary() {
        const years = this.dataStore.getYears();
        if (years.length === 0) return;
        
        const currentYear = years[0]; // Most recent year
        
        // Get summary data
        const netWorth = this.dataStore.getNetWorth(currentYear);
        const totalAssets = this.dataStore.getTotalAssets(currentYear);
        const totalLiabilities = this.dataStore.getTotalLiabilities(currentYear);
        const debtToAssetRatio = this.dataStore.getDebtToAssetRatio(currentYear);
        
        // Calculate year-over-year change if previous year exists
        let netWorthChange = 0;
        let changeText = '';
        
        if (years.length > 1) {
            const previousYear = years[1];
            const previousNetWorth = this.dataStore.getNetWorth(previousYear);
            
            netWorthChange = calculatePercentChange(previousNetWorth, netWorth);
            
            const changeSymbol = netWorthChange >= 0 ? '+' : '';
            changeText = `${changeSymbol}${netWorthChange.toFixed(1)}% from ${previousYear}`;
        } else {
            changeText = 'No previous data for comparison';
        }
        
        // Update dashboard elements
        document.getElementById('current-net-worth').textContent = formatCurrency(netWorth);
        document.getElementById('net-worth-change').textContent = changeText;
        document.getElementById('total-assets').textContent = formatCurrency(totalAssets);
        document.getElementById('total-liabilities').textContent = formatCurrency(totalLiabilities);
        document.getElementById('debt-asset-ratio').textContent = `${debtToAssetRatio.toFixed(1)}%`;
        
        // Update the debt-to-asset ratio progress bar
        const ratioBar = document.getElementById('debt-ratio-bar');
        if (ratioBar) {
            // Cap at 100% for visual purposes
            const cappedRatio = Math.min(debtToAssetRatio, 100);
            ratioBar.style.width = `${cappedRatio}%`;
            
            // Set color based on ratio
            if (debtToAssetRatio < 30) {
                ratioBar.style.backgroundColor = 'var(--success-color)';
            } else if (debtToAssetRatio < 60) {
                ratioBar.style.backgroundColor = 'var(--warning-color)';
            } else {
                ratioBar.style.backgroundColor = 'var(--danger-color)';
            }
        }
        
        // Update net worth change color
        const changeElement = document.getElementById('net-worth-change');
        if (changeElement) {
            if (netWorthChange > 0) {
                changeElement.style.color = 'var(--success-color)';
            } else if (netWorthChange < 0) {
                changeElement.style.color = 'var(--danger-color)';
            } else {
                changeElement.style.color = 'var(--text-light)';
            }
        }
    }
    
    /**
     * Render the milestones list
     */
    renderMilestones() {
        const milestonesContainer = document.getElementById('milestones-list');
        if (!milestonesContainer) return;
        
        // Update milestone status
        this.dataStore.updateMilestoneStatus();
        
        // Get milestones
        const milestones = this.dataStore.getMilestones();
        
        // Clear current milestones
        milestonesContainer.innerHTML = '';
        
        // If no milestones, show empty message
        if (milestones.length === 0) {
            milestonesContainer.innerHTML = `<p class="empty-list">No milestones added yet. Click "Add Milestone" to get started.</p>`;
            return;
        }
        
        // Add each milestone
        milestones.forEach(milestone => {
            const milestoneElement = document.createElement('div');
            milestoneElement.className = `milestone ${milestone.achieved ? 'achieved' : ''}`;
            
            milestoneElement.innerHTML = `
                <div class="milestone-status">
                    <div class="milestone-icon">${milestone.achieved ? '✓' : '○'}</div>
                </div>
                <div class="milestone-details">
                    <h4>${milestone.name}</h4>
                    <p>${formatCurrency(milestone.amount)}</p>
                </div>
                <div class="milestone-actions">
                    <button class="action-btn delete-milestone-btn" data-id="${milestone.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            milestonesContainer.appendChild(milestoneElement);
            
            // Add event listener for delete button
            const deleteBtn = milestoneElement.querySelector('.delete-milestone-btn');
            deleteBtn.addEventListener('click', () => this.handleDeleteMilestone(milestone.id));
        });
    }
    
    /**
     * Handle delete milestone
     */
    handleDeleteMilestone(milestoneId) {
        const confirmDelete = confirm('Are you sure you want to delete this milestone?');
        
        if (confirmDelete) {
            this.dataStore.removeMilestone(milestoneId);
            this.renderMilestones();
        }
    }
    
    /**
     * Render the salary history table
     */
    renderSalaryTable() {
        const salaryTableBody = document.querySelector('#salary-table tbody');
        if (!salaryTableBody) return;
        
        // Get salary history data
        const salaryEntries = this.dataStore.getSalaryHistory();
        
        // Clear current table rows
        salaryTableBody.innerHTML = '';
        
        // If no salary entries, show empty message
        if (salaryEntries.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="5" class="empty-table">No salary entries added yet. Click "Add Salary" to get started.</td>`;
            salaryTableBody.appendChild(emptyRow);
        } else {
            // Add row for each salary entry
            salaryEntries.forEach(entry => {
                const row = document.createElement('tr');
                const formattedDate = new Date(entry.date).toLocaleDateString('en-GB', { 
                    month: 'short', 
                    year: 'numeric' 
                });
                
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${entry.company}</td>
                    <td>${formatCurrency(entry.amount)}</td>
                    <td>${entry.increasePercent.toFixed(1)}%</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${entry.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete-btn" data-id="${entry.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
                
                salaryTableBody.appendChild(row);
                
                // Add event listeners for edit and delete buttons
                const editBtn = row.querySelector('.edit-btn');
                const deleteBtn = row.querySelector('.delete-btn');
                
                editBtn.addEventListener('click', () => this.showEditSalaryModal(entry));
                deleteBtn.addEventListener('click', () => this.handleDeleteSalary(entry.id));
            });
        }
    }
    
    /**
     * Show modal for editing a salary entry
     */
    showEditSalaryModal(entry) {
        const modal = document.getElementById('modal-container');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalBody) return;
        
        // Format date for input (YYYY-MM)
        const date = new Date(entry.date);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        modalBody.innerHTML = `
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
            </div>
        `;
        
        modal.classList.remove('modal-hidden');
        modal.classList.add('modal-visible');
        
        // Set up modal event listeners
        document.getElementById('cancel-edit-salary').addEventListener('click', () => {
            modal.classList.add('modal-hidden');
            modal.classList.remove('modal-visible');
        });
        
        document.getElementById('save-edit-salary').addEventListener('click', () => {
            const dateInput = document.getElementById('edit-salary-date').value;
            const company = document.getElementById('edit-salary-company').value;
            const amountInput = document.getElementById('edit-salary-amount').value;
            const amount = parseFloat(amountInput);
            
            if (dateInput && company && !isNaN(amount) && amount >= 0) {
                // Convert the input (YYYY-MM) to a Date object
                const date = new Date(dateInput);
                
                this.dataStore.updateSalaryEntry(entry.id, { date, company, amount });
                this.renderSalaryTable();
                
                // Trigger chart updates
                const event = new CustomEvent('dataUpdated');
                document.dispatchEvent(event);
                
                modal.classList.add('modal-hidden');
                modal.classList.remove('modal-visible');
            } else {
                alert('Please fill all fields with valid values');
            }
        });
    }
    
    /**
     * Handle salary entry deletion
     */
    handleDeleteSalary(entryId) {
        const confirmDelete = confirm('Are you sure you want to delete this salary entry?');
        
        if (confirmDelete) {
            this.dataStore.removeSalaryEntry(entryId);
            this.renderSalaryTable();
            
            // Trigger chart updates
            const event = new CustomEvent('dataUpdated');
            document.dispatchEvent(event);
        }
    }
} 