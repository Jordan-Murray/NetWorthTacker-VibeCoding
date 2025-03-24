/**
 * Navigation Fix Script
 * This is a standalone script to ensure navigation works regardless of other JavaScript
 */

// Enhanced Navigation Fix

// Function to handle navigation
function handleNavigation(targetId) {
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
        
        // If showing dashboard, refresh the charts
        if (targetId === 'dashboard' && window.renderDashboardCharts) {
            setTimeout(() => {
                window.renderDashboardCharts();
            }, 100);
        }
        
        // If showing trends section, refresh the trend charts
        if (targetId === 'trends' && window.renderTrendsCharts) {
            // Try multiple times with increasing delays to ensure charts load
            setTimeout(() => {
                window.renderTrendsCharts();
            }, 100);
            
            setTimeout(() => {
                window.renderTrendsCharts();
            }, 500);
            
            setTimeout(() => {
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
        // If target section not found, default to dashboard
        if (targetId !== 'dashboard') {
            handleNavigation('dashboard');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Handle initial hash if present
    const initialHash = window.location.hash.substring(1) || 'dashboard';
    handleNavigation(initialHash);
    
    // Add click event listeners to navigation links
    const navLinks = document.querySelectorAll('#main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            const targetId = link.getAttribute('href').substring(1);
            
            // Update URL hash without triggering the hashchange event
            history.pushState(null, null, `#${targetId}`);
            
            // Handle navigation
            handleNavigation(targetId);
        });
    });
    
    // Listen for popstate (back/forward buttons)
    window.addEventListener('popstate', () => {
        const currentHash = window.location.hash.substring(1) || 'dashboard';
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
}); 