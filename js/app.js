// Main Application Entry Point
import { DataStore } from './dataStore.js';
import { UIController } from './uiController.js';
import { ChartManager } from './chartManager.js';
import { ModalManager } from './modalManager.js';
import { formatCurrency, calculatePercentChange } from './utils.js';

// Initialize app when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize global data store
    const dataStore = new DataStore();
    
    // Initialize UI controller
    const ui = new UIController(dataStore);
    
    // Initialize chart manager
    const chartManager = new ChartManager(dataStore);
    
    // Initialize modal manager
    const modalManager = new ModalManager(dataStore, ui, chartManager);
    
    // Create a global reference to the app components so modal-fix.js can access them
    window.appInstance = {
        dataStore,
        ui,
        chartManager,
        modalManager
    };
    
    // Set up navigation event listeners
    setupNavigation();
    
    // Initial render of data
    initializeApp(dataStore, ui, chartManager);

    // Check if URL has a hash and navigate to that section
    handleInitialNavigation();
});

function handleInitialNavigation() {
    // If there's a hash in the URL, navigate to that section
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetSection = document.getElementById(targetId);
        const targetLink = document.querySelector(`#main-nav a[href="#${targetId}"]`);

        if (targetSection && targetLink) {
            // Update active navigation item
            document.querySelectorAll('#main-nav a').forEach(link => link.classList.remove('active'));
            targetLink.classList.add('active');

            // Show target section, hide others
            document.querySelectorAll('main > section').forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active-section');
                    section.classList.remove('hidden-section');
                } else {
                    section.classList.remove('active-section');
                    section.classList.add('hidden-section');
                }
            });
        }
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('#main-nav a');
    const sections = document.querySelectorAll('main > section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Update active navigation item
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
            
            // Show target section, hide others
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active-section');
                    section.classList.remove('hidden-section');
                } else {
                    section.classList.remove('active-section');
                    section.classList.add('hidden-section');
                }
            });

            // Update the URL hash
            window.location.hash = targetId;
        });
    });
}

function initializeApp(dataStore, ui, chartManager) {
    // Load data from localStorage if available
    dataStore.loadData();
    
    // Render UI components
    ui.renderYearSelector();
    ui.renderFinancialTables();
    ui.renderDashboardSummary();
    ui.renderMilestones();
    ui.renderSalaryTable();
    
    // Initialize charts
    chartManager.initializeCharts();
    chartManager.updateAllCharts();
    
    // Add event listeners for interactive elements
    setupEventListeners(dataStore, ui, chartManager);
}

