/**
 * Modal Manager Module
 * Handles all modal interactions
 */
export class ModalManager {
    constructor(dataStore, uiController, chartManager) {
        this.dataStore = dataStore;
        this.uiController = uiController;
        this.chartManager = chartManager;
        this.modalContainer = document.getElementById('modal-container');
        this.modalBody = document.getElementById('modal-body');
        
        // Ensure the modal is hidden initially
        if (this.modalContainer) {
            this.modalContainer.classList.add('modal-hidden');
            this.modalContainer.classList.remove('modal-visible');
        }
        
        // Initialize modal event handlers
        this.initializeModalEvents();
    }
    
    /**
     * Initialize global modal event handlers
     */
    initializeModalEvents() {
        if (!this.modalContainer) return;
        
        // Close modal when clicking the X button
        const closeButton = this.modalContainer.querySelector('.close-modal');
        if (closeButton) {
            // Remove any existing event listeners to prevent duplicates
            closeButton.replaceWith(closeButton.cloneNode(true));
            
            // Add fresh event listener
            this.modalContainer.querySelector('.close-modal').addEventListener('click', () => {
                this.hideModal();
            });
        }
        
        // Close modal when clicking outside the modal content
        // Use a named function to be able to remove and re-add the event listener
        this.outsideClickHandler = (e) => {
            if (e.target === this.modalContainer) {
                this.hideModal();
            }
        };
        
        // Remove existing listener if any and add a new one
        this.modalContainer.removeEventListener('click', this.outsideClickHandler);
        this.modalContainer.addEventListener('click', this.outsideClickHandler);
        
        // Close modal on Escape key
        this.escKeyHandler = (e) => {
            if (e.key === 'Escape' && !this.modalContainer.classList.contains('modal-hidden')) {
                this.hideModal();
            }
        };
        
        // Remove existing listener if any and add a new one
        document.removeEventListener('keydown', this.escKeyHandler);
        document.addEventListener('keydown', this.escKeyHandler);
    }
    
    /**
     * Show the modal with custom content
     */
    showModal(content) {
        if (!this.modalContainer || !this.modalBody) return;
        
        this.modalBody.innerHTML = content;
        this.modalContainer.classList.remove('modal-hidden');
        this.modalContainer.classList.add('modal-visible');
        
        // Reinitialize event handlers to ensure they work with new content
        this.initializeModalEvents();
    }
    
    /**
     * Hide the modal
     */
    hideModal() {
        if (!this.modalContainer) return;
        this.modalContainer.classList.add('modal-hidden');
        this.modalContainer.classList.remove('modal-visible');
    }
    
    /**
     * Show Export/Import Data modal
     */
    showDataManagementModal() {
        const currentData = JSON.stringify(this.dataStore.data, null, 2);
        
        const content = `
            <h2>Data Management</h2>
            <p>Export your data as JSON to back it up, or import previously exported data.</p>
            
            <div class="tabs">
                <button class="tab-button active" data-tab="export">Export Data</button>
                <button class="tab-button" data-tab="import">Import Data</button>
            </div>
            
            <div class="tab-content active" id="export-tab">
                <p>Copy the JSON data below to save it:</p>
                <textarea id="export-data" rows="10" readonly>${currentData}</textarea>
                <div class="form-actions">
                    <button id="copy-data" class="save-btn">Copy to Clipboard</button>
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
        
        this.showModal(content);
        
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
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });
        
        // Set up copy to clipboard
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
        
        // Set up import data
        const importButton = document.getElementById('import-data-btn');
        if (importButton) {
            importButton.addEventListener('click', () => {
                const importData = document.getElementById('import-data').value;
                
                try {
                    const parsedData = JSON.parse(importData);
                    
                    // Basic validation
                    if (!parsedData.years || !parsedData.milestones) {
                        throw new Error('Invalid data format');
                    }
                    
                    this.dataStore.data = parsedData;
                    this.dataStore.saveData();
                    
                    // Update UI
                    this.uiController.renderYearSelector();
                    this.uiController.renderFinancialTables();
                    this.uiController.renderDashboardSummary();
                    this.uiController.renderMilestones();
                    
                    // Update charts
                    this.chartManager.updateAllCharts();
                    
                    this.hideModal();
                    alert('Data imported successfully!');
                } catch (error) {
                    alert(`Error importing data: ${error.message}`);
                }
            });
        }
        
        // Set up cancel button
        const cancelButton = document.getElementById('cancel-import');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                this.hideModal();
            });
        }
    }
    
    /**
     * Show data reset confirmation modal
     */
    showResetDataModal() {
        const content = `
            <h2>Reset All Data</h2>
            <p class="warning">Warning: This will permanently delete all your financial data!</p>
            <p>This action cannot be undone. Consider exporting your data first.</p>
            <div class="form-actions">
                <button id="cancel-reset" class="save-btn">Cancel</button>
                <button id="confirm-reset" class="danger-btn">Yes, Reset All Data</button>
            </div>
        `;
        
        this.showModal(content);
        
        // Set up cancel button
        const cancelButton = document.getElementById('cancel-reset');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                this.hideModal();
            });
        }
        
        // Set up confirm button
        const confirmButton = document.getElementById('confirm-reset');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                // Clear localStorage
                localStorage.removeItem('netWorthData');
                
                // Reinitialize data
                this.dataStore.initializeDefaultData();
                
                // Update UI
                this.uiController.renderYearSelector();
                this.uiController.renderFinancialTables();
                this.uiController.renderDashboardSummary();
                this.uiController.renderMilestones();
                
                // Update charts
                this.chartManager.updateAllCharts();
                
                this.hideModal();
                alert('All data has been reset.');
            });
        }
    }
} 