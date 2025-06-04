/**
 * Form Handler UI Module
 * Handles forms for adding/editing assets and liabilities
 */
import { getDataStore } from './enhancedDataService.js';
import { renderFinancialTables } from './financialTablesUI.js';
import { updateDashboardSummary } from './dashboardUI.js';
import { showModal } from './modalModule.js';

/**
 * Initialize form handler UI
 */
export function initFormHandlerUI() {
    console.log('initFormHandlerUI');
    const dataStore = getDataStore();
    const currentYear = dataStore.getCurrentYear();
    setupAssetForm(currentYear);
    setupLiabilityForm(currentYear);
    setupSavingForm(currentYear);
    setupMilestoneForm();
    setupSalaryForm();
    setupBudgetForm();
}

/**
 * Set up asset form
 * @param {string} currentYear - The current year
 */
function setupAssetForm(currentYear) {
    const form = document.getElementById('add-asset-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const category = document.getElementById('asset-category').value;
        const name = document.getElementById('asset-name').value.trim();
        const value = parseFloat(document.getElementById('asset-value').value);
        
        if (!category || !name || isNaN(value) || value < 0) {
            alert('Please fill all fields with valid values');
            return;
        }
        
        const dataStore = getDataStore();
        dataStore.addAsset(currentYear, {
            category,
            name,
            value,
            dateAdded: new Date().toISOString()
        });
        
        form.reset();
        hideModal();
        initFormHandlerUI();
    });
}

/**
 * Set up liability form
 * @param {string} currentYear - The current year
 */
function setupLiabilityForm(currentYear) {
    const form = document.getElementById('add-liability-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const category = document.getElementById('liability-category').value;
        const name = document.getElementById('liability-name').value.trim();
        const value = parseFloat(document.getElementById('liability-value').value);
        
        if (!category || !name || isNaN(value) || value < 0) {
            alert('Please fill all fields with valid values');
            return;
        }
        
        const dataStore = getDataStore();
        dataStore.addLiability(currentYear, {
            category,
            name,
            value,
            dateAdded: new Date().toISOString()
        });
        
        form.reset();
        hideModal();
        initFormHandlerUI();
    });
}

/**
 * Set up saving form
 * @param {string} currentYear - The current year
 */
function setupSavingForm(currentYear) {
    const addSavingBtn = document.getElementById('add-saving');
    if (!addSavingBtn) return;
    
    // Set up add saving button
    addSavingBtn.addEventListener('click', function() {
        showAddSavingModal();
    });
}

/**
 * Set up milestone form
 */
function setupMilestoneForm() {
    const addMilestoneBtn = document.getElementById('add-milestone');
    if (!addMilestoneBtn) return;
    
    addMilestoneBtn.addEventListener('click', function() {
        showAddMilestoneModal();
    });
}

/**
 * Show the asset form
 * @param {Object} [asset] - Asset to edit (optional)
 */
export function showAssetForm(asset) {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    
    const yearSelect = document.getElementById('year-select');
    const selectedYear = yearSelect ? yearSelect.value : null;
    
    if (!selectedYear) {
        alert('Please select a year first.');
        return;
    }
    
    const isEditing = !!asset;
    
    // Create form HTML
    modalBody.innerHTML = `
        <h2>${isEditing ? 'Edit' : 'Add'} Asset</h2>
        <form id="asset-form">
            <div class="form-group">
                <label for="asset-name">Name:</label>
                <input type="text" id="asset-name" class="form-control" value="${isEditing ? asset.name : ''}" required>
            </div>
            <div class="form-group">
                <label for="asset-category">Category:</label>
                <select id="asset-category" class="form-control">
                    <option value="Cash" ${isEditing && asset.category === 'Cash' ? 'selected' : ''}>Cash</option>
                    <option value="Property" ${isEditing && asset.category === 'Property' ? 'selected' : ''}>Property</option>
                    <option value="Investments" ${isEditing && asset.category === 'Investments' ? 'selected' : ''}>Investments</option>
                    <option value="Retirement" ${isEditing && asset.category === 'Retirement' ? 'selected' : ''}>Retirement</option>
                    <option value="Vehicle" ${isEditing && asset.category === 'Vehicle' ? 'selected' : ''}>Vehicle</option>
                    <option value="Other" ${isEditing && asset.category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label for="asset-value">Value (£):</label>
                <input type="number" id="asset-value" class="form-control" min="0" step="0.01" value="${isEditing ? asset.value : ''}" required>
            </div>
            <div class="form-group">
                <label for="asset-notes">Notes:</label>
                <textarea id="asset-notes" class="form-control">${isEditing && asset.notes ? asset.notes : ''}</textarea>
            </div>
            ${isEditing ? `<input type="hidden" id="asset-id" value="${asset.id}">` : ''}
            <div class="form-actions">
                <button type="button" class="cancel-btn" onclick="document.getElementById('modal-container').classList.add('modal-hidden')">Cancel</button>
                <button type="submit" class="save-btn">Save</button>
            </div>
        </form>
    `;
    
    // Show modal
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.remove('modal-hidden');
        modalContainer.classList.add('modal-visible');
    }
    
    // Set up form submission
    const form = document.getElementById('asset-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAssetForm(selectedYear);
        });
    }
}

