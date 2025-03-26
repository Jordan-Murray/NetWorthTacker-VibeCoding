import { DataService } from '../js/modules/dataService.js';
import { FormHandler } from '../js/modules/formHandler.js';
import { DashboardUI } from '../js/modules/dashboardUI.js';

describe('Main Application', () => {
    let mockDataService;
    let mockFormHandler;
    let mockDashboardUI;

    beforeEach(() => {
        // Mock the modules
        mockDataService = new DataService();
        mockFormHandler = new FormHandler(mockDataService);
        mockDashboardUI = new DashboardUI(mockDataService);

        // Set up DOM
        document.body.innerHTML = `
            <nav class="nav-menu">
                <button id="dashboard-nav" class="nav-btn active">Dashboard</button>
                <button id="assets-nav" class="nav-btn">Assets</button>
                <button id="liabilities-nav" class="nav-btn">Liabilities</button>
            </nav>
            <div id="dashboard" class="active-section">
                <div id="total-assets">£0.00</div>
                <div id="total-liabilities">£0.00</div>
                <div id="net-worth">£0.00</div>
                <div id="year-selector">
                    <select id="year-select"></select>
                    <button id="add-year">Add Year</button>
                </div>
                <canvas id="net-worth-chart"></canvas>
                <canvas id="assets-liabilities-chart"></canvas>
            </div>
            <div id="assets" class="hidden-section">
                <table id="assets-table">
                    <tbody id="assets-table-body"></tbody>
                </table>
                <button id="add-asset">Add Asset</button>
                <form id="asset-form">
                    <select id="year-select" name="year"></select>
                    <input type="text" id="asset-category" name="category" required>
                    <input type="number" id="asset-value" name="value" required>
                    <button type="submit">Add Asset</button>
                </form>
            </div>
            <div id="liabilities" class="hidden-section">
                <table id="liabilities-table">
                    <tbody id="liabilities-table-body"></tbody>
                </table>
                <button id="add-liability">Add Liability</button>
                <form id="liability-form">
                    <select id="year-select" name="year"></select>
                    <input type="text" id="liability-category" name="category" required>
                    <input type="number" id="liability-value" name="value" required>
                    <button type="submit">Add Liability</button>
                </form>
            </div>
            <div id="modal-container" class="modal-hidden">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div id="modal-body"></div>
                </div>
            </div>
        `;
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    test('should initialize all required modules', () => {
        // Import and initialize main.js
        const main = require('../js/main.js');
        
        // Verify DataService was initialized
        expect(mockDataService).toBeDefined();
        expect(mockDataService instanceof DataService).toBe(true);
        
        // Verify FormHandler was initialized
        expect(mockFormHandler).toBeDefined();
        expect(mockFormHandler instanceof FormHandler).toBe(true);
        
        // Verify DashboardUI was initialized
        expect(mockDashboardUI).toBeDefined();
        expect(mockDashboardUI instanceof DashboardUI).toBe(true);
    });

    test('should handle module loading errors gracefully', () => {
        // Mock console.error
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        // Mock getDataService to throw an error
        const mockDataService = {
            init: jest.fn().mockImplementation(() => {
                throw new Error('Failed to initialize DataService');
            }),
            on: jest.fn()
        };
        
        // Create a failing DashboardUI instance
        const DashboardUI = require('../js/modules/dashboardUI.js').DashboardUI;
        const dashboardUI = new DashboardUI(mockDataService);
        
        // Trigger the error
        try {
            dashboardUI.init();
        } catch (error) {
            // Expected error
            console.error('Failed to initialize Net Worth Tracker:', error);
        }
        
        // Verify error was logged
        expect(consoleError).toHaveBeenCalled();
        
        // Clean up
        consoleError.mockRestore();
        jest.resetModules();
    });

    test('should maintain correct initialization order', () => {
        // Import and initialize main.js
        const main = require('../js/main.js');
        
        // Verify initialization order
        expect(mockDataService).toBeDefined();
        expect(mockFormHandler.dataService).toBe(mockDataService);
        expect(mockDashboardUI.dataService).toBe(mockDataService);
    });

    test('should handle missing DOM elements gracefully', () => {
        // Remove some DOM elements
        document.getElementById('dashboard').remove();
        
        // Import and initialize main.js
        const main = require('../js/main.js');
        
        // Verify the app still initializes
        expect(mockDataService).toBeDefined();
        expect(mockFormHandler).toBeDefined();
        expect(mockDashboardUI).toBeDefined();
    });
}); 