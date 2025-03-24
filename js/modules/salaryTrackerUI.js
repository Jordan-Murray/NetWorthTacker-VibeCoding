/**
 * Salary Tracker UI Module
 * Handles salary history tracking and visualization
 */
import { getCurrentData, saveData, generateId } from './dataService.js';
import { formatCurrency, calculatePercentChange } from './utils.js';
import { renderSalaryChart } from './chartsUI.js';

/**
 * Initialize salary tracker UI
 */
export function initSalaryTrackerUI() {
    renderSalaryTable();
    setupSalaryForm();
}

/**
 * Render the salary history table
 */
function renderSalaryTable() {
    const data = getCurrentData();
    if (!data.salaryHistory) {
        data.salaryHistory = [];
        saveData(data);
    }
    
    // Sort by date (newest first)
    const sortedEntries = [...data.salaryHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const tableBody = document.getElementById('salary-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (sortedEntries.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="5" class="text-center">No salary entries yet. Add your first entry!</td>';
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
    
    // Create table rows
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
            <td>${entry.title}</td>
            <td>${formatCurrency(entry.amount)} ${increaseText}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary edit-salary" data-id="${entry.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-outline-danger delete-salary" data-id="${entry.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Set up action buttons
    document.querySelectorAll('.edit-salary').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editSalaryEntry(id);
        });
    });
    
    document.querySelectorAll('.delete-salary').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deleteSalaryEntry(id);
        });
    });
    
    // Update chart
    renderSalaryChart();
}

/**
 * Set up salary form
 */
function setupSalaryForm() {
    const form = document.getElementById('add-salary-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const dateInput = document.getElementById('salary-date');
        const companyInput = document.getElementById('salary-company');
        const titleInput = document.getElementById('salary-title');
        const amountInput = document.getElementById('salary-amount');
        const notesInput = document.getElementById('salary-notes');
        const entryIdInput = document.getElementById('salary-entry-id');
        
        if (!dateInput || !companyInput || !titleInput || !amountInput) return;
        
        const date = dateInput.value;
        const company = companyInput.value.trim();
        const title = titleInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const notes = notesInput ? notesInput.value.trim() : '';
        const entryId = entryIdInput ? entryIdInput.value : '';
        
        if (!date || !company || !title || isNaN(amount) || amount <= 0) {
            alert('Please fill in all required fields with valid values.');
            return;
        }
        
        const data = getCurrentData();
        if (!data.salaryHistory) {
            data.salaryHistory = [];
        }
        
        if (entryId) {
            // Edit existing entry
            const index = data.salaryHistory.findIndex(entry => entry.id === entryId);
            if (index !== -1) {
                data.salaryHistory[index] = {
                    ...data.salaryHistory[index],
                    date,
                    company,
                    title,
                    amount,
                    notes,
                    lastModified: new Date().toISOString()
                };
            }
        } else {
            // Add new entry
            data.salaryHistory.push({
                id: generateId(),
                date,
                company,
                title,
                amount,
                notes,
                dateAdded: new Date().toISOString()
            });
        }
        
        saveData(data);
        
        // Reset form and update UI
        form.reset();
        document.getElementById('salary-form-title').textContent = 'Add Salary Entry';
        if (entryIdInput) entryIdInput.value = '';
        
        renderSalaryTable();
        
        // Close modal if open
        const modal = bootstrap.Modal.getInstance(document.getElementById('add-salary-modal'));
        if (modal) {
            modal.hide();
        }
    });
}

/**
 * Edit a salary entry
 * @param {string} id - The ID of the entry to edit
 */
function editSalaryEntry(id) {
    const data = getCurrentData();
    if (!data.salaryHistory) return;
    
    const entry = data.salaryHistory.find(entry => entry.id === id);
    if (!entry) return;
    
    // Fill form with entry data
    const dateInput = document.getElementById('salary-date');
    const companyInput = document.getElementById('salary-company');
    const titleInput = document.getElementById('salary-title');
    const amountInput = document.getElementById('salary-amount');
    const notesInput = document.getElementById('salary-notes');
    const entryIdInput = document.getElementById('salary-entry-id');
    
    if (!dateInput || !companyInput || !titleInput || !amountInput || !entryIdInput) return;
    
    // Format date for input (YYYY-MM)
    const dateObj = new Date(entry.date);
    const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    
    dateInput.value = formattedDate;
    companyInput.value = entry.company;
    titleInput.value = entry.title;
    amountInput.value = entry.amount;
    if (notesInput) notesInput.value = entry.notes || '';
    entryIdInput.value = entry.id;
    
    // Update form title
    document.getElementById('salary-form-title').textContent = 'Edit Salary Entry';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('add-salary-modal'));
    modal.show();
}

/**
 * Delete a salary entry
 * @param {string} id - The ID of the entry to delete
 */
function deleteSalaryEntry(id) {
    if (!confirm('Are you sure you want to delete this salary entry?')) {
        return;
    }
    
    const data = getCurrentData();
    if (!data.salaryHistory) return;
    
    // Find and remove the entry
    const index = data.salaryHistory.findIndex(entry => entry.id === id);
    if (index !== -1) {
        data.salaryHistory.splice(index, 1);
        saveData(data);
        renderSalaryTable();
    }
} 