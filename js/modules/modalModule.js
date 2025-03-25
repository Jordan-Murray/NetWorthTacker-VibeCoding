/**
 * Modal Module
 * A robust approach to handling modals that won't fail
 */

/**
 * Show a modal with the given content
 * @param {string} content - HTML content for the modal body
 * @param {string} modalType - Type of modal (for setup of specific actions)
 */
export function showModal(content, modalType) {
    const modalContainer = document.getElementById('modal-container');
    const modalBody = document.getElementById('modal-body');
    
    if (!modalContainer || !modalBody) {
        console.error('Modal elements not found');
        return;
    }
    
    // Set content if provided
    if (content) {
        modalBody.innerHTML = content;
        
        // Set up action buttons based on modal type
        setupModalActions(modalType);
    }
    
    // Using multiple techniques for maximum reliability
    
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
}

/**
 * Hide the currently shown modal
 */
export function hideModal() {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) {
        console.error('Modal container not found');
        return;
    }
    
    // Using multiple techniques for maximum reliability
    
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
}

/**
 * Set up action buttons based on modal type
 * @param {string} modalType - Type of modal
 */
function setupModalActions(modalType) {
    // Set up common cancel buttons that just close the modal
    const cancelButtons = document.querySelectorAll('.cancel-btn');
    cancelButtons.forEach(btn => {
        // Create a new button to replace the old one to avoid multiple event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            hideModal();
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
        case 'data-management':
            setupDataManagementActions();
            break;
        // Other cases can be added as needed
    }
}

// Import functions from specific modules to handle modal actions
import { addYear } from './yearManagerUI.js';
import { addAsset, addLiability } from './financialTablesUI.js';
import { addMilestone } from './milestonesUI.js';
import { addSalaryEntry } from './salaryTrackerUI.js';
import { importData, exportData } from './dataService.js';

/**
 * Set up add year form actions
 */
function setupAddYearActions() {
    const saveYearBtn = document.getElementById('save-year');
    if (saveYearBtn) {
        const newBtn = saveYearBtn.cloneNode(true);
        saveYearBtn.parentNode.replaceChild(newBtn, saveYearBtn);
        
        newBtn.addEventListener('click', () => {
            const yearInput = document.getElementById('new-year');
            const year = parseInt(yearInput.value, 10);
            
            if (year && year >= 1900 && year <= 2100) {
                addYear(year);
                hideModal();
            } else {
                alert('Please enter a valid year between 1900 and 2100');
            }
        });
    }
}

/**
 * Set up add asset form actions
 */
function setupAddAssetActions() {
    const saveAssetBtn = document.getElementById('save-asset');
    if (saveAssetBtn) {
        const newBtn = saveAssetBtn.cloneNode(true);
        saveAssetBtn.parentNode.replaceChild(newBtn, saveAssetBtn);
        
        newBtn.addEventListener('click', () => {
            const category = document.getElementById('asset-category').value;
            const name = document.getElementById('asset-name').value;
            const valueInput = document.getElementById('asset-value').value;
            const value = parseFloat(valueInput);
            
            if (category && name && !isNaN(value) && value >= 0) {
                const yearSelect = document.getElementById('year-select');
                const year = yearSelect ? yearSelect.value : new Date().getFullYear().toString();
                
                addAsset(year, category, name, value);
                hideModal();
            } else {
                alert('Please fill all fields with valid values');
            }
        });
    }
}

/**
 * Set up add liability form actions
 */
function setupAddLiabilityActions() {
    const saveLiabilityBtn = document.getElementById('save-liability');
    if (saveLiabilityBtn) {
        const newBtn = saveLiabilityBtn.cloneNode(true);
        saveLiabilityBtn.parentNode.replaceChild(newBtn, saveLiabilityBtn);
        
        newBtn.addEventListener('click', () => {
            const category = document.getElementById('liability-category').value;
            const valueInput = document.getElementById('liability-value').value;
            const value = parseFloat(valueInput);
            
            if (category && !isNaN(value) && value >= 0) {
                const yearSelect = document.getElementById('year-select');
                const year = yearSelect ? yearSelect.value : new Date().getFullYear().toString();
                
                addLiability(year, category, value);
                hideModal();
            } else {
                alert('Please fill all fields with valid values');
            }
        });
    }
}

/**
 * Set up add milestone form actions
 */
function setupAddMilestoneActions() {
    const saveMilestoneBtn = document.getElementById('save-milestone');
    if (saveMilestoneBtn) {
        const newBtn = saveMilestoneBtn.cloneNode(true);
        saveMilestoneBtn.parentNode.replaceChild(newBtn, saveMilestoneBtn);
        
        newBtn.addEventListener('click', () => {
            const amountInput = document.getElementById('milestone-amount').value;
            const name = document.getElementById('milestone-name').value;
            const amount = parseFloat(amountInput);
            
            if (!isNaN(amount) && amount > 0 && name) {
                addMilestone(amount, name);
                hideModal();
            } else {
                alert('Please enter a valid amount and name');
            }
        });
    }
}

/**
 * Set up add salary form actions
 */
function setupAddSalaryActions() {
    const saveSalaryBtn = document.getElementById('save-salary');
    if (saveSalaryBtn) {
        const newBtn = saveSalaryBtn.cloneNode(true);
        saveSalaryBtn.parentNode.replaceChild(newBtn, saveSalaryBtn);
        
        newBtn.addEventListener('click', () => {
            const dateInput = document.getElementById('salary-date').value;
            const company = document.getElementById('salary-company').value;
            const title = document.getElementById('salary-title').value;
            const amountInput = document.getElementById('salary-amount').value;
            const amount = parseFloat(amountInput);
            
            if (dateInput && company && title && !isNaN(amount) && amount >= 0) {
                try {
                    // Convert the input (YYYY-MM) to a Date object
                    const date = new Date(dateInput);
                    
                    addSalaryEntry(date, company, title, amount);
                    hideModal();
                } catch (error) {
                    alert('Error adding salary entry: ' + error.message);
                }
            } else {
                alert('Please fill all fields with valid values');
            }
        });
    }
}

/**
 * Set up data management (import/export) actions
 */
function setupDataManagementActions() {
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
                importData(importDataText);
                hideModal();
                window.location.reload(); // Reload to reflect imported data
            } catch (error) {
                alert(`Error importing data: ${error.message}`);
            }
        });
    }
}

/**
 * Initialize modal handling
 */
export function initModal() {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) {
        console.error('Modal container not found');
        return;
    }
    
    // Close button
    const closeButton = modalContainer.querySelector('.close-modal');
    if (closeButton) {
        const newCloseButton = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
        
        newCloseButton.addEventListener('click', () => {
            hideModal();
        });
    }
    
    // Click outside to close
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            hideModal();
        }
    });
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modalContainer.classList.contains('modal-hidden')) {
            hideModal();
        }
    });
    
    // Add a global reference so other code can use it
    window.showModal = showModal;
    window.hideModal = hideModal;
}