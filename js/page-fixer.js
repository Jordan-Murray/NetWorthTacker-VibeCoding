// Page structure fixer - ensures proper HTML structure for sections

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check and fix section structure
    const main = document.querySelector('main');
    const sections = document.querySelectorAll('section');
    
    if (!main) {
        const newMain = document.createElement('main');
        document.body.appendChild(newMain);
    }
    
    // 2. Ensure all sections have IDs
    sections.forEach((section, index) => {
        if (!section.id) {
            section.id = `section-${index}`;
        }
        
        // Ensure section is a direct child of main
        if (section.parentElement.tagName !== 'MAIN') {
            main.appendChild(section);
        }
    });
    
    // 3. Create fixed navigation handler
    window.forceNavigate = function(targetId) {
        // Hide all sections
        sections.forEach(section => {
            section.style.display = 'none';
            section.classList.add('hidden-section');
            section.classList.remove('active-section');
        });
        
        // Show target section
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('active-section');
            targetSection.classList.remove('hidden-section');
            return true;
        } else {
            return false;
        }
    };
    
    // 4. Make sure navigation links exist
    const mainNav = document.getElementById('main-nav');
    if (mainNav) {
        const navLinks = mainNav.querySelectorAll('a');
        
        // Add missing click handlers if needed
        navLinks.forEach(link => {
            const targetId = link.getAttribute('href')?.substring(1);
            if (targetId) {
                // Add emergency click handler
                link.addEventListener('click', function(e) {
                    const success = window.forceNavigate(targetId);
                    if (success) {
                        e.preventDefault();
                    }
                });
            }
        });
    }
});

// Add emergency keyboard navigation
document.addEventListener('keydown', (e) => {
    // Alt+1 = Dashboard, Alt+2 = Assets-Liabilities, Alt+3 = Trends
    if (e.altKey) {
        let targetId = null;
        
        if (e.key === '1') targetId = 'dashboard';
        else if (e.key === '2') targetId = 'assets-liabilities';
        else if (e.key === '3') targetId = 'trends';
        
        if (targetId) {
            window.forceNavigate(targetId);
            e.preventDefault();
        }
    }
}); 