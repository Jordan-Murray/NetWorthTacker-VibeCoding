/**
 * Navigation Fix Script
 * This is a standalone script to ensure navigation works regardless of other JavaScript
 */

// Enhanced Navigation Fix
console.log('Navigation fix script loaded');

// Function to handle navigation
function handleNavigation(targetId) {
    console.log('Handling navigation to:', targetId);
    
    // Get all sections
    const allSections = document.querySelectorAll('main > section');
    
    // Hide all sections with multiple visibility methods
    allSections.forEach(section => {
        section.style.display = 'none';
        section.style.visibility = 'hidden';
        section.style.opacity = '0';
        section.classList.remove('active-section');
        section.classList.add('hidden-section');
    });
    
    // Get the target section
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
        console.log('Target section found:', targetId);
        
        // Show the target section with multiple visibility methods
        targetSection.style.display = 'block';
        targetSection.style.visibility = 'visible';
        targetSection.style.opacity = '1';
        targetSection.classList.remove('hidden-section');
        targetSection.classList.add('active-section');
        
        // Update document title to reflect current section
        const sectionTitle = targetId.replace(/-/g, ' ');
        document.title = `Net Worth Tracker - ${sectionTitle.charAt(0).toUpperCase() + sectionTitle.slice(1)}`;
        
        // Scroll to the section
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Log visibility status
        console.log('Section visibility:', 
            targetSection.style.display, 
            targetSection.style.visibility, 
            targetSection.style.opacity,
            targetSection.classList.contains('active-section')
        );
        
        // If showing dashboard, refresh the charts
        if (targetId === 'dashboard' && window.renderDashboardCharts) {
            console.log('Dashboard section activated, refreshing charts');
            setTimeout(() => {
                window.renderDashboardCharts();
            }, 100);
        }
        
        // If showing trends section, refresh the trend charts
        if (targetId === 'trends' && window.renderTrendsCharts) {
            console.log('Trends section activated, refreshing trend charts');
            
            // Try multiple times with increasing delays to ensure charts load
            setTimeout(() => {
                console.log('First attempt to render trend charts');
                window.renderTrendsCharts();
            }, 100);
            
            setTimeout(() => {
                console.log('Second attempt to render trend charts');
                window.renderTrendsCharts();
            }, 500);
            
            setTimeout(() => {
                console.log('Third attempt to render trend charts');
                window.renderTrendsCharts();
            }, 1000);
        }
        
        // Get all navigation links
        const navLinks = document.querySelectorAll('#main-nav a');
        
        // Update active link
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${targetId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    } else {
        console.error('Target section not found:', targetId);
        // If target section not found, default to dashboard
        if (targetId !== 'dashboard') {
            handleNavigation('dashboard');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing navigation');
    
    // Handle initial hash if present
    const initialHash = window.location.hash.substring(1) || 'dashboard';
    handleNavigation(initialHash);
    
    // Add click event listeners to navigation links
    const navLinks = document.querySelectorAll('#main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            const targetId = link.getAttribute('href').substring(1);
            console.log('Navigation link clicked:', targetId);
            
            // Update URL hash without triggering the hashchange event
            history.pushState(null, null, `#${targetId}`);
            
            // Handle navigation
            handleNavigation(targetId);
        });
    });
    
    // Listen for popstate (back/forward buttons)
    window.addEventListener('popstate', () => {
        const currentHash = window.location.hash.substring(1) || 'dashboard';
        console.log('Hash changed to:', currentHash);
        handleNavigation(currentHash);
    });
    
    // Ensure sections are correctly styled
    const allSections = document.querySelectorAll('main > section');
    allSections.forEach(section => {
        // Ensure all sections have minimum height
        section.style.minHeight = '80vh';
        
        // Initial hide for non-active sections
        if (section.id !== initialHash) {
            section.style.display = 'none';
            section.style.visibility = 'hidden';
            section.style.opacity = '0';
            section.classList.add('hidden-section');
        } else {
            section.classList.add('active-section');
        }
    });
    
    console.log('Navigation initialization complete');
}); 