// App Initializer - ensures data is loaded correctly

document.addEventListener('DOMContentLoaded', () => {
    // Check if data exists in localStorage
    const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
    
    // Initialize data if it doesn't exist
    if (!data.years || Object.keys(data.years).length === 0) {
        // Initialize with the current year
        const currentYear = new Date().getFullYear().toString();
        
        // Create data structure with default values
        const initialData = {
            years: {
                [currentYear]: {
                    assets: [],
                    liabilities: []
                }
            },
            milestones: [
                {
                    id: Date.now().toString(),
                    amount: 10000,
                    name: 'First £10,000',
                    achieved: false
                }
            ]
        };
        
        // Save to localStorage
        localStorage.setItem('netWorthData', JSON.stringify(initialData));
    }
    
    // Update year selector
    setTimeout(() => {
        updateYearSelector();
    }, 500);
    
    function updateYearSelector() {
        const yearSelect = document.getElementById('year-select');
        if (!yearSelect) {
            setTimeout(updateYearSelector, 500);
            return;
        }
        
        const data = JSON.parse(localStorage.getItem('netWorthData') || '{}');
        const years = data.years ? Object.keys(data.years) : [];
        
        if (years.length === 0) {
            return;
        }
        
        // Find the most recent year (highest number)
        const mostRecentYear = years.sort((a, b) => parseInt(b) - parseInt(a))[0];
        
        // Check if there are options already
        if (yearSelect.options.length > 0) {
            // Set to most recent year
            yearSelect.value = mostRecentYear;
            
            // Trigger change event to update UI
            yearSelect.dispatchEvent(new Event('change'));
        } else {
            // Check again after a short delay to see if options were added
            setTimeout(() => {
                if (yearSelect.options.length === 0) {
                    // Force adding years to the selector
                    years.forEach(year => {
                        const option = document.createElement('option');
                        option.value = year;
                        option.textContent = year;
                        yearSelect.appendChild(option);
                    });
                    
                    // Set to most recent year
                    yearSelect.value = mostRecentYear;
                    
                    // Trigger change event to update UI
                    yearSelect.dispatchEvent(new Event('change'));
                } else {
                    // Options were added by something else, just select the most recent
                    yearSelect.value = mostRecentYear;
                    yearSelect.dispatchEvent(new Event('change'));
                }
            }, 1000);
        }
    }
}); 