/**
 * Save the asset form
 * @param {string} yearId - The year to save the asset to
 */
function saveAssetForm(yearId) {
    const nameInput = document.getElementById('asset-name');
    const categoryInput = document.getElementById('asset-category');
    const valueInput = document.getElementById('asset-value');
    const notesInput = document.getElementById('asset-notes');
    const idInput = document.getElementById('asset-id');
    
    if (!nameInput || !categoryInput || !valueInput) return;
    
    const name = nameInput.value.trim();
    const category = categoryInput.value;
    const value = parseFloat(valueInput.value);
    const notes = notesInput ? notesInput.value.trim() : '';
    const id = idInput ? idInput.value : '';
    
    if (!name || isNaN(value) || value < 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    const dataStore = getDataStore();
    
    if (!dataStore.data.years[yearId]) {
        dataStore.data.years[yearId] = {
            assets: [],
            liabilities: []
        };
    }
    
    if (!dataStore.data.years[yearId].assets) {
        dataStore.data.years[yearId].assets = [];
    }
    
    if (id) {
        // Edit existing asset
        const index = dataStore.data.years[yearId].assets.findIndex(asset => asset.id === id);
        if (index !== -1) {
            dataStore.data.years[yearId].assets[index] = {
                ...dataStore.data.years[yearId].assets[index],
                name,
                category,
                value,
                notes,
                lastModified: new Date().toISOString()
            };
        }
    } else {
        // Add new asset
        dataStore.data.years[yearId].assets.push({
            id: dataStore.generateId(),
            name,
            category,
            value,
            notes,
            dateAdded: new Date().toISOString()
        });
    }
    
    dataStore.saveData();
    
    // Close modal
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.add('modal-hidden');
        modalContainer.classList.remove('modal-visible');
    }
    
    // Update UI
    renderFinancialTables(yearId);
    updateDashboardSummary();
}

/**
 * Show the liability form
 * @param {Object} [liability] - Liability to edit (optional)
 */
export function showLiabilityForm(liability) {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    
    const yearSelect = document.getElementById('year-select');
    const selectedYear = yearSelect ? yearSelect.value : null;
    
    if (!selectedYear) {
        alert('Please select a year first.');
        return;
    }
    
    const isEditing = !!liability;
    
    // Create form HTML
    modalBody.innerHTML = `
        <h2>${isEditing ? 'Edit' : 'Add'} Liability</h2>
        <form id="liability-form">
            <div class="form-group">
                <label for="liability-name">Name:</label>
                <input type="text" id="liability-name" class="form-control" value="${isEditing ? liability.name : ''}" required>
            </div>
            <div class="form-group">
                <label for="liability-category">Category:</label>
                <select id="liability-category" class="form-control">
                    <option value="Mortgage" ${isEditing && liability.category === 'Mortgage' ? 'selected' : ''}>Mortgage</option>
                    <option value="Loan" ${isEditing && liability.category === 'Loan' ? 'selected' : ''}>Loan</option>
                    <option value="Credit Card" ${isEditing && liability.category === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                    <option value="Student Loan" ${isEditing && liability.category === 'Student Loan' ? 'selected' : ''}>Student Loan</option>
                    <option value="Other" ${isEditing && liability.category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label for="liability-value">Value (£):</label>
                <input type="number" id="liability-value" class="form-control" min="0" step="0.01" value="${isEditing ? liability.value : ''}" required>
            </div>
            <div class="form-group">
                <label for="liability-interest">Interest Rate (%):</label>
                <input type="number" id="liability-interest" class="form-control" min="0" step="0.1" value="${isEditing && liability.interestRate ? liability.interestRate : ''}">
            </div>
            <div class="form-group">
                <label for="liability-notes">Notes:</label>
                <textarea id="liability-notes" class="form-control">${isEditing && liability.notes ? liability.notes : ''}</textarea>
            </div>
            ${isEditing ? `<input type="hidden" id="liability-id" value="${liability.id}">` : ''}
            <div class="form-actions">
                <button type="button" class="cancel-btn" onclick="document.getElementById('modal-container').classList.add('modal-hidden')">Cancel</button>
                <button type="submit" class="save-btn">Save</button>
            </div>
        </form>
    `;
    
    // Show modal
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.remove('modal-hidden');
        modalContainer.classList.add('modal-visible');
    }
    
    // Set up form submission
    const form = document.getElementById('liability-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveLiabilityForm(selectedYear);
        });
    }
}

