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
}
