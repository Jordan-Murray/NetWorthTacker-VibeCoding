/**
 * Test script to debug JavaScript loading issues
 */
console.log('TEST-SCRIPT.JS LOADED');

// Function to test settings button
function testSettingsButton() {
    console.log('Testing settings button functionality');
    
    const settingsBtn = document.getElementById('settings-icon');
    console.log('Settings button found?', settingsBtn);
    
    if (settingsBtn) {
        // Remove any existing click listeners
        const newBtn = settingsBtn.cloneNode(true);
        settingsBtn.parentNode.replaceChild(newBtn, settingsBtn);
        
        // Add our test click handler
        newBtn.addEventListener('click', function(event) {
            console.log('Settings button clicked in test-script.js');
            
            // Create and show a simple modal
            const modal = document.getElementById('modal-container');
            const modalBody = document.getElementById('modal-body');
            
            if (modal && modalBody) {
                console.log('Modal elements found, showing test modal');
                
                // Set content for data import/export
                modalBody.innerHTML = `
                    <h2>Data Management</h2>
                    <p>Export your data as JSON to back it up, or import previously exported data.</p>
                    
                    <div class="tabs">
                        <button class="tab-button active" data-tab="export">Export Data</button>
                        <button class="tab-button" data-tab="import">Import Data</button>
                    </div>
                    
                    <div class="tab-content active" id="export-tab">
                        <p>Copy the JSON data below to save it:</p>
                        <textarea id="export-data" rows="10" readonly>${JSON.stringify(localStorage.getItem('netWorthData') || '{}', null, 2)}</textarea>
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
                    </div>
                `;
                
                // Show modal
                modal.style.display = 'flex';
                modal.style.visibility = 'visible';
                modal.style.opacity = '1';
                modal.classList.remove('modal-hidden');
                modal.classList.add('modal-visible');
                
                // Set up tab switching
                const tabButtons = document.querySelectorAll('.tab-button');
                const tabContents = document.querySelectorAll('.tab-content');
                
                tabButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const targetTab = button.getAttribute('data-tab');
                        console.log('Tab button clicked:', targetTab);
                        
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
                
                // Add close button functionality
                const closeBtn = document.querySelector('.close-modal');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        modal.classList.add('modal-hidden');
                        modal.classList.remove('modal-visible');
                    });
                }
                
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
                
                // Prevent other handlers from running
                event.stopPropagation();
            } else {
                console.error('Modal elements not found:', { modal, modalBody });
                alert('Modal elements not found! Check console for details.');
            }
        });
    }
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded in test-script.js');
    testSettingsButton();
});

// Also try immediately
console.log('Running testSettingsButton immediately');
testSettingsButton(); 