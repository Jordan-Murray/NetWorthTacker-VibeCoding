/**
 * Router Module
 * Handles navigation between different sections of the application
 */
export class Router {
    constructor() {
        this.routes = {
            'dashboard': document.getElementById('dashboard'),
            'assets-liabilities': document.getElementById('assets-liabilities'),
            'trends': document.getElementById('trends')
        };
        
        // Bind methods
        this.handleHashChange = this.handleHashChange.bind(this);
        this.navigate = this.navigate.bind(this);
    }

    init() {
        // Set up hash change listener
        window.addEventListener('hashchange', this.handleHashChange);
        
        // Handle initial hash
        this.handleHashChange();
    }

    handleHashChange() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        this.navigate(hash);
    }

    navigate(section) {
        // If section doesn't exist, default to dashboard
        if (!this.routes[section]) {
            section = 'dashboard';
        }

        // Hide all sections
        Object.values(this.routes).forEach(sectionElement => {
            if (sectionElement) {
                sectionElement.classList.add('hidden-section');
                sectionElement.classList.remove('active-section');
            }
        });

        // Show selected section
        const targetSection = this.routes[section];
        if (targetSection) {
            targetSection.classList.remove('hidden-section');
            targetSection.classList.add('active-section');
            
            // Update active nav link
            const navLinks = document.querySelectorAll('#main-nav a');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${section}`) {
                    link.classList.add('active');
                }
            });

            // Dispatch navigation event
            document.dispatchEvent(new CustomEvent('navigationChanged', {
                detail: { section }
            }));
        }
    }
} 