function setupEventListeners(dataStore, ui, chartManager) {
    // Year selector
    const yearSelect = document.getElementById('year-select');
    if (yearSelect) {
        yearSelect.addEventListener('change', () => {
            ui.renderFinancialTables();
        });
    }
    
    // Add year button
    const addYearBtn = document.getElementById('add-year');
    if (addYearBtn) {
        addYearBtn.addEventListener('click', () => {
            const modal = document.getElementById('modal-container');
            const modalBody = document.getElementById('modal-body');
            
            // Show add year modal
            modalBody.innerHTML = `
                <h2>Add New Year</h2>
                <div class="form-group">
                    <label for="new-year">Year:</label>
                    <input type="number" id="new-year" min="1900" max="2100" value="${new Date().getFullYear()}" />
                </div>
                <div class="form-actions">
                    <button id="cancel-year" class="cancel-btn">Cancel</button>
                    <button id="save-year" class="save-btn">Add Year</button>
                </div>
            `;
            
            modal.classList.remove('modal-hidden');
            modal.classList.add('modal-visible');
            
            // Set up modal event listeners
            document.getElementById('cancel-year').addEventListener('click', () => {
                modal.classList.add('modal-hidden');
                modal.classList.remove('modal-visible');
            });
            
            document.getElementById('save-year').addEventListener('click', () => {
                const yearInput = document.getElementById('new-year');
                const year = parseInt(yearInput.value, 10);
                
                if (year && year >= 1900 && year <= 2100) {
                    dataStore.addYear(year);
                    ui.renderYearSelector();
                    modal.classList.add('modal-hidden');
                    modal.classList.remove('modal-visible');
                } else {
                    alert('Please enter a valid year between 1900 and 2100');
                }
            });
        });
    }
    
    // Add asset button
    const addAssetBtn = document.getElementById('add-asset');
    if (addAssetBtn) {
        addAssetBtn.addEventListener('click', () => {
            const currentYear = document.getElementById('year-select').value;
            const modal = document.getElementById('modal-container');
            
            // Show add asset form in modal
            document.getElementById('modal-body').innerHTML = `
                <h2>Add New Asset</h2>
                <div class="form-group">
                    <label for="asset-category">Category:</label>
                    <select id="asset-category">
                        <option value="Properties">Properties</option>
                        <option value="Retirement Savings">Retirement Savings</option>
                        <option value="Investments">Investments</option>
                        <option value="Cash and Cash Equivalent">Cash and Cash Equivalent</option>
                        <option value="Other Assets">Other Assets</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="asset-name">Item Name:</label>
                    <input type="text" id="asset-name" placeholder="e.g. Home, Car, Stocks..." />
                </div>
                <div class="form-group">
                    <label for="asset-value">Value (£):</label>
                    <input type="number" id="asset-value" min="0" step="0.01" />
                </div>
                <div class="form-actions">
                    <button id="cancel-asset" class="cancel-btn">Cancel</button>
                    <button id="save-asset" class="save-btn">Add Asset</button>
                </div>
            `;
            
            modal.classList.remove('modal-hidden');
            modal.classList.add('modal-visible');
            
            // Set up modal event listeners
            document.getElementById('cancel-asset').addEventListener('click', () => {
                modal.classList.add('modal-hidden');
                modal.classList.remove('modal-visible');
            });
            
            document.getElementById('save-asset').addEventListener('click', () => {
                const category = document.getElementById('asset-category').value;
                const name = document.getElementById('asset-name').value;
                const valueInput = document.getElementById('asset-value').value;
                const value = parseFloat(valueInput);
                
                if (category && name && !isNaN(value) && value >= 0) {
                    dataStore.addAsset(currentYear, category, name, value);
                    ui.renderFinancialTables();
                    ui.renderDashboardSummary();
                    chartManager.updateAllCharts();
                    modal.classList.add('modal-hidden');
                    modal.classList.remove('modal-visible');
                } else {
                    alert('Please fill all fields with valid values');
                }
            });
        });
    }
    
    // Add liability button
    const addLiabilityBtn = document.getElementById('add-liability');
    if (addLiabilityBtn) {
        addLiabilityBtn.addEventListener('click', () => {
            const currentYear = document.getElementById('year-select').value;
            const modal = document.getElementById('modal-container');
            
            // Show add liability form in modal
            document.getElementById('modal-body').innerHTML = `
                <h2>Add New Liability</h2>
                <div class="form-group">
                    <label for="liability-category">Category:</label>
                    <select id="liability-category">
                        <option value="Mortgages">Mortgages</option>
                        <option value="Car loans">Car loans</option>
                        <option value="Student loans">Student loans</option>
                        <option value="Credit Card Debt">Credit Card Debt</option>
                        <option value="Personal Loans">Personal Loans</option>
                        <option value="Other Debts">Other Debts</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="liability-value">Value (£):</label>
                    <input type="number" id="liability-value" min="0" step="0.01" />
                </div>
                <div class="form-actions">
                    <button id="cancel-liability" class="cancel-btn">Cancel</button>
                    <button id="save-liability" class="save-btn">Add Liability</button>
                </div>
            `;
            
            modal.classList.remove('modal-hidden');
            modal.classList.add('modal-visible');
            
            // Set up modal event listeners
            document.getElementById('cancel-liability').addEventListener('click', () => {
                modal.classList.add('modal-hidden');
                modal.classList.remove('modal-visible');
            });
            
            document.getElementById('save-liability').addEventListener('click', () => {
                const category = document.getElementById('liability-category').value;
                const valueInput = document.getElementById('liability-value').value;
                const value = parseFloat(valueInput);
                
                if (category && !isNaN(value) && value >= 0) {
                    dataStore.addLiability(currentYear, category, value);
                    ui.renderFinancialTables();
                    ui.renderDashboardSummary();
                    chartManager.updateAllCharts();
                    modal.classList.add('modal-hidden');
                    modal.classList.remove('modal-visible');
                } else {
                    alert('Please fill all fields with valid values');
                }
            });
        });
    }
    
    // Refresh trends button
    const refreshTrendsBtn = document.getElementById('refresh-trends-btn');
    if (refreshTrendsBtn) {
        refreshTrendsBtn.addEventListener('click', () => {
            chartManager.updateAllCharts();
        });
    }
    
    // Add milestone button
    setupAddMilestoneButton(dataStore, ui);
    
    // Add salary button
    setupAddSalaryButton(dataStore, ui, chartManager);
}

