/**
 * Milestones UI Module
 * Handles milestone tracking and visualization
 */
import { getCurrentData, saveData, generateId } from './dataService.js';
import { formatCurrency } from './utils.js';

/**
 * Initialize milestones UI
 */
export function initMilestonesUI() {
    renderMilestones();
    setupMilestoneForm();
}

/**
 * Render milestones list
 */
function renderMilestones() {
    const data = getCurrentData();
    if (!data.milestones) {
        data.milestones = [];
        saveData(data);
    }
    
    // Sort milestones by target amount
    const sortedMilestones = [...data.milestones].sort((a, b) => parseFloat(a.target) - parseFloat(b.target));
    
    const milestonesContainer = document.getElementById('milestones-container');
    if (!milestonesContainer) return;
    
    milestonesContainer.innerHTML = '';
    
    if (sortedMilestones.length === 0) {
        milestonesContainer.innerHTML = '<div class="alert alert-info">No milestones set. Add your first milestone!</div>';
        return;
    }
    
    // Calculate current net worth for progress
    let currentNetWorth = 0;
    const yearSelect = document.getElementById('year-select');
    const currentYear = yearSelect ? yearSelect.value : null;
    
    if (currentYear && data.years && data.years[currentYear]) {
        const yearData = data.years[currentYear];
        
        let assetsTotal = 0;
        if (yearData.assets) {
            assetsTotal = yearData.assets.reduce((total, asset) => total + parseFloat(asset.value), 0);
        }
        
        let liabilitiesTotal = 0;
        if (yearData.liabilities) {
            liabilitiesTotal = yearData.liabilities.reduce((total, liability) => total + parseFloat(liability.value), 0);
        }
        
        currentNetWorth = assetsTotal - liabilitiesTotal;
    }
    
    // Create milestone cards
    sortedMilestones.forEach(milestone => {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        
        // Calculate progress percentage
        let progressPercentage = 0;
        if (milestone.target > 0) {
            progressPercentage = Math.min(100, Math.max(0, (currentNetWorth / parseFloat(milestone.target)) * 100));
        }
        
        // Determine progress class
        let progressClass = 'bg-info';
        if (progressPercentage >= 100) {
            progressClass = 'bg-success';
        } else if (progressPercentage >= 75) {
            progressClass = 'bg-info';
        } else if (progressPercentage >= 50) {
            progressClass = 'bg-primary';
        } else if (progressPercentage >= 25) {
            progressClass = 'bg-warning';
        } else {
            progressClass = 'bg-danger';
        }
        
        // Create card content
        card.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="card-title mb-0">${milestone.name}</h5>
                    <div>
                        <button class="btn btn-sm btn-outline-danger delete-milestone" data-id="${milestone.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h6 class="card-subtitle mb-2 text-muted">Target: ${formatCurrency(milestone.target)}</h6>
                <div class="progress" style="height: 25px;">
                    <div class="progress-bar ${progressClass}" role="progressbar" 
                         style="width: ${progressPercentage}%;" 
                         aria-valuenow="${progressPercentage}" aria-valuemin="0" aria-valuemax="100">
                        ${Math.round(progressPercentage)}%
                    </div>
                </div>
                <div class="mt-2 text-muted">
                    Current: ${formatCurrency(currentNetWorth)} 
                    (${currentNetWorth >= parseFloat(milestone.target) ? 'Achieved!' : 
                       formatCurrency(parseFloat(milestone.target) - currentNetWorth) + ' to go'})
                </div>
                ${milestone.notes ? `<p class="card-text mt-2"><small>${milestone.notes}</small></p>` : ''}
            </div>
        `;
        
        milestonesContainer.appendChild(card);
    });
    
    // Set up delete buttons
    document.querySelectorAll('.delete-milestone').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deleteMilestone(id);
        });
    });
}

/**
 * Set up milestone form
 */
function setupMilestoneForm() {
    const form = document.getElementById('add-milestone-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('milestone-name');
        const targetInput = document.getElementById('milestone-target');
        const notesInput = document.getElementById('milestone-notes');
        
        if (!nameInput || !targetInput) return;
        
        const name = nameInput.value.trim();
        const target = parseFloat(targetInput.value);
        const notes = notesInput ? notesInput.value.trim() : '';
        
        if (!name || isNaN(target) || target <= 0) {
            alert('Please enter a valid name and target amount.');
            return;
        }
        
        // Add new milestone
        const data = getCurrentData();
        if (!data.milestones) {
            data.milestones = [];
        }
        
        data.milestones.push({
            id: generateId(),
            name,
            target,
            notes,
            dateAdded: new Date().toISOString()
        });
        
        saveData(data);
        
        // Reset form
        form.reset();
        
        // Update UI
        renderMilestones();
        
        // Close modal if open
        const modal = bootstrap.Modal.getInstance(document.getElementById('add-milestone-modal'));
        if (modal) {
            modal.hide();
        }
    });
}

/**
 * Delete a milestone
 * @param {string} id - The ID of the milestone to delete
 */
function deleteMilestone(id) {
    if (!confirm('Are you sure you want to delete this milestone?')) {
        return;
    }
    
    const data = getCurrentData();
    if (!data.milestones) return;
    
    // Find and remove the milestone
    const index = data.milestones.findIndex(m => m.id === id);
    if (index !== -1) {
        data.milestones.splice(index, 1);
        saveData(data);
        renderMilestones();
    }
} 