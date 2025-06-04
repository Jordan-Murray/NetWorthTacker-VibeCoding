import { getDataStore } from './enhancedDataService.js';
import { formatCurrency, formatDate } from './utils.js';
import { updateSavingsDistributionChart, updateSavingsTimelineChart } from './chartModule.js';

/**
 * Initialize savings tracker UI
 */
export function initSavingsTrackerUI() {
    refreshSavingsTable();
    // expose for other modules
    window.refreshSavingsTable = refreshSavingsTable;

    setupPensionCalculator();

    // initial order update
    updateFinancialOrder();
}

/**
 * Refresh the savings table and summary for the current year
 * @param {string|number} [year] - Year to display
 */
export function refreshSavingsTable(year) {
    const dataStore = getDataStore();
    const yearSelect = document.getElementById('year-select');
    const currentYear = year || (yearSelect ? yearSelect.value : dataStore.getCurrentYear());
    const savings = dataStore.getSavings(parseInt(currentYear));
    const tbody = document.querySelector('#savings-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (savings.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="text-center">No savings recorded.</td>';
        tbody.appendChild(row);
    } else {
        const sorted = [...savings].sort((a, b) => new Date(b.date) - new Date(a.date));
        sorted.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(entry.date)}</td>
                <td>${formatCurrency(entry.amount)}</td>
                <td>${entry.category}</td>
                <td>${entry.notes || ''}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger delete-saving" data-id="${entry.id}">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>`;
            tbody.appendChild(row);
        });

        setupActionButtons(currentYear);
    }

    updateSummary(currentYear);
    updateSavingsDistributionChart();
    updateSavingsTimelineChart();
}

function setupActionButtons(year) {
    document.querySelectorAll('.delete-saving').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            if (confirm('Delete this saving entry?')) {
                const ds = getDataStore();
                ds.removeSavingEntry(parseInt(year), id);
                refreshSavingsTable(year);
            }
        });
    });
}

function updateSummary(year) {
    const dataStore = getDataStore();
    const avgElem = document.getElementById('monthly-savings-avg');
    const rateElem = document.getElementById('savings-rate');

    if (!avgElem || !rateElem) return;

    const avg = dataStore.getMonthlySavingsAverage(parseInt(year));
    const rate = dataStore.getSavingsRate(parseInt(year));

    avgElem.textContent = formatCurrency(avg);
    rateElem.textContent = `${rate.toFixed(1)}%`;

    updateFinancialOrder();
}

export function setupPensionCalculator() {
    const calcBtn = document.getElementById('calculate-savings');
    if (!calcBtn) return;

    calcBtn.addEventListener('click', () => {
        const personalInput = document.getElementById('personal-contribution');
        const employerInput = document.getElementById('employer-contribution');
        const goalInput = document.getElementById('emergency-fund-goal');

        const personal = parseFloat(personalInput?.value) || 0;
        const employer = parseFloat(employerInput?.value) || 0;
        const goalMonths = parseInt(goalInput?.value, 10) || 3;

        const ds = getDataStore();
        ds.setEmergencyFundGoal(goalMonths);

        const rate = ds.calculateSavingsPercentage(personal, employer);
        const rateElem = document.getElementById('savings-rate');
        if (rateElem) {
            rateElem.textContent = `${rate.toFixed(1)}%`;
        }

        const progressBar = document.getElementById('emergency-fund-progress');
        if (progressBar) {
            const progress = ds.getEmergencyFundProgress();
            progressBar.style.width = `${Math.min(100, progress).toFixed(0)}%`;
        }

        updateFinancialOrder();
    });
}

function updateFinancialOrder() {
    if (!document || typeof document.querySelectorAll !== 'function') return;

    const ds = getDataStore();
    const progress = ds.getEmergencyFundProgress();
    const steps = document.querySelectorAll('#financial-steps .step');
    if (!steps.length) return;

    steps.forEach(step => {
        step.classList.remove('active');
        step.classList.remove('completed');
    });

    if (progress >= 100) {
        steps[0].classList.add('completed');
        if (steps[1]) steps[1].classList.add('active');
    } else {
        steps[0].classList.add('active');
    }
}

