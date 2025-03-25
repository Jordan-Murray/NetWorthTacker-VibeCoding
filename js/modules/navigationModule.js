/**
 * Navigation Module
 * Handles all navigation and section display with robust techniques
 */

/**
 * Initialize navigation handling
 */
export function initNavigation() {
    // Ensure main element exists
    ensureMainExists();
    
    // Ensure all sections have IDs
    ensureSectionIds();
    
    // Set up navigation links
    setupNavigationLinks();
    
    // Handle initial navigation
    handleInitialNavigation();
    
    // Add keyboard navigation
    setupKeyboardNavigation();
}

/**
 * Ensure main element exists
 */
function ensureMainExists() {
    const main = document.querySelector('main');
    if (!main) {
        const newMain = document.createElement('main');
        document.body.appendChild(newMain);
        console.log('Created missing main element');
    }
}

/**
 * Ensure all sections have IDs
 */
function ensureSectionIds() {
    const main = document.querySelector('main');
    const sections = document.querySelectorAll('section');
    
    sections.forEach((section, index) => {
        if (!section.id) {
            section.id = `section-${index}`;
            console.log(`Added ID to section: ${section.id}`);
        }
        
        // Ensure section is a direct child of main
        if (section.parentElement.tagName !== 'MAIN') {
            main.appendChild(section);
            console.log(`Moved section ${section.id} to main`);
        }
    });
}

/**
 * Set up navigation links
 */
function setupNavigationLinks() {
    const navLinks = document.querySelectorAll('#main-nav a');
    
    navLinks.forEach(link => {
        // Create a new link to replace the old one to avoid multiple event listeners
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        newLink.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = newLink.getAttribute('href').substring(1);
            navigateToSection(targetId);
        });
    });
}

/**
 * Handle initial navigation based on URL hash
 */
function handleInitialNavigation() {
    const hash = window.location.hash;
    const targetId = hash ? hash.substring(1) : 'dashboard'; // Default to dashboard
    
    navigateToSection(targetId);
}

/**
 * Set up keyboard navigation
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Alt+1 = Dashboard, Alt+2 = Assets-Liabilities, Alt+3 = Trends
        if (e.altKey) {
            let targetId = null;
            
            if (e.key === '1') targetId = 'dashboard';
            else if (e.key === '2') targetId = 'assets-liabilities';
            else if (e.key === '3') targetId = 'trends';
            else if (e.key === '4') targetId = 'goals';
            else if (e.key === '5') targetId = 'salary-tracking';
            else if (e.key === '6') targetId = 'savings-tracking';
            else if (e.key === '7') targetId = 'budgeting';
            
            if (targetId) {
                navigateToSection(targetId);
                e.preventDefault();
            }
        }
    });
}

/**
 * Navigate to the specified section
 * @param {string} targetId - ID of the target section
 */
export function navigateToSection(targetId) {
    const targetSection = document.getElementById(targetId);
    const targetLink = document.querySelector(`#main-nav a[href="#${targetId}"]`);
    
    if (!targetSection) {
        console.error(`Target section not found: ${targetId}`);
        // Navigate to dashboard if target not found
        if (targetId !== 'dashboard') {
            navigateToSection('dashboard');
        }
        return;
    }
    
    // Update URL hash without triggering hashchange event
    if (history.pushState) {
        history.pushState(null, null, `#${targetId}`);
    } else {
        window.location.hash = targetId;
    }
    
    // Update active navigation item
    if (targetLink) {
        document.querySelectorAll('#main-nav a').forEach(link => link.classList.remove('active'));
        targetLink.classList.add('active');
    }
    
    // Show target section, hide others
    document.querySelectorAll('main > section').forEach(section => {
        if (section.id === targetId) {
            showSection(section);
        } else {
            hideSection(section);
        }
    });
    
    // Update document title
    updateDocumentTitle(targetId);
    
    // Update UI based on section
    updateUIForSection(targetId);
    
    // Dispatch navigation event
    const event = new CustomEvent('navigationChanged', {
        detail: { section: targetId }
    });
    document.dispatchEvent(event);
}

/**
 * Show a section with robust visibility techniques
 * @param {HTMLElement} section - Section to show
 */
function showSection(section) {
    section.classList.remove('hidden-section');
    section.classList.add('active-section');
    
    // Use multiple strategies for maximum compatibility
    section.style.display = 'block';
    section.style.visibility = 'visible';
    section.style.opacity = '1';
    section.style.height = 'auto';
    section.style.overflow = 'visible';
    section.style.transform = 'translateY(0)';
    section.style.pointerEvents = 'auto';
    
    // Scroll to the section
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Hide a section with robust visibility techniques
 * @param {HTMLElement} section - Section to hide
 */
function hideSection(section) {
    section.classList.add('hidden-section');
    section.classList.remove('active-section');
    
    // Use multiple strategies for maximum compatibility
    section.style.display = 'none';
    section.style.visibility = 'hidden';
    section.style.opacity = '0';
    section.style.height = '0';
    section.style.overflow = 'hidden';
    section.style.transform = 'translateY(20px)';
    section.style.pointerEvents = 'none';
}

/**
 * Update document title based on current section
 * @param {string} sectionId - ID of current section
 */
function updateDocumentTitle(sectionId) {
    const sectionTitle = sectionId.replace(/-/g, ' ');
    const formattedTitle = sectionTitle
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    document.title = `Net Worth Tracker - ${formattedTitle}`;
}

/**
 * Update UI based on current section
 * @param {string} sectionId - ID of current section
 */
function updateUIForSection(sectionId) {
    // Trigger section-specific UI updates
    switch(sectionId) {
        case 'dashboard':
            // Update dashboard charts
            if (typeof window.renderDashboardCharts === 'function') {
                setTimeout(() => {
                    window.renderDashboardCharts();
                }, 100);
            }
            break;
        case 'trends':
            // Update trends charts
            if (typeof window.renderTrendsCharts === 'function') {
                // Try multiple times with increasing delays to ensure charts load
                setTimeout(() => {
                    window.renderTrendsCharts();
                }, 100);
                
                setTimeout(() => {
                    window.renderTrendsCharts();
                }, 500);
            }
            break;
        // Add other section-specific updates as needed
    }
}

/**
 * Check if sections are properly styled
 */
export function checkSectionStyles() {
    const sections = document.querySelectorAll('main > section');
    
    sections.forEach(section => {
        // Ensure minimum height
        if (!section.style.minHeight) {
            section.style.minHeight = '80vh';
        }
        
        // Ensure proper visibility classes
        const isActive = !section.classList.contains('hidden-section');
        
        if (isActive) {
            if (!section.classList.contains('active-section')) {
                section.classList.add('active-section');
            }
        } else {
            if (!section.classList.contains('hidden-section')) {
                section.classList.add('hidden-section');
            }
        }
    });
}