// Page structure fixer - ensures proper HTML structure for sections
console.log('Page fixer script loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Running page structure diagnostics');
    
    // 1. Check and fix section structure
    const main = document.querySelector('main');
    const sections = document.querySelectorAll('section');
    
    if (!main) {
        console.error('Main element not found, creating one');
        const newMain = document.createElement('main');
        document.body.appendChild(newMain);
    }
    
    // Log section IDs for debugging
    console.log('Found sections:', Array.from(sections).map(s => s.id));
    
    // 2. Ensure all sections have IDs
    sections.forEach((section, index) => {
        if (!section.id) {
            console.warn(`Section at index ${index} has no ID, adding one`);
            section.id = `section-${index}`;
        }
        
        // Ensure section is a direct child of main
        if (section.parentElement.tagName !== 'MAIN') {
            console.warn(`Section ${section.id} is not a direct child of main, fixing`);
            main.appendChild(section);
        }
    });
    
    // 3. Create fixed navigation handler
    window.forceNavigate = function(targetId) {
        console.log('Force navigating to:', targetId);
        
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
            
            console.log(`Section "${targetId}" is now visible`);
            return true;
        } else {
            console.error(`Target section "${targetId}" not found`);
            return false;
        }
    };
    
    // 4. Make sure navigation links exist
    const mainNav = document.getElementById('main-nav');
    if (!mainNav) {
        console.error('Main navigation not found');
    } else {
        const navLinks = mainNav.querySelectorAll('a');
        console.log('Navigation links:', Array.from(navLinks).map(a => a.getAttribute('href')));
        
        // Add missing click handlers if needed
        navLinks.forEach(link => {
            const targetId = link.getAttribute('href')?.substring(1);
            if (targetId) {
                // Add emergency click handler
                link.addEventListener('click', function(e) {
                    console.log('Emergency navigation handler triggered for', targetId);
                    const success = window.forceNavigate(targetId);
                    if (success) {
                        e.preventDefault();
                    }
                });
            }
        });
    }
    
    // 5. Run structure check
    checkPageStructure();
});

// Detailed structure check with helpful log output
function checkPageStructure() {
    console.log('====== PAGE STRUCTURE DIAGNOSTIC ======');
    
    // Check main element
    const main = document.querySelector('main');
    console.log('Main element:', main ? 'Found' : 'MISSING');
    
    // Check sections
    const sections = document.querySelectorAll('section');
    console.log(`Found ${sections.length} sections`);
    
    sections.forEach(section => {
        console.log(`Section: ${section.id || 'NO ID'}
        - Parent: ${section.parentElement.tagName}
        - Display: ${getComputedStyle(section).display}
        - Visibility: ${getComputedStyle(section).visibility}
        - Height: ${getComputedStyle(section).height}
        - Classes: ${section.className}`);
    });
    
    // Check navigation
    const navLinks = document.querySelectorAll('#main-nav a');
    console.log(`Found ${navLinks.length} navigation links`);
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const targetId = href?.substring(1);
        const targetElement = targetId ? document.getElementById(targetId) : null;
        
        console.log(`Link: ${href}
        - Target exists: ${targetElement ? 'Yes' : 'NO'}
        - Active class: ${link.classList.contains('active')}`);
    });
    
    console.log('====== END DIAGNOSTIC ======');
}

// Add emergency keyboard navigation
document.addEventListener('keydown', (e) => {
    // Alt+1 = Dashboard, Alt+2 = Assets-Liabilities, Alt+3 = Trends
    if (e.altKey) {
        let targetId = null;
        
        if (e.key === '1') targetId = 'dashboard';
        else if (e.key === '2') targetId = 'assets-liabilities';
        else if (e.key === '3') targetId = 'trends';
        
        if (targetId) {
            console.log('Emergency keyboard navigation to', targetId);
            window.forceNavigate(targetId);
            e.preventDefault();
        }
    }
}); 