/**
 * Save the liability form
 * @param {string} yearId - The year to save the liability to
 */
function saveLiabilityForm(yearId) {
    const nameInput = document.getElementById('liability-name');
    const categoryInput = document.getElementById('liability-category');
    const valueInput = document.getElementById('liability-value');
    const interestInput = document.getElementById('liability-interest');
    const notesInput = document.getElementById('liability-notes');
    const idInput = document.getElementById('liability-id');
    
    if (!nameInput || !categoryInput || !valueInput) return;
    
    const name = nameInput.value.trim();
    const category = categoryInput.value;
    const value = parseFloat(valueInput.value);
    const interestRate = interestInput && interestInput.value ? parseFloat(interestInput.value) : null;
    const notes = notesInput ? notesInput.value.trim() : '';
    const id = idInput ? idInput.value : '';
    
    if (!name || isNaN(value) || value < 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    const dataStore = getDataStore();
    
    if (!dataStore.data.years[yearId]) {
        dataStore.data.years[yearId] = {
            assets: [],
            liabilities: []
        };
    }
    
    if (!dataStore.data.years[yearId].liabilities) {
        dataStore.data.years[yearId].liabilities = [];
    }
    
    if (id) {
        // Edit existing liability
        const index = dataStore.data.years[yearId].liabilities.findIndex(liability => liability.id === id);
        if (index !== -1) {
            dataStore.data.years[yearId].liabilities[index] = {
                ...dataStore.data.years[yearId].liabilities[index],
                name,
                category,
                value,
                interestRate,
                notes,
                lastModified: new Date().toISOString()
            };
        }
    } else {
        // Add new liability
        dataStore.data.years[yearId].liabilities.push({
            id: dataStore.generateId(),
            name,
            category,
            value,
            interestRate,
            notes,
            dateAdded: new Date().toISOString()
        });
    }
    
    dataStore.saveData();
    
    // Close modal
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.add('modal-hidden');
        modalContainer.classList.remove('modal-visible');
    }
    
    // Update UI
    renderFinancialTables(yearId);
    updateDashboardSummary();
}

/**
 * Show the add saving modal
 */
export function showAddSavingModal() {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    
    const yearSelect = document.getElementById('year-select');
    const selectedYear = yearSelect ? yearSelect.value : null;
    
    if (!selectedYear) {
        alert('Please select a year first.');
        return;
    }
    
    // Create form HTML
    modalBody.innerHTML = `
        <h2>Add New Saving</h2>
        <form id="add-saving-form">
            <div class="form-group">
                <label for="saving-date">Date:</label>
                <input type="date" id="saving-date" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="saving-amount">Amount (£):</label>
                <input type="number" id="saving-amount" class="form-control" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="saving-category">Category:</label>
                <select id="saving-category" class="form-control">
                    <option value="Emergency Fund">Emergency Fund</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Investment">Investment</option>
                    <option value="House Deposit">House Deposit</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label for="saving-notes">Notes:</label>
                <textarea id="saving-notes" class="form-control"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="cancel-btn" onclick="document.getElementById('modal-container').classList.add('modal-hidden')">Cancel</button>
                <button type="submit" class="save-btn">Save</button>
            </div>
        </form>
    `;
    
    // Show modal
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.remove('modal-hidden');
        modalContainer.classList.add('modal-visible');
    }
    
    // Set up form submission
    const form = document.getElementById('add-saving-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSavingForm(selectedYear);
        });
    }
}

/**
 * Save the saving form
 * @param {string} yearId - The year to save the saving to
 */
