/**
 * Salary Tracker UI Module
 * Handles salary history tracking and visualization
 */
import { getDataStore } from './enhancedDataService.js';
import { formatCurrency, calculatePercentChange } from './utils.js';
import { updateSalaryGrowthChart } from './chartModule.js';

/**
 * Initialize salary tracker UI
 */
export function initSalaryTrackerUI() {
    const dataStore = getDataStore();
    const salaryHistory = dataStore.getSalaryHistory();
    renderSalaryTable(salaryHistory);
    updateSalaryGrowthChart();
}

/**
 * Render the salary history table
 */
function renderSalaryTable(salaryHistory) {
    const tableBody = document.getElementById('salary-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Sort entries by date (most recent first)
    const sortedEntries = [...salaryHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedEntries.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="4" class="text-center">No salary entries yet. Add your first entry!</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Add percent change from previous entry
    let previousAmount = null;
    sortedEntries.forEach((entry, index) => {
        entry.increasePercent = 0;
        if (index < sortedEntries.length - 1) {
            const prevEntry = sortedEntries[index + 1];
            entry.increasePercent = calculatePercentChange(prevEntry.amount, entry.amount);
        }
    });
    
    sortedEntries.forEach(entry => {
        const row = document.createElement('tr');
        
        const formattedDate = new Date(entry.date).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short'
        });
        
        const increaseText = entry.increasePercent === 0 ? '' : 
            `<span class="${entry.increasePercent > 0 ? 'text-success' : 'text-danger'}">
                ${entry.increasePercent > 0 ? '+' : ''}${entry.increasePercent.toFixed(1)}%
            </span>`;
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${entry.company}</td>
            <td>${formatCurrency(entry.amount)} ${increaseText}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary edit-salary" data-id="${entry.id}">
                        <i class="fa-solid fa-edit"></i> Edit
                    </button>
                    <button type="button" class="btn btn-outline-danger delete-salary" data-id="${entry.id}">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Set up action buttons
    setupSalaryActionButtons();
}

/**
 * Set up salary action buttons
 */
function setupSalaryActionButtons() {
    // Edit buttons
    document.querySelectorAll('.edit-salary').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editSalaryEntry(id);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-salary').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deleteSalaryEntry(id);
        });
    });
}

/**
 * Edit a salary entry
 * @param {string} id - The ID of the salary entry to edit
 */
function editSalaryEntry(id) {
    const dataStore = getDataStore();
    const entry = dataStore.getSalaryEntry(id);
    if (!entry) return;
    
    showEditSalaryModal(entry);
}

/**
 * Delete a salary entry
 * @param {string} id - The ID of the salary entry to delete
 */
function deleteSalaryEntry(id) {
    if (!confirm('Are you sure you want to delete this salary entry?')) {
        return;
    }
    
    const dataStore = getDataStore();
    dataStore.removeSalaryEntry(id);
    initSalaryTrackerUI();
}

/**
 * Show edit salary modal
 * @param {Object} entry - The salary entry to edit
 */
function showEditSalaryModal(entry) {
    const modalContent = `
        <h2>Edit Salary Entry</h2>
        <div class="form-group">
            <label for="salary-date">Date:</label>
            <input type="date" id="salary-date" value="${entry.date.split('T')[0]}" />
        </div>
        <div class="form-group">
            <label for="salary-company">Company:</label>
            <input type="text" id="salary-company" value="${entry.company}" />
        </div>
        <div class="form-group">
            <label for="salary-title">Title:</label>
            <input type="text" id="salary-title" value="${entry.title}" />
        </div>
        <div class="form-group">
            <label for="salary-amount">Amount (£):</label>
            <input type="number" id="salary-amount" value="${entry.amount}" min="0" step="0.01" />
        </div>
        <div class="form-actions">
            <button id="cancel-salary" class="cancel-btn">Cancel</button>
            <button id="save-salary" class="save-btn">Save Changes</button>
        </div>
    `;
    
    showModal(modalContent, 'edit-salary');
    
    // Set up save button
    const saveBtn = document.getElementById('save-salary');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const date = document.getElementById('salary-date').value;
            const company = document.getElementById('salary-company').value;
            const title = document.getElementById('salary-title').value;
            const amount = parseFloat(document.getElementById('salary-amount').value);
            
            if (date && company && title && !isNaN(amount) && amount >= 0) {
                const dataStore = getDataStore();
                dataStore.updateSalaryEntry(entry.id, { date, company, title, amount });
                initSalaryTrackerUI();
                hideModal();
            } else {
                alert('Please fill all fields with valid values');
            }
        });
    }
}
