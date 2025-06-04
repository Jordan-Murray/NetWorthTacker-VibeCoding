/**
 * Milestones UI Module
 * Handles milestone tracking and visualization
 */
import { getDataStore } from './enhancedDataService.js';
import { formatCurrency } from './utils.js';

/**
 * Initialize milestones UI
 */
export function initMilestonesUI() {
    const dataStore = getDataStore();
    const milestones = dataStore.getMilestones();
    renderMilestonesTable(milestones);
    updateMilestonesChart(milestones);
}

/**
 * Render the milestones table
 * @param {Array} milestones - Array of milestone objects
 */
function renderMilestonesTable(milestones) {
    const tableBody = document.getElementById('milestones-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    milestones.forEach(milestone => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${milestone.name}</td>
            <td>${formatCurrency(milestone.amount)}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary edit-milestone" data-id="${milestone.id}">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-outline-danger delete-milestone" data-id="${milestone.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Set up action buttons
    setupMilestoneActionButtons();
}

/**
 * Set up milestone action buttons
 */
function setupMilestoneActionButtons() {
    // Edit buttons
    document.querySelectorAll('.edit-milestone').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editMilestone(id);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-milestone').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deleteMilestone(id);
        });
    });
}

/**
 * Edit a milestone
 * @param {string} id - The ID of the milestone to edit
 */
function editMilestone(id) {
    const dataStore = getDataStore();
    const milestone = dataStore.getMilestone(id);
    if (!milestone) return;
    
    showEditMilestoneModal(milestone);
}

/**
 * Delete a milestone
 * @param {string} id - The ID of the milestone to delete
 */
function deleteMilestone(id) {
    if (!confirm('Are you sure you want to delete this milestone?')) {
        return;
    }
    
    const dataStore = getDataStore();
    dataStore.removeMilestone(id);
    initMilestonesUI();
}

/**
 * Show edit milestone modal
 * @param {Object} milestone - The milestone to edit
 */
function showEditMilestoneModal(milestone) {
    const modalContent = `
        <h2>Edit Milestone</h2>
        <div class="form-group">
            <label for="milestone-name">Name:</label>
            <input type="text" id="milestone-name" value="${milestone.name}" />
        </div>
        <div class="form-group">
            <label for="milestone-target">Target Amount (£):</label>
            <input type="number" id="milestone-target" value="${milestone.amount}" min="0" step="0.01" />
        </div>
        <div class="form-actions">
            <button id="cancel-milestone" class="cancel-btn">Cancel</button>
            <button id="save-milestone" class="save-btn">Save Changes</button>
        </div>
    `;
    
    showModal(modalContent, 'edit-milestone');
    
    // Set up save button
    const saveBtn = document.getElementById('save-milestone');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const name = document.getElementById('milestone-name').value;
            const amount = parseFloat(document.getElementById('milestone-target').value);
            
            if (name && !isNaN(amount) && amount >= 0) {
                const dataStore = getDataStore();
                dataStore.updateMilestone(milestone.id, { name, amount });
                initMilestonesUI();
                hideModal();
            } else {
                alert('Please fill all fields with valid values');
            }
        });
    }
}

/**
 * Update the milestones chart
 * @param {Array} milestones - Array of milestone objects
 */
function updateMilestonesChart(milestones) {
    const chartContainer = document.getElementById('milestones-chart');
    if (!chartContainer) return;
    
    // Clear existing chart
    chartContainer.innerHTML = '';
    
    // Sort milestones by amount (highest to lowest)
    const sortedMilestones = [...milestones].sort((a, b) => b.amount - a.amount);
    
    // Create chart HTML
    const chartHTML = `
        <div class="chart-container">
            <canvas id="milestones-chart-canvas"></canvas>
        </div>
    `;
    
    chartContainer.innerHTML = chartHTML;
    
    // Get canvas context
    const canvas = document.getElementById('milestones-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set up chart data
    const data = {
        labels: sortedMilestones.map(m => m.name),
        datasets: [{
            label: 'Target Amount',
            data: sortedMilestones.map(m => m.amount),
            backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 99, 132, 0.6)'
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
        }]
    };
    
    // Chart options
    const options = {
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
                        return 'Target: £' + context.raw.toLocaleString();
                    }
                }
            }
        }
    };
    
    // Create chart
    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options
    });
}

// Expose refresh function globally for backward compatibility
window.refreshMilestones = initMilestonesUI;