function saveSavingForm(yearId) {
    const dateInput = document.getElementById('saving-date');
    const amountInput = document.getElementById('saving-amount');
    const categoryInput = document.getElementById('saving-category');
    const notesInput = document.getElementById('saving-notes');
    
    if (!dateInput || !amountInput || !categoryInput) return;
    
    const date = dateInput.value;
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const notes = notesInput ? notesInput.value.trim() : '';
    
    if (!date || isNaN(amount) || amount < 0 || !category) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    const dataStore = getDataStore();
    
    // Ensure the year exists in the data store
    if (!dataStore.data.years[yearId]) {
        dataStore.data.years[yearId] = {
            assets: [],
            liabilities: [],
            savings: []
        };
    }
    
    // Ensure the savings array exists for this year
    if (!dataStore.data.years[yearId].savings) {
        dataStore.data.years[yearId].savings = [];
    }
    
    // Add new saving entry
    dataStore.data.years[yearId].savings.push({
        id: dataStore.generateId(),
        date,
        amount,
        category,
        notes,
        dateAdded: new Date().toISOString()
    });
    
    dataStore.saveData();
    
    // Close modal
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.add('modal-hidden');
        modalContainer.classList.remove('modal-visible');
    }
    
    // Update UI
    if (typeof window.refreshSavingsTable === 'function') {
        window.refreshSavingsTable();
    }
    updateDashboardSummary();
}

/**
 * Show the add milestone modal
 */
export function showAddMilestoneModal() {
    const modalContent = `
        <h2>Add New Milestone</h2>
        <div class="form-group">
            <label for="milestone-name">Name:</label>
            <input type="text" id="milestone-name" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="milestone-target">Target Net Worth (£):</label>
            <input type="number" id="milestone-target" class="form-control" min="0" step="0.01" required>
        </div>
        <div class="form-group">
            <label for="milestone-date">Target Date:</label>
            <input type="date" id="milestone-date" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="milestone-notes">Notes:</label>
            <textarea id="milestone-notes" class="form-control"></textarea>
        </div>
        <div class="form-actions">
            <button id="cancel-milestone" class="cancel-btn">Cancel</button>
            <button id="save-milestone" class="save-btn">Add Milestone</button>
        </div>
    `;

    showModal(modalContent, 'add-milestone');
}

/**
 * Save the milestone form
 */
function saveMilestoneForm() {
    const nameInput = document.getElementById('milestone-name');
    const targetInput = document.getElementById('milestone-target');
    const dateInput = document.getElementById('milestone-date');
    const notesInput = document.getElementById('milestone-notes');
    
    if (!nameInput || !targetInput || !dateInput) return;
    
    const name = nameInput.value.trim();
    const target = parseFloat(targetInput.value);
    const date = dateInput.value;
    const notes = notesInput ? notesInput.value.trim() : '';
    
    if (!name || isNaN(target) || target < 0 || !date) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    const dataStore = getDataStore();
    
    if (!dataStore.data.milestones) {
        dataStore.data.milestones = [];
    }
    
    // Add new milestone
    dataStore.data.milestones.push({
        id: dataStore.generateId(),
        name,
        amount: target,
        date,
        notes,
        dateAdded: new Date().toISOString(),
        completed: false
    });
    
    dataStore.saveData();
    
    // Close modal
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.add('modal-hidden');
        modalContainer.classList.remove('modal-visible');
    }
    
    // Update UI
    if (typeof window.refreshMilestones === 'function') {
        window.refreshMilestones();
    }
}

/**
 * Set up salary form
 */
function setupSalaryForm() {
    const addSalaryBtn = document.getElementById('add-salary');
    if (!addSalaryBtn) return;
    
    addSalaryBtn.addEventListener('click', function() {
        showAddSalaryModal();
    });
}

/**
 * Show the add salary modal
 */
export function showAddSalaryModal() {
    const modalContent = `
        <h2>Add New Salary Entry</h2>
        <div class="form-group">
            <label for="salary-date">Date:</label>
            <input type="date" id="salary-date" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="salary-company">Company:</label>
            <input type="text" id="salary-company" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="salary-title">Title:</label>
            <input type="text" id="salary-title" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="salary-amount">Amount (£):</label>
            <input type="number" id="salary-amount" class="form-control" min="0" step="0.01" required>
        </div>
        <div class="form-actions">
            <button id="cancel-salary" class="cancel-btn">Cancel</button>
            <button id="save-salary" class="save-btn">Add Salary</button>
        </div>
    `;

    showModal(modalContent, 'add-salary');
}

/**
 * Save the salary form
 */
function saveSalaryForm() {
    const dateInput = document.getElementById('salary-date');
    const companyInput = document.getElementById('salary-company');
    const titleInput = document.getElementById('salary-title');
    const amountInput = document.getElementById('salary-amount');
    
    if (!dateInput || !companyInput || !titleInput || !amountInput) return;
    
    const date = dateInput.value;
    const company = companyInput.value.trim();
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    
    if (!date || !company || !title || isNaN(amount) || amount < 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    const dataStore = getDataStore();
    
    if (!dataStore.data.salaryHistory) {
        dataStore.data.salaryHistory = [];
    }
    
    // Add new salary entry
    dataStore.data.salaryHistory.push({
        id: dataStore.generateId(),
        date,
        company,
        title,
        amount,
        dateAdded: new Date().toISOString()
    });
    
    dataStore.saveData();
    
    // Close modal
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.add('modal-hidden');
        modalContainer.classList.remove('modal-visible');
    }
    
    // Update UI
    if (typeof window.refreshSalaryTable === 'function') {
        window.refreshSalaryTable();
    }
}

