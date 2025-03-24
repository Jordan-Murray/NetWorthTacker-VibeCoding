/**
 * Data Management UI Module
 * Handles the UI for data import/export functionality
 */
import { exportData, importData } from './dataService.js';

/**
 * Initialize the settings icon functionality
 */
export function initSettingsIcon() {
    const settingsIcon = document.getElementById('settings-icon');
    if (settingsIcon) {
        settingsIcon.addEventListener('click', () => {
            showDataManagementModal();
        });
    }
}

/**
 * Show data management modal
 */
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
            <textarea id="export-data" rows="10" readonly>${exportData()}</textarea>
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
        </div>
    `;
    
    // Use enhanced modal system if available
    if (typeof window.showModal === 'function') {
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

/**
 * Setup actions for data management modal
 */
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
            const exportDataElement = document.getElementById('export-data');
            exportDataElement.select();
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
            const importDataText = document.getElementById('import-data').value;
            
            try {
                importData(importDataText);
                
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