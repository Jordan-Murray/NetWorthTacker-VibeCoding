// Modal Fix Script - ensures modals display correctly

// Helper function to generate unique IDs
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

document.addEventListener('DOMContentLoaded', () => {
    // Ensure modal functionality works
    const modalContainer = document.getElementById('modal-container');
    
    if (!modalContainer) {
        return;
    }
    
    // Override modal display methods for compatibility with section isolation
    window.showModal = function(content, modalType) {
        const modalContainer = document.getElementById('modal-container');
        const modalBody = document.getElementById('modal-body');
        
        if (!modalContainer || !modalBody) {
            return;
        }
        
        if (content) {
            modalBody.innerHTML = content;
            
            // Set up action button event listeners based on modal type
            setupModalActions(modalType);
        }
        
        // APPROACH FROM TOGGLE MODAL - Using multiple techniques for maximum reliability
        
        // 1. Apply classes
        modalContainer.classList.remove('modal-hidden');
        modalContainer.classList.add('modal-visible');
        
        // 2. Apply inline styles with !important
        modalContainer.style.cssText = `
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0, 0, 0, 0.5) !important;
            z-index: 10000 !important;
            justify-content: center !important;
            align-items: center !important;
        `;
        
        // 3. Create and inject a style tag for additional override
        let styleTag = document.getElementById('force-modal-style');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'force-modal-style';
            document.head.appendChild(styleTag);
        }
        styleTag.textContent = `
            #modal-container {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
            }
            #modal-container .modal-content {
                opacity: 1 !important;
                visibility: visible !important;
            }
        `;
        
        // 4. Force body style to prevent scrolling
        document.body.style.overflow = 'hidden';
    };
    
    window.hideModal = function() {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) {
            return;
        }
        
        // APPROACH FROM TOGGLE MODAL - Using multiple techniques for maximum reliability
        
        // 1. Remove classes
        modalContainer.classList.add('modal-hidden');
        modalContainer.classList.remove('modal-visible');
        
        // 2. Apply inline styles with !important
        modalContainer.style.cssText = `
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        `;
        
        // 3. Update the style override
        let styleTag = document.getElementById('force-modal-style');
        if (styleTag) {
            styleTag.textContent = `
                #modal-container {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
            `;
        }
        
        // 4. Restore body scrolling
        document.body.style.overflow = '';
    };
    
    // Function to set up action buttons based on modal type
    function setupModalActions(modalType) {
        // Set up common cancel buttons that just close the modal
        const cancelButtons = document.querySelectorAll('.cancel-btn');
        cancelButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                window.hideModal();
            });
        });
        
        // Set up specific action buttons based on modal type
        switch(modalType) {
            case 'add-year':
                setupAddYearActions();
                break;
            case 'add-asset':
                setupAddAssetActions();
                break;
            case 'add-liability':
                setupAddLiabilityActions();
                break;
            case 'add-milestone':
                setupAddMilestoneActions();
                break;
            case 'add-salary':
                setupAddSalaryActions();
                break;
            case 'edit-asset':
                // Edit asset handlers are set up in direct-ui.js
                break;
            case 'edit-liability':
                // Edit liability handlers are set up in direct-ui.js
                break;
            case 'delete-item':
                // Delete handlers are set up in direct-ui.js
                break;
            case 'delete-milestone':
                // Delete milestone handlers are set up in direct-ui.js
                break;
        }
    }
    
    // Force reload page to ensure UI refresh after data changes
    function reloadPageAfterDelay(delay = 300) {
        window.hideModal();
        setTimeout(() => {
            window.location.reload();
        }, delay);
    }
    
    function setupAddYearActions() {
        const saveYearBtn = document.getElementById('save-year');
        if (saveYearBtn) {
            saveYearBtn.addEventListener('click', () => {
                const yearInput = document.getElementById('new-year');
                const year = parseInt(yearInput.value, 10);
                
                if (year && year >= 1900 && year <= 2100) {
                    // Try to add year using the dataStore if available
                    try {
                        if (window.appInstance && window.appInstance.dataStore) {
                            window.appInstance.dataStore.addYear(year);
                            window.appInstance.ui.renderYearSelector();
                        } else {
                            // Fallback: Create the year in localStorage with correct format
                            let data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
                            
                            // Initialize data structure if it doesn't exist
                            if (!data.years) data.years = {};
                            if (!data.milestones) data.milestones = [];
                            
                            // Check if the year already exists
                            if (!data.years[year]) {
                                // Add the year with the correct format
                                data.years[year] = {
                                    assets: [],
                                    liabilities: []
                                };
                                
                                localStorage.setItem('netWorthData', JSON.stringify(data));
                                
                                // Now update the year selector directly
                                const yearSelect = document.getElementById('year-select');
                                if (yearSelect) {
                                    // Create a new option element
                                    const option = document.createElement('option');
                                    option.value = year.toString();
                                    option.textContent = year.toString();
                                    
                                    // Add the option to the select element
                                    yearSelect.appendChild(option);
                                    
                                    // Sort the options by year (descending) to have most recent years first
                                    const options = Array.from(yearSelect.options);
                                    options.sort((a, b) => parseInt(b.value) - parseInt(a.value));
                                    yearSelect.innerHTML = '';
                                    options.forEach(option => yearSelect.appendChild(option));
                                    
                                    // Select the most recent year (which should be this new one)
                                    const mostRecentYear = options[0].value;
                                    yearSelect.value = mostRecentYear;
                                    
                                    // Trigger a change event to update displays
                                    const event = new Event('change');
                                    yearSelect.dispatchEvent(event);
                                }
                            } else {
                                // Sort and select the most recent year
                                const yearSelect = document.getElementById('year-select');
                                if (yearSelect) {
                                    // Sort the options by year (descending)
                                    const options = Array.from(yearSelect.options);
                                    options.sort((a, b) => parseInt(b.value) - parseInt(a.value));
                                    yearSelect.innerHTML = '';
                                    options.forEach(option => yearSelect.appendChild(option));
                                    
                                    // Select the most recent year
                                    const mostRecentYear = options[0].value;
                                    yearSelect.value = mostRecentYear;
                                    
                                    // Trigger a change event to update displays
                                    const event = new Event('change');
                                    yearSelect.dispatchEvent(event);
                                }
                            }
                        }
                        
                        // Hide the modal
                        window.hideModal();
                    } catch (error) {
                        alert('Error adding year: ' + error.message);
                        window.hideModal();
                    }
                } else {
                    alert('Please enter a valid year between 1900 and 2100');
                }
            });
        }
    }
    
    function setupAddAssetActions() {
        const saveAssetBtn = document.getElementById('save-asset');
        if (saveAssetBtn) {
            saveAssetBtn.addEventListener('click', () => {
                const category = document.getElementById('asset-category').value;
                const name = document.getElementById('asset-name').value;
                const valueInput = document.getElementById('asset-value').value;
                const value = parseFloat(valueInput);
                
                if (category && name && !isNaN(value) && value >= 0) {
                    try {
                        const yearSelect = document.getElementById('year-select');
                        const currentYear = yearSelect ? yearSelect.value : new Date().getFullYear().toString();
                        
                        if (window.appInstance && window.appInstance.dataStore) {
                            window.appInstance.dataStore.addAsset(currentYear, category, name, value);
                            window.appInstance.ui.renderFinancialTables();
                            window.appInstance.ui.renderDashboardSummary();
                            if (window.appInstance.chartManager) {
                                window.appInstance.chartManager.updateAllCharts();
                            }
                        } else {
                            // Fallback: Add directly to localStorage with correct format
                            let data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
                            
                            // Initialize data structure if it doesn't exist
                            if (!data.years) data.years = {};
                            if (!data.milestones) data.milestones = [];
                            
                            // Ensure the year exists
                            if (!data.years[currentYear]) {
                                data.years[currentYear] = { assets: [], liabilities: [] };
                            }
                            
                            // Add the asset with the correct format
                            const newAsset = {
                                id: Date.now().toString(),
                                category: category,
                                name: name,
                                value: value
                            };
                            
                            data.years[currentYear].assets.push(newAsset);
                            localStorage.setItem('netWorthData', JSON.stringify(data));
                            
                            // Trigger direct UI update
                            window.hideModal();
                            
                            // Notify that year data was updated
                            document.dispatchEvent(new CustomEvent('yearDataUpdated', { 
                                detail: { year: currentYear } 
                            }));
                            return;
                        }
                        
                        window.hideModal();
                    } catch (error) {
                        alert('Error adding asset: ' + error.message);
                        window.hideModal();
                    }
                } else {
                    alert('Please fill all fields with valid values');
                }
            });
        }
    }
    
    function setupAddLiabilityActions() {
        const saveLiabilityBtn = document.getElementById('save-liability');
        if (saveLiabilityBtn) {
            saveLiabilityBtn.addEventListener('click', () => {
                const category = document.getElementById('liability-category').value;
                const valueInput = document.getElementById('liability-value').value;
                const value = parseFloat(valueInput);
                
                if (category && !isNaN(value) && value >= 0) {
                    try {
                        const yearSelect = document.getElementById('year-select');
                        const currentYear = yearSelect ? yearSelect.value : new Date().getFullYear().toString();
                        
                        if (window.appInstance && window.appInstance.dataStore) {
                            window.appInstance.dataStore.addLiability(currentYear, category, value);
                            window.appInstance.ui.renderFinancialTables();
                            window.appInstance.ui.renderDashboardSummary();
                            if (window.appInstance.chartManager) {
                                window.appInstance.chartManager.updateAllCharts();
                            }
                        } else {
                            // Fallback: Add directly to localStorage with correct format
                            let data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
                            
                            // Initialize data structure if it doesn't exist
                            if (!data.years) data.years = {};
                            if (!data.milestones) data.milestones = [];
                            
                            // Ensure the year exists
                            if (!data.years[currentYear]) {
                                data.years[currentYear] = { assets: [], liabilities: [] };
                            }
                            
                            // Add the liability with the correct format
                            const newLiability = {
                                id: Date.now().toString(),
                                category: category,
                                value: value
                            };
                            
                            data.years[currentYear].liabilities.push(newLiability);
                            localStorage.setItem('netWorthData', JSON.stringify(data));
                            
                            // Trigger direct UI update
                            window.hideModal();
                            
                            // Notify that year data was updated
                            document.dispatchEvent(new CustomEvent('yearDataUpdated', { 
                                detail: { year: currentYear } 
                            }));
                            return;
                        }
                        
                        window.hideModal();
                    } catch (error) {
                        alert('Error adding liability: ' + error.message);
                        window.hideModal();
                    }
                } else {
                    alert('Please fill all fields with valid values');
                }
            });
        }
    }
    
    function setupAddMilestoneActions() {
        const saveMilestoneBtn = document.getElementById('save-milestone');
        if (saveMilestoneBtn) {
            saveMilestoneBtn.addEventListener('click', () => {
                const amountInput = document.getElementById('milestone-amount').value;
                const name = document.getElementById('milestone-name').value;
                const amount = parseFloat(amountInput);
                
                if (!isNaN(amount) && amount > 0 && name) {
                    try {
                        if (window.appInstance && window.appInstance.dataStore) {
                            window.appInstance.dataStore.addMilestone(amount, name);
                            window.appInstance.ui.renderMilestones();
                        } else {
                            // Fallback: Add directly to localStorage with correct format
                            let data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
                            
                            // Initialize data structure if it doesn't exist
                            if (!data.years) data.years = {};
                            if (!data.milestones) data.milestones = [];
                            
                            // Add the milestone
                            data.milestones.push({
                                id: generateId(),
                                amount: amount,
                                name: name
                            });
                            
                            // Sort milestones by amount
                            data.milestones.sort((a, b) => a.amount - b.amount);
                            
                            localStorage.setItem('netWorthData', JSON.stringify(data));
                        }
                        
                        // Hide the modal
                        window.hideModal();
                    } catch (error) {
                        alert('Error adding milestone: ' + error.message);
                        window.hideModal();
                    }
                } else {
                    alert('Please enter a valid amount and name');
                }
            });
        }
    }
    
    function setupAddSalaryActions() {
        const saveSalaryBtn = document.getElementById('save-salary');
        if (saveSalaryBtn) {
            saveSalaryBtn.addEventListener('click', () => {
                const dateInput = document.getElementById('salary-date').value;
                const company = document.getElementById('salary-company').value;
                const amountInput = document.getElementById('salary-amount').value;
                const amount = parseFloat(amountInput);
                
                if (dateInput && company && !isNaN(amount) && amount >= 0) {
                    try {
                        // Convert the input (YYYY-MM) to a Date object
                        const date = new Date(dateInput);
                        
                        if (window.appInstance && window.appInstance.dataStore) {
                            window.appInstance.dataStore.addSalaryEntry(date, company, amount);
                            window.appInstance.ui.renderSalaryTable();
                            window.appInstance.chartManager.updateSalaryGrowthChart();
                        } else {
                            // Fallback: Add directly to localStorage with correct format
                            let data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
                            
                            // Initialize data structure if it doesn't exist
                            if (!data.salaryHistory) data.salaryHistory = [];
                            
                            // Create the new entry
                            const newEntry = {
                                id: generateId(),
                                date: date.toISOString(), // Store as ISO string for proper serialization
                                company: company,
                                amount: amount,
                                increasePercent: 0 // Will be calculated
                            };
                            
                            // Sort entries by date (most recent first)
                            let sortedEntries = [...data.salaryHistory, newEntry]
                                .sort((a, b) => new Date(b.date) - new Date(a.date));
                            
                            // Calculate increase percentage if not the first entry
                            if (sortedEntries.length > 1) {
                                // Current entry is newest, previous is at index 1
                                const previousSalary = sortedEntries[1].amount;
                                const percentIncrease = previousSalary > 0 
                                    ? ((sortedEntries[0].amount - previousSalary) / previousSalary) * 100 
                                    : 0;
                                sortedEntries[0].increasePercent = percentIncrease;
                            }
                            
                            // Update all entries with recalculated percentages
                            data.salaryHistory = sortedEntries;
                            
                            localStorage.setItem('netWorthData', JSON.stringify(data));
                        }
                        
                        // Hide the modal using our reliable method
                        window.hideModal();
                    } catch (error) {
                        alert('Error adding salary entry: ' + error.message);
                        window.hideModal();
                    }
                } else {
                    alert('Please fill all fields with valid values');
                }
            });
        }
    }
    
    // Ensure modal close button works
    const closeButton = modalContainer.querySelector('.close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            window.hideModal();
        });
    }
    
    // Add global event listener for closing modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalContainer.style.display !== 'none') {
            window.hideModal();
        }
    });
    
    // Setup click outside to close
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            window.hideModal();
        }
    });
    
    // Override button event listeners for common buttons
    function setupModalTriggers() {
        // List of buttons that should trigger modals
        const modalTriggers = [
            { id: 'add-year', content: createAddYearForm(), type: 'add-year' },
            { id: 'add-asset', content: createAddAssetForm(), type: 'add-asset' },
            { id: 'add-liability', content: createAddLiabilityForm(), type: 'add-liability' },
            { id: 'add-milestone', content: createAddMilestoneForm(), type: 'add-milestone' },
            { id: 'add-salary', content: createAddSalaryForm(), type: 'add-salary' }
        ];
        
        modalTriggers.forEach(trigger => {
            const button = document.getElementById(trigger.id);
            if (button) {
                // Ensure we don't double-attach events
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.showModal(trigger.content, trigger.type);
                });
            }
        });
    }
    
    // Create forms for common modals
    function createAddYearForm() {
        return `
            <h2>Add New Year</h2>
            <div class="form-group">
                <label for="new-year">Year:</label>
                <input type="number" id="new-year" min="1900" max="2100" value="${new Date().getFullYear()}" />
            </div>
            <div class="form-actions">
                <button id="cancel-year" class="cancel-btn">Cancel</button>
                <button id="save-year" class="save-btn">Add Year</button>
            </div>
        `;
    }
    
    function createAddAssetForm() {
        const currentYear = document.getElementById('year-select')?.value || new Date().getFullYear();
        
        return `
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
    }
    
    function createAddLiabilityForm() {
        const currentYear = document.getElementById('year-select')?.value || new Date().getFullYear();
        
        return `
            <h2>Add New Liability</h2>
            <div class="form-group">
                <label for="liability-category">Category:</label>
                <select id="liability-category">
                    <option value="Mortgages">Mortgages</option>
                    <option value="Car loans">Car loans</option>
                    <option value="Student loans">Student loans</option>
                    <option value="Credit Card Debt">Credit Card Debt</option>
                    <option value="Personal Loans">Personal Loans</option>
                    <option value="Other Debts">Other Debts</option>
                </select>
            </div>
            <div class="form-group">
                <label for="liability-value">Value (£):</label>
                <input type="number" id="liability-value" min="0" step="0.01" />
            </div>
            <div class="form-actions">
                <button id="cancel-liability" class="cancel-btn">Cancel</button>
                <button id="save-liability" class="save-btn">Add Liability</button>
            </div>
        `;
    }
    
    function createAddMilestoneForm() {
        return `
            <h2>Add Net Worth Milestone</h2>
            <div class="form-group">
                <label for="milestone-amount">Target Amount (£):</label>
                <input type="number" id="milestone-amount" min="0" step="100" />
            </div>
            <div class="form-group">
                <label for="milestone-name">Description (optional):</label>
                <input type="text" id="milestone-name" placeholder="e.g. Down payment for house" />
            </div>
            <div class="form-actions">
                <button id="cancel-milestone" class="cancel-btn">Cancel</button>
                <button id="save-milestone" class="save-btn">Add Milestone</button>
            </div>
        `;
    }
    
    // Add a function to create the salary form
    function createAddSalaryForm() {
        // Get current date for default
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        return `
            <h2>Add Salary Entry</h2>
            <div class="form-group">
                <label for="salary-date">Date (Month/Year):</label>
                <input type="month" id="salary-date" value="${currentMonth}" />
            </div>
            <div class="form-group">
                <label for="salary-company">Company:</label>
                <input type="text" id="salary-company" placeholder="Company name" />
            </div>
            <div class="form-group">
                <label for="salary-amount">Salary (£):</label>
                <input type="number" id="salary-amount" min="0" step="0.01" />
            </div>
            <div class="form-actions">
                <button id="cancel-salary" class="cancel-btn">Cancel</button>
                <button id="save-salary" class="save-btn">Add Salary</button>
            </div>
        `;
    }
    
    // Add a reference to the app's instance to the window 
    // This allows our modal to interact with the application
    try {
        if (window.appInstance === undefined) {
            // Create a listener to capture the app instance when it's initialized
            const originalDataStore = window.DataStore;
            const originalUIController = window.UIController;
            
            // Add a mutation observer to capture when app elements are updated
            const observer = new MutationObserver((mutations) => {
                // Check if we now have valid select options
                const yearSelect = document.getElementById('year-select');
                if (yearSelect && yearSelect.options.length > 0) {
                    // App is now initialized
                    observer.disconnect();
                }
            });
            
            // Start observing document changes
            observer.observe(document.body, { 
                childList: true, 
                subtree: true 
            });
        }
    } catch (e) {
        // Failed to set up app instance capture
    }
    
    // Set up modal triggers
    setupModalTriggers();
    
    // Fix modal styles
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        #modal-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0, 0, 0, 0.5) !important;
            z-index: 10000 !important;
        }
        
        #modal-container.modal-visible {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            justify-content: center !important;
            align-items: center !important;
        }
        
        #modal-container.modal-hidden {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }
        
        .modal-content {
            position: relative !important;
            background-color: white !important;
            border-radius: 6px !important;
            padding: 2rem !important;
            width: 90% !important;
            max-width: 500px !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
        }
    `;
    document.head.appendChild(modalStyle);
}); 