/**
 * Set up budget form
 */
function setupBudgetForm() {
    const calculateBudgetBtn = document.getElementById('calculate-budget');
    if (!calculateBudgetBtn) return;
    
    calculateBudgetBtn.addEventListener('click', function() {
        calculateBudget();
    });
    
    const calculateJointBtn = document.getElementById('calculate-joint');
    if (!calculateJointBtn) return;
    
    calculateJointBtn.addEventListener('click', function() {
        calculateJointBudget();
    });
}

/**
 * Calculate budget based on income inputs
 */
function calculateBudget() {
    const yourIncomeInput = document.getElementById('your-income');
    const spouseIncomeInput = document.getElementById('spouse-income');
    const resultsContainer = document.getElementById('budget-results');
    
    if (!yourIncomeInput || !spouseIncomeInput || !resultsContainer) return;
    
    const yourIncome = parseFloat(yourIncomeInput.value) || 0;
    const spouseIncome = parseFloat(spouseIncomeInput.value) || 0;
    const totalIncome = yourIncome + spouseIncome;
    
    if (totalIncome <= 0) {
        alert('Please enter valid income values.');
        return;
    }
    
    // Calculate percentages
    const yourPercentage = (yourIncome / totalIncome) * 100;
    const spousePercentage = (spouseIncome / totalIncome) * 100;
    
    // Update results
    document.getElementById('total-income').textContent = `£${totalIncome.toLocaleString()}`;
    document.getElementById('your-contribution').textContent = `£${yourIncome.toLocaleString()}`;
    document.getElementById('your-percentage').textContent = `${yourPercentage.toFixed(1)}%`;
    document.getElementById('spouse-contribution').textContent = `£${spouseIncome.toLocaleString()}`;
    document.getElementById('spouse-percentage').textContent = `${spousePercentage.toFixed(1)}%`;
    
    // Show results
    resultsContainer.style.display = 'block';
}

/**
 * Calculate joint account contributions
 */
function calculateJointBudget() {
    const jointExpensesInput = document.getElementById('joint-expenses');
    const contributionTypeSelect = document.getElementById('contribution-type');
    const customSplitInput = document.getElementById('your-split');
    const jointResults = document.getElementById('joint-results');
    
    if (!jointExpensesInput || !contributionTypeSelect || !jointResults) return;
    
    const jointExpenses = parseFloat(jointExpensesInput.value) || 0;
    const contributionType = contributionTypeSelect.value;
    
    if (jointExpenses <= 0) {
        alert('Please enter valid joint expenses.');
        return;
    }
    
    let yourTransfer, spouseTransfer;
    
    switch (contributionType) {
        case 'equal':
            yourTransfer = jointExpenses / 2;
            spouseTransfer = jointExpenses / 2;
            break;
        case 'proportional':
            const yourIncome = parseFloat(document.getElementById('your-income').value) || 0;
            const spouseIncome = parseFloat(document.getElementById('spouse-income').value) || 0;
            const totalIncome = yourIncome + spouseIncome;
            
            if (totalIncome <= 0) {
                alert('Please calculate total income first.');
                return;
            }
            
            yourTransfer = (yourIncome / totalIncome) * jointExpenses;
            spouseTransfer = (spouseIncome / totalIncome) * jointExpenses;
            break;
        case 'custom':
            const yourSplit = parseFloat(customSplitInput.value) || 50;
            yourTransfer = (yourSplit / 100) * jointExpenses;
            spouseTransfer = ((100 - yourSplit) / 100) * jointExpenses;
            break;
    }
    
    // Update results
    document.getElementById('total-expenses').textContent = `£${jointExpenses.toLocaleString()}`;
    document.getElementById('your-transfer').textContent = `£${yourTransfer.toLocaleString()}`;
    document.getElementById('spouse-transfer').textContent = `£${spouseTransfer.toLocaleString()}`;
    
    // Show results
    jointResults.style.display = 'block';
    
    // Update chart if it exists
    if (typeof window.updateJointExpensesChart === 'function') {
        window.updateJointExpensesChart(yourTransfer, spouseTransfer);
    }
} 