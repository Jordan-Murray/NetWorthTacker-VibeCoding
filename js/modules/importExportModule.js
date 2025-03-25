/**
 * Import/Export Module
 * Handles data backup and restore functionality
 */
import { getDataStore, exportData, importData } from './enhancedDataService.js';
import { showModal, hideModal } from './modalModule.js';

/**
 * Initialize import/export functionality
 */
export function initImportExport() {
    // Add click handler to settings icon
    const settingsIcon = document.getElementById('settings-icon');
    if (settingsIcon) {
        // Clone to prevent multiple handlers
        const newSettingsIcon = settingsIcon.cloneNode(true);
        settingsIcon.parentNode.replaceChild(newSettingsIcon, settingsIcon);
        
        newSettingsIcon.addEventListener('click', showImportExportModal);
    }
    
    // Export global reference for compatibility
    window.showImportExportModal = showImportExportModal;
}

/**
 * Show the import/export modal
 */
export function showImportExportModal() {
    const currentData = exportData();
    
    const modalContent = `
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
                <button id="download-data" class="save-btn">Download as File</button>
            </div>
        </div>
        
        <div class="tab-content" id="import-tab" style="display: none;">
            <p>Paste your previously exported JSON data below:</p>
            <textarea id="import-data" rows="10" placeholder="Paste your backup data here..."></textarea>
            <div class="form-actions">
                <button id="cancel-import" class="cancel-btn">Cancel</button>
                <button id="import-data-btn" class="save-btn">Import Data</button>
            </div>
            <p class="warning">Warning: This will overwrite your current data!</p>
        </div>
    `;
    
    showModal(modalContent, 'data-management');
    
    // Set up download button
    const downloadButton = document.getElementById('download-data');
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadDataFile);
    }
}

/**
 * Download data as a JSON file
 */
function downloadDataFile() {
    const dataStr = exportData();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `net-worth-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Import data from a file
 * @param {File} file - File to import
 * @returns {Promise<boolean>} Success status
 */
export function importFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const jsonData = event.target.result;
                importData(jsonData);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
    });
}

/**
 * Reset all data
 * Requires confirmation
 */
export function resetAllData() {
    const confirmation = confirm(
        'Are you sure you want to reset all data? This cannot be undone!'
    );
    
    if (confirmation) {
        const dataStore = getDataStore();
        dataStore.initializeDefaultData();
        
        alert('All data has been reset to defaults.');
        window.location.reload(); // Reload page to reflect changes
    }
}