function setupAddMilestoneButton(dataStore, ui) {
    const addMilestoneBtn = document.getElementById('add-milestone');
    if (addMilestoneBtn) {
        addMilestoneBtn.addEventListener('click', () => {
            const modal = document.getElementById('modal-container');
            const modalBody = document.getElementById('modal-body');
            
            // Show add milestone modal
            modalBody.innerHTML = `
                <h2>Add New Milestone</h2>
                <div class="form-group">
                    <label for="milestone-amount">Amount (£):</label>
                    <input type="number" id="milestone-amount" min="0" step="1000" />
                </div>
                <div class="form-group">
                    <label for="milestone-name">Milestone Name:</label>
                    <input type="text" id="milestone-name" placeholder="e.g. First £10K, Six Figure Club..." />
                </div>
                <div class="form-actions">
                    <button id="cancel-milestone" class="cancel-btn">Cancel</button>
                    <button id="save-milestone" class="save-btn">Add Milestone</button>
                </div>
            `;
            
            modal.classList.remove('modal-hidden');
            modal.classList.add('modal-visible');
            
            // Set up modal event listeners
            document.getElementById('cancel-milestone').addEventListener('click', () => {
                modal.classList.add('modal-hidden');
                modal.classList.remove('modal-visible');
            });
            
            document.getElementById('save-milestone').addEventListener('click', () => {
                const amountInput = document.getElementById('milestone-amount').value;
                const name = document.getElementById('milestone-name').value;
                const amount = parseFloat(amountInput);
                
                if (!isNaN(amount) && amount > 0 && name) {
                    dataStore.addMilestone(amount, name);
                    ui.renderMilestones();
                    modal.classList.add('modal-hidden');
                    modal.classList.remove('modal-visible');
                } else {
                    alert('Please enter a valid amount and name');
                }
            });
        });
    }
}

function setupAddSalaryButton(dataStore, ui, chartManager) {
    const addSalaryBtn = document.getElementById('add-salary');
    if (addSalaryBtn) {
        // Remove any existing event listeners by cloning and replacing
        const newAddSalaryBtn = addSalaryBtn.cloneNode(true);
        addSalaryBtn.parentNode.replaceChild(newAddSalaryBtn, addSalaryBtn);
        
        // Add new event listener to the cloned button
        newAddSalaryBtn.addEventListener('click', () => {
            console.log('Add salary button clicked');
            
            // Get current date for the default value of the month input
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            
            // Create modal content
            const modalContent = `
                <h2>Add Salary Entry</h2>
                <div class="form-group">
                    <label for="salary-date">Date (Month/Year):</label>
                    <input type="month" id="salary-date" value="${currentMonth}" />
                </div>
                <div class="form-group">
                    <label for="salary-company">Company:</label>
                    <input type="text" id="salary-company" placeholder="Company name" />
                </div>
                <div class="form-group">
                    <label for="salary-amount">Salary (£):</label>
                    <input type="number" id="salary-amount" min="0" step="0.01" />
                </div>
                <div class="form-actions">
                    <button id="cancel-salary" class="cancel-btn">Cancel</button>
                    <button id="save-salary" class="save-btn">Add Salary</button>
                </div>
            `;
            
            // Use the enhanced showModal function (now using Toggle Modal technique)
            if (typeof window.showModal === 'function') {
                window.showModal(modalContent, 'add-salary');
                console.log('Using global showModal function - should be reliable now');
            } else {
                console.error('Global showModal function not found - this should not happen');
                alert('An error occurred. Please refresh the page and try again.');
            }
        });
    }
}

// Close modal when clicking the X or outside the modal
const closeModalBtn = document.querySelector('.close-modal');
const modalContainer = document.getElementById('modal-container');

if (closeModalBtn && modalContainer) {
    closeModalBtn.addEventListener('click', () => {
        // Hide the modal - add modal-hidden first, then remove modal-visible
        modalContainer.classList.add('modal-hidden');
        modalContainer.classList.remove('modal-visible');
    });
    
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            // Hide the modal - add modal-hidden first, then remove modal-visible
            modalContainer.classList.add('modal-hidden');
            modalContainer.classList.remove('modal-visible');
        }
